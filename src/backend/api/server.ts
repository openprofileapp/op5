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
import healthRoute from "../_common/routes/health.route.js";
import userRoutes from "./routes/user.routes.js";
import characterRoutes from "./routes/character.routes.js";
import pinRoutes from "./routes/pin.routes.js";
import inviteRoutes from "./routes/invite.routes.js";
import interactionRoutes from "./routes/interaction.routes.js";
import webPushRoute from "./routes/webPush.route.js";
import statisticsRoute from "./routes/statistics.route.js";
import auditRoute from "./routes/audit.route.js";
import usernamesRoute from "./routes/usernames.route.js";
import postregisterRoute from "./routes/postregister.route.js";

/* 
————————————————————————————————————————————————————————————————
Create server 
———————————————————————————————————————————————————————————————— 
*/

const app = express();
app.set("trust proxy", 1);
app.set("json spaces", 2);
const v3 = Router();

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
app.use("/v3", v3);

v3.use(
    "/users", 
    fetchSessionMiddleware, 
    rateLimitMiddleware(240), 
    userRoutes
);

v3.use(
    "/characters", 
    fetchSessionMiddleware, 
    rateLimitMiddleware(240), 
    characterRoutes
);

v3.use(
    "/pins", 
    fetchSessionMiddleware, 
    rateLimitMiddleware(240), 
    pinRoutes
);

// WARNING: Do NOT validate session here. It will cause a recursion with auth server
v3.use(
    "/invites", 
    rateLimitMiddleware(240), 
    inviteRoutes
);

v3.use(
    "/interactions", 
    fetchSessionMiddleware, 
    rateLimitMiddleware(30), 
    interactionRoutes
);

v3.use(
    "/webpush", 
    fetchSessionMiddleware, 
    rateLimitMiddleware(8), 
    webPushRoute
);

v3.use(
    "/statistics", 
    fetchSessionMiddleware, 
    rateLimitMiddleware(240), 
    statisticsRoute
);

v3.use(
    "/audit", 
    fetchSessionMiddleware, 
    rateLimitMiddleware(240), 
    auditRoute
);

v3.use(
    "/usernames", 
    rateLimitMiddleware(240), 
    usernamesRoute
);

v3.use(
    "/postregister", 
    rateLimitMiddleware(240), 
    postregisterRoute
);

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
