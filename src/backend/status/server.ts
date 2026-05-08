import https from 'https';
import express, { Router } from "express";
import cookieParser from "cookie-parser";
import cron from "node-cron";

import { 
    Logger,
} from "kage-library";

import { config } from '../../../app.config.js';
import getEnv from '../../_common/helpers/getEnv.js';
import terminateApp from "../../_common/helpers/terminateApp.js";
import { corsMiddleware } from '../_common/middlewares/cors.middleware.js';
import { maintenanceMiddleware } from '../_common/middlewares/maintenance.middleware.js';
import statusRoute from './routes/status.route.js';

/* 
————————————————————————————————————————————————————————————————
Create instances 
———————————————————————————————————————————————————————————————— 
*/

const app = express();
app.set('json spaces', 2);
const router = Router();

export const log = new Logger({
    path: "/logs/status",
    useNerdFonts: config.useNerdFonts,
    saveAllToFile: config.debug.logger.status
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

app.use('/', router);

router.use('/', statusRoute);

/* 
————————————————————————————————————————————————————————————————
Start server
———————————————————————————————————————————————————————————————— 
*/

const server = https.createServer(getEnv("SSL"), app);
const port = config.ports.status

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