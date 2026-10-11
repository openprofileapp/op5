import { Stopwatch } from "@sapphire/stopwatch";

import { discord, discordRoles, log, wc } from "../instances.js";
import { config } from "../../../../app.config.js";
import getEnv from "../../../_common/helpers/getEnv.js";
import { WhatIsType } from "../../../_common/types/whatIs.type.js";
import { parseDuration } from "kage-library";

interface Props {
    isConnected: boolean;
    openprofileUserId: string;
}

export default async function syncRoles() {
    const sw = new Stopwatch();

    sw.start();
    
    log.discord.info("Started syncing roles...");

    const guild = await discord.guilds.fetch(config.integrations.discord.guild.id);

    if (!guild) return;

    const members = await guild.members.fetch();

    const sleep = (ms: number) =>
        new Promise<void>((resolve) => setTimeout(resolve, ms)
    );

    for (const member of members.values()) {
        try {
            const authResponse: Props = await wc.callAPI(
                `https://${config.domains.auth}/integration/get/discord/${member.id}`,
                { auth: `ApiSecret ${getEnv("API_SECRET")}` }
            );

            if (!authResponse.isConnected) continue;

            const whatIsResponse: WhatIsType = await wc.callAPI(
                `https://${config.domains.api}/v3/whatis/${authResponse.openprofileUserId}`,
                { auth: `ApiSecret ${getEnv("API_SECRET")}` }
            );

            if (whatIsResponse.isPremium) {
                await discordRoles.add(
                    member.id, 
                    config.integrations.discord.roles.premium
                );

                log.discord.info(`Added Premium role to ${member.displayName} (${member.id})`).tree(1);
            } else {
                await discordRoles.remove(
                    member.id, 
                    config.integrations.discord.roles.premium
                );

                log.discord.info(`Removed Premium role to ${member.displayName} (${member.id})`).tree(1);
            }
        } catch (error) {
            log.discord.error(error).save();
        } finally {
            await sleep(parseDuration("1s"));
        }
    }

    sw.stop();

    log.discord.info(`Took ${sw.toString()}`).tree(1).end();
}
