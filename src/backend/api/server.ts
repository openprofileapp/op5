import https from "https";
import express, { Router } from "express";
import cookieParser from "cookie-parser";
import cron from "node-cron";

import { config } from "../../../app.config.js";
import { log } from "./instances.js";
import { db } from "./databases/db.js";
import getEnv from "../../_common/helpers/getEnv.js";
import terminateApp from "../../_common/helpers/terminateApp.js";
import { corsMiddleware } from "../_common/middlewares/cors.middleware.js";
import { maintenanceMiddleware } from "../_common/middlewares/maintenance.middleware.js";
import { fetchSessionMiddleware } from "./middlewares/fetchSession.middleware.js";
import rateLimitMiddleware from "../_common/middlewares/rateLimit.middleware.js";
import userRoutes from "./routes/user.routes.js";
import inviteRoutes from "./routes/invite.routes.js";
import interactionRoutes from "./routes/interaction.routes.js";
import healthRoute from "../_common/routes/health.route.js";
import characterRoutes from "./routes/character.routes.js";
import webPushRoute from "./routes/webPush.route.js";
import getUsersService from "./services/getUsers.service.js";
import { parseJson } from "../_common/helpers/parseJson.js";
import getInteractionsService from "./services/getInteractions.service.js";
import statisticsRoute from "./routes/statistics.route.js";

/* 
————————————————————————————————————————————————————————————————
Create server 
———————————————————————————————————————————————————————————————— 
*/

const app = express();
app.set("trust proxy", 1);
app.set("json spaces", 2);
const v2 = Router();

/* 
————————————————————————————————————————————————————————————————
Middlewares
———————————————————————————————————————————————————————————————— 
*/

app.use(
    express.json(),
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
app.use("/v2", v2);

v2.use(
    "/users", 
    fetchSessionMiddleware, 
    rateLimitMiddleware(240), 
    userRoutes
);

/*v2.use(
    "/pins", 
    fetchSessionMiddleware, 
    rateLimitMiddleware(240), 
    pinRoutes
);*/

// ADD A ACCESS TOKEN CHECK MIDDLEWARE middleware(access OR ApiSecret)

v2.use("/characters", fetchSessionMiddleware, rateLimitMiddleware(240), characterRoutes);

// WARNING: Do NOT validate session here. It will cause a recursion with auth servers
v2.use("/invites", rateLimitMiddleware(240), inviteRoutes); 

v2.use("/interactions", fetchSessionMiddleware, rateLimitMiddleware(30), interactionRoutes);
v2.use("/webpush", fetchSessionMiddleware, rateLimitMiddleware(8), webPushRoute);
v2.use("/statistics", fetchSessionMiddleware, rateLimitMiddleware(240), statisticsRoute);
// v2.use("/audits", ); // For fetching audits
//v2.use("/audit", fetchSessionMiddleware, rateLimitMiddleware(240), auditRoute); // post.audits???
//v2.use("/random", fetchSessionMiddleware, rateLimitMiddleware(240), randomRoutes);
// DEVELOPER NEEDED: Add /themes
// DEVELOPER NEEDED: Set up live-template saving. The 2MB is cause the limit could be a bit large? Experiment on this a bit
// v2.use("/templates", express.json({ limit: "2mb" }), fetchSessionMiddleware, rateLimitMiddleware(240), randomRoutes);
// 

// DEVELOPER NEEDED: When editing your profile, assign interests based on your uploaded content and user tags,
// This should assist with getting a head start in what you'd like to see

// MAYBE ADD INTERESTS ROUTE; /v2/interests/USER_ID?top=5 (ONLY LOGGED IN USER CAN GET THEIR INTERESTS)

/* 
————————————————————————————————————————————————————————————————
Start server
———————————————————————————————————————————————————————————————— 
*/

const server = https.createServer(getEnv("SSL") as object, app);
const port = config.ports.api

server.listen(port, "0.0.0.0", () => {
    log.server.info(`Server online at https://localhost:${port}`);
});

process.once("SIGTERM", () => terminateApp(log, db));
process.once("SIGINT", () => terminateApp(log, db));

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

/*
const user = getUsersService({
    id: "5019646586243236",
    getAs: "5719552362357773"
})

log.unknown.info(user).save()
*/
/*const character = getPublishedCharactersService({
    id: "6587823496323314",
    getAs: "5719552362357773"
})

log.unknown.info(character).save()
*//*
const interactions = getInteractionsService({
    includeItems: true,
    ownerId: "5719552362357773",
    getAs: "5719552362357773"
})

log.unknown.info(parseJson(interactions)).save()
*/
