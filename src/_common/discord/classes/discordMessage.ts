import {
    TextChannel,
    DMChannel,
    NewsChannel,
    ThreadChannel,
    Client,
    Message,
} from "discord.js";

import { config } from "../../../../app.config.js";
import { Logger } from "kage-library";

export default class DiscordMessage {
    private readonly discord: Client;
    private readonly log: Logger;
    private readonly guildId: string;

    constructor(
        discord: Client,
        log: Logger,
        guildId: string = config.integrations.discord.guild.id,
    ) {
        this.discord = discord;
        this.log = log;
        this.guildId = guildId;
    }

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
    async send(
        channelId: string,
        content: object,
    ): Promise<Message | null> {
        try {
            const guild = await this.discord.guilds.fetch(this.guildId);

            if (!guild) {
                this.log.discord.error(`Guild "${this.guildId}" not found`);
                return null;
            }

            const channel = await guild.channels.fetch(channelId);

            if (!channel) {
                this.log.discord.error(`Channel "${channelId}" not found`);
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

            this.log.discord.error("Invalid channel type for sending messages");
            return null;
        } catch (error) {
            this.log.discord.error(error);
            return null;
        }
    }
}
