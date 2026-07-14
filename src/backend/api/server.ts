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
import userRoute from "./routes/user.routes.js";
import profileRoute from "./routes/profile.route.js";
import inviteRoutes from "./routes/invite.routes.js";
import interactionRoutes from "./routes/interactions.routes.js";
import statisticsRoute from "./routes/statistics.route.js";
import auditRoute from "./routes/audit.route.js";
import healthRoute from "../_common/routes/health.route.js";

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
    userRoute
);



// ADD A ACCESS TOKEN CHECK MIDDLEWARE middleware(access OR ApiSecret)


v2.use("/profiles", fetchSessionMiddleware, rateLimitMiddleware(240), profileRoute);
v2.use("/invites", rateLimitMiddleware(240), inviteRoutes); // DEV NOTE: Session fetch disable due to validation recursion on auth. It needs to be fixed to allow access to stats to authed users. But not when checking invites
v2.use("/interactions", fetchSessionMiddleware, rateLimitMiddleware(240), interactionRoutes);
v2.use("/statistics", fetchSessionMiddleware, rateLimitMiddleware(240), statisticsRoute);
// v2.use("/audits", ); // For fetching audits
v2.use("/audit", fetchSessionMiddleware, rateLimitMiddleware(240), auditRoute); // post.audits???

/* 
————————————————————————————————————————————————————————————————
Start server
———————————————————————————————————————————————————————————————— 
*/

const server = https.createServer(getEnv("SSL"), app);
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