import https from 'https';
import express, { Router } from "express";
import cookieParser from "cookie-parser";
import cron from "node-cron";

import { 
    Database,
    Logger,
    Snowflake,
    WebClient,
    backupService
} from "kage-library";

import { config } from '../../../app.config.js';
import getEnv from '../../_common/helpers/getEnv.js';
import terminateApp from "../../_common/helpers/terminateApp.js";
import { corsMiddleware } from '../_common/middlewares/cors.middleware.js';
import { maintenanceMiddleware } from '../_common/middlewares/maintenance.middleware.js';
import userRoutes from './routes/user.routes.js';

/* 
————————————————————————————————————————————————————————————————
Connect databases
———————————————————————————————————————————————————————————————— 
*/

export const db = {
    metadata: new Database("data/databases/metadata.sqlite")
};

db.metadata.transaction((query) => {
    if (!query("SELECT * FROM metadata LIMIT 1").success) { query(`${config.folders.sql}/metadata.sql`); };
});

/* 
————————————————————————————————————————————————————————————————
Create instances 
———————————————————————————————————————————————————————————————— 
*/

const app = express();
app.set('json spaces', 2);
const v1 = Router();

export const log = new Logger({
    path: "/logs/api",
    useNerdFonts: config.useNerdFonts,
    saveAllToFile: config.debug.logger.api
});

export const snowflake = new Snowflake(config.generation.epoch);
export const wc = new WebClient({
    crawler: config.crawler,
    database: db.metadata,
    useSecureSSL: config.isProduction
});

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

app.use('/v1', v1);

v1.use('/users', userRoutes);

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
    backupService(config.folders.data, config.folders.backups);
});