import https from 'https';
import express, { Router } from "express";
import cookieParser from "cookie-parser";
import cron from "node-cron";

import { config } from '../../../app.config.js';
import { log } from './instances.js';
import { db } from './databases/db.js';
import getEnv from '../../_common/helpers/getEnv.js';
import terminateApp from "../../_common/helpers/terminateApp.js";
import { corsMiddleware } from '../_common/middlewares/cors.middleware.js';
import { maintenanceMiddleware } from '../_common/middlewares/maintenance.middleware.js';
import userRoute from './routes/user.route.js';
import profileRoute from './routes/profile.route.js';
import inviteRoutes from './routes/invite.routes.js';
import interactionRoutes from './routes/interactions.routes.js';
import statisticsRoute from './routes/statistics.route.js';
import auditRoute from './routes/audit.route.js';

/* 
————————————————————————————————————————————————————————————————
Create server 
———————————————————————————————————————————————————————————————— 
*/

const app = express();
app.set("trust proxy", 1);
app.set('json spaces', 2);
const v2 = Router();

/* 
————————————————————————————————————————————————————————————————
Middlewares
———————————————————————————————————————————————————————————————— 
*/

app.use(express.json());
app.use(cookieParser());
app.use(corsMiddleware);
app.use(maintenanceMiddleware);

/* 
————————————————————————————————————————————————————————————————
Routes
———————————————————————————————————————————————————————————————— 
*/

app.use('/v2', v2);

v2.use('/users', userRoute);
v2.use('/profiles', profileRoute);
v2.use('/invites', inviteRoutes);
v2.use('/interactions', interactionRoutes);
v2.use('/statistics', statisticsRoute);
// v2.use('/audits', ); // For fetching audits
v2.use('/audit', auditRoute);

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