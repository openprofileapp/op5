import { Client, Events, GatewayIntentBits, ActivityType } from "discord.js";
import cron from "node-cron";

import { 
    Logger,
    Snowflake,
    WebClient
} from "kage-library";

import { config } from "../../../app.config.js"
import getEnv from "../../_common/helpers/getEnv.js"
import terminateApp from "../../_common/helpers/terminateApp.js";
import registerSlashCommands from "./hooks/registerSlashCommands.hook.js";
import registerMessageCreate from "./hooks/registerMessageCreate.hook.js";

/* 
————————————————————————————————————————————————————————————————
Create instances 
———————————————————————————————————————————————————————————————— 
*/

export const discord = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ] 
});

export const log = new Logger({
    path: "/logs/integrations",
    useNerdFonts: config.useNerdFonts,
    saveAllToFile: config.debug.logger.main
});

export const snowflake = new Snowflake(config.generation.epoch);
export const wc = new WebClient({
    crawler: config.crawler,
    useSecureSSL: config.isProduction
});

/* 
————————————————————————————————————————————————————————————————
Client
———————————————————————————————————————————————————————————————— 
*/

discord.once(Events.ClientReady, async (client) => {
    if (config.isProduction) { 
        // Mark Discord bot hosting servers (e.g, BisectHosting) as ONLINE
        log.network.info("successfully finished startup"); // Must be all lowercase
    }
    
    log.discord.info(`Client logged in as ${client.user.tag}`);

    // Register hooks
    await registerSlashCommands();
    registerMessageCreate();

    // Update presence
    client.user.setPresence({
        status: config.integrations.discord.presence.status,
        activities: [
            {
                name: config.integrations.discord.presence.activity.text,
                type: ActivityType[config.integrations.discord.presence.activity.type],
            }
        ]
    });
});

discord.login(getEnv(config.isProduction ? "INTEGRATION_DISCORD_BOT_TOKEN" : "INTEGRATION_DISCORD_DEV_BOT_TOKEN"));

process.once("SIGTERM", () => terminateApp(log));
process.once("SIGINT", () => terminateApp(log));

/* 
————————————————————————————————————————————————————————————————
Scheduled events
———————————————————————————————————————————————————————————————— 
*/

// Run everyday at midnight
cron.schedule("0 0 * * *", () => {
    log.cron.info("Running daily tasks...");
    log.cleanLogs();
});