import { TextChannel, DMChannel, NewsChannel, ThreadChannel } from "discord.js";

import { discord, log } from "../client.js";
import { config } from "../../../../app.config.js";

/**
 * Sends a message to a Discord channel by ID.
 *
 * @param channelId - The ID of the channel to send the message to
 * @param content - The message payload (string, embed, or message options)
 *
 * @returns The sent message, or null if failed
 *
 * @example
 * await sendDiscordMessage("123456789012345678", {
 *   content: "Hello world!"
 * });
 *
 * @throws Will log an error if the guild or channel is not found
 */
export default async function sendDiscordMessage(channelId: string, content: object) {

    try {
        const guild = await discord.guilds.fetch(config.integrations.discord.guild.id);
        if (!guild) { 
            log.discord.error(`Guild "${config.integrations.discord.guild.id}" not found`);
            return null;
        }

        const channel = await guild.channels.fetch(channelId);

        if (!channel) {
            log.discord.error(`Channel "${channelId}" not found`);
            return null;
        }

        if (
            channel instanceof TextChannel ||
            channel instanceof NewsChannel ||
            channel instanceof ThreadChannel ||
            channel instanceof DMChannel
        ) {
            return await channel.send(content);
        }

        log.discord.error("Invalid channel type for sending messages");
        return null;
    } catch (error) {
        log.discord.error(error);
    }
}