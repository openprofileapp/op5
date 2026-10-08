import { Events, ActivityType } from "discord.js";
import cron from "node-cron";

import { config } from "../../../app.config.js"
import getEnv from "../../_common/helpers/getEnv.js"
import { discord, log } from "./instances.js";
import terminateApp from "../../_common/helpers/terminateApp.js";
import registerSlashCommands from "./hooks/registerSlashCommands.hook.js";
import registerMessageCreate from "./hooks/registerMessageCreate.hook.js";

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

discord.login(getEnv("INTEGRATION_DISCORD_BOT_TOKEN") as string);

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
