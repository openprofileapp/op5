import { Client } from "discord.js";
import { Logger } from "kage-library";

export default class DiscordRoles {
    private readonly discord: Client;
    private readonly log: Logger;
    private readonly guildId: string;

    constructor(
        discord: Client,
        log: Logger,
        guildId: string,
    ) {
        this.discord = discord;
        this.log = log;
        this.guildId = guildId;
    }

    /**
     * Adds a role to a Discord guild member.
     *
     * @param userId - The ID of the user to add the role to
     * @param roleId - The ID of the role to add
     *
     * @returns True if successful, false otherwise
     *
     * @example
     * await discordRoles.add(userId, roleId);
     */
    async add(
        userId: string,
        roleId: string,
    ): Promise<boolean> {
        try {
            const guild = await this.discord.guilds.fetch(this.guildId);

            if (!guild) {
                this.log.discord.error(`Guild "${this.guildId}" not found`).save();

                return false;
            }

            const member = await guild.members.fetch(userId);

            if (!member) {
                this.log.discord.error(`Member "${userId}" not found`).save();

                return false;
            }

            if (!member.roles.cache.has(roleId)) {
                await member.roles.add(roleId);
            }

            return true;
        } catch (error) {
            this.log.discord.error(error).save();

            return false;
        }
    }

    /**
     * Removes a role from a Discord guild member.
     *
     * @param userId - The ID of the user to remove the role from
     * @param roleId - The ID of the role to remove
     *
     * @returns True if successful, false otherwise
     *
     * @example
     * await discordRoles.remove(userId, roleId);
     */
    async remove(
        userId: string,
        roleId: string,
    ): Promise<boolean> {
        try {
            const guild = await this.discord.guilds.fetch(this.guildId);

            if (!guild) {
                this.log.discord.error(`Guild "${this.guildId}" not found`).save();

                return false;
            }

            const member = await guild.members.fetch(userId);

            if (!member) {
                this.log.discord.error(`Member "${userId}" not found`).save();

                return false;
            }

            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(roleId);
            }

            return true;
        } catch (error) {
            this.log.discord.error(error).save();
            
            return false;
        }
    }
}
