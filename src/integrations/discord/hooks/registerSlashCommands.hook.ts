/* eslint-disable */

import * as pkg from "discord.js";
const { Collection, REST, Routes } = pkg;

import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

import { I18nService } from "kage-library";

import { config } from "../../../../app.config.js";
import getEnv from "../../../_common/helpers/getEnv.js";
import { discord, log } from "../client.js";

type Command = {
    data: pkg.SlashCommandBuilder;
    execute: (interaction: pkg.ChatInputCommandInteraction) => Promise<void>;
    autocomplete?: (interaction: pkg.AutocompleteInteraction) => Promise<void>;
    button?: (interaction: pkg.ButtonInteraction) => Promise<void>;
    enabled?: boolean;
};

function getCommandFiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    return entries.flatMap(entry => {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            return getCommandFiles(fullPath);
        }

        if (
            entry.name.endsWith(".command.ts") ||
            entry.name.endsWith(".command.js")
        ) {
            return [fullPath];
        }

        return [];
    });
}

export default async function registerSlashCommands() {
    const commandsCollection = new Collection<string, Command>();
    const commandsArray: any[] = [];

    const commandFiles = getCommandFiles(config.folders.commands);

    for (const commandPath of commandFiles) {
        try {
            
            const commandModule = await import(
                pathToFileURL(commandPath).href
            );

            const command: Command = commandModule.default;

            if (command.enabled === false) {
                log.cmd.warn(`Skipping disabled command: ${command.data?.name ?? commandPath}`);
                continue;
            }

            if (!command?.data || !command?.execute) {
                log.cmd.warn(`Command ${command.data?.name ?? commandPath} is missing executable`);
                continue;
            }

            commandsCollection.set(command.data.name, command);
            commandsArray.push(command.data.toJSON());
        } catch (err) {
            log.cmd.error(`Failed to load command: ${commandPath}`);
            log.cmd.error(err);
        }
    }

    (discord as any).commands = commandsCollection;

    const rest = new REST({ version: "10" }).setToken(
        getEnv(
            config.isProduction
                ? "INTEGRATION_DISCORD_BOT_TOKEN"
                : "INTEGRATION_DISCORD_DEV_BOT_TOKEN"
        )
    );

    try {
        await rest.put(
            Routes.applicationGuildCommands(
                getEnv(
                    config.isProduction
                        ? "INTEGRATION_DISCORD_CLIENT_ID"
                        : "INTEGRATION_DISCORD_DEV_CLIENT_ID"
                ),
                config.integrations.discord.guild.id
            ),
            { body: commandsArray }
        );

        if (commandsCollection.size > 0) {
            log.cmd.info(
                `Registered ${commandsCollection.size} slash command${
                    commandsCollection.size !== 1 ? "s" : ""
                }`
            );
        }
    } catch (error) {
        log.cmd.error(error);
    }

    discord.on("interactionCreate", async (interaction) => {
        try {
            if (interaction.isChatInputCommand()) {
                const command = (discord as any).commands.get(
                    interaction.commandName
                );
                if (!command) return;

                await command.execute(interaction);
            } 
            else if (interaction.isAutocomplete()) {
                const command = (discord as any).commands.get(
                    interaction.commandName
                );

                if (command?.autocomplete) {
                    await command.autocomplete(interaction);
                }
            } 
            else if (interaction.isButton()) {
                const command = [...(discord as any).commands.values()].find(
                    cmd =>
                        cmd.button &&
                        interaction.message.interaction?.commandName ===
                            cmd.data.name
                );

                if (command?.button) {
                    await command.button(interaction);
                }
            }
        } catch (err) {
            const i18n = await I18nService.load({
                localesPath: "/assets/locales",
                locale: "en",
                defaultLocale: config.metadata.locale
            });

            log.cmd.error(err);

            if (interaction.isRepliable() && !interaction.replied) {
                await interaction.reply({
                    content: i18n.t("responses.failedCommand"),
                    ephemeral: true
                });
            }
        }
    });
}