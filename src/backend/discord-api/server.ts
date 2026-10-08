import https from "https";
import express, { Router } from "express";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import { Client, Events, GatewayIntentBits, ActivityType } from "discord.js";

import { parseDuration } from "kage-library";

import { config } from "../../../app.config.js";
import { discordMessage, log } from "./instances.js";
import getEnv from "../../_common/helpers/getEnv.js";
import terminateApp from "../../_common/helpers/terminateApp.js";
import { corsMiddleware } from "../_common/middlewares/cors.middleware.js";
import { maintenanceMiddleware } from "../_common/middlewares/maintenance.middleware.js";
import rateLimitMiddleware from "../_common/middlewares/rateLimit.middleware.js";
import healthRoute from "../_common/routes/health.route.js";
import whatIsRoute from "./routes/whatIs.route.js";

/* 
————————————————————————————————————————————————————————————————
Create server 
———————————————————————————————————————————————————————————————— 
*/

const app = express();
app.set("trust proxy", 1);
app.set("json spaces", 2);
const v1 = Router();

export const discord = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
    ] 
});

/* 
————————————————————————————————————————————————————————————————
Middlewares
———————————————————————————————————————————————————————————————— 
*/

app.use(
    express.json({ limit: "1mb" }),
    cookieParser(),
    corsMiddleware,
    maintenanceMiddleware
);

/* 
————————————————————————————————————————————————————————————————
Routes
———————————————————————————————————————————————————————————————— 
*/

app.use("/health", healthRoute);
app.use("/v3", v1);

v1.use(
    "/whatis", 
    rateLimitMiddleware(240), 
    whatIsRoute
);

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

    const activities =
        config.integrations.discord.presence.assistant.activity.text;

    let previousActivity: string | undefined;

    const updatePresence = () => {
        if (!activities?.length) return;

        const availableActivities =
            activities.length > 1
                ? activities.filter(
                      (activity) => activity !== previousActivity,
                  )
                : activities;

        const activity =
            availableActivities[
                Math.floor(Math.random() * availableActivities.length)
            ];

        previousActivity = activity;

        client.user.setPresence({
            status: config.integrations.discord.presence.assistant.status,
            activities: [
                {
                    name: activity,
                    type: ActivityType[
                        config.integrations.discord.presence.assistant.activity.type
                    ],
                },
            ],
        });

        const minDelay = parseDuration("10s");
        const maxDelay = parseDuration("60m");

        const delay =
            Math.floor(
                Math.random() * (maxDelay - minDelay + 1),
            ) + minDelay;

        setTimeout(updatePresence, delay);
    };

    updatePresence();
});

await discord.login(getEnv("INTEGRATION_DISCORD_ASSISTANT_BOT_TOKEN") as string);

/* 
————————————————————————————————————————————————————————————————
Start server
———————————————————————————————————————————————————————————————— 
*/

const server = https.createServer(getEnv("SSL") as object, app);
const port = config.ports.discord_api

server.listen(port, "0.0.0.0", () => {
    log.server.info(`Server online at https://localhost:${port}`);
});

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

await discordMessage.send("1514196888138678392", {
    content: "Test",
});
