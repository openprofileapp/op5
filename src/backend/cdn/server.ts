import path from 'path';
import https from 'https';
import express, { Response } from "express";
import cookieParser from "cookie-parser";
import cron from "node-cron";

import { 
    Logger,
} from "kage-library";

import { config } from '../../../app.config.js';
import getEnv from '../../_common/helpers/getEnv.js';
import terminateApp from "../../_common/helpers/terminateApp.js";
import { corsMiddleware } from '../_common/middlewares/cors.middleware.js';

/* 
————————————————————————————————————————————————————————————————
Create instances 
———————————————————————————————————————————————————————————————— 
*/

const app = express();
app.set('json spaces', 2);

export const log = new Logger({
    path: "/logs/cdn",
    useNerdFonts: config.useNerdFonts,
    saveAllToFile: config.debug.logger.cdn
});

/* 
————————————————————————————————————————————————————————————————
Middlewares
———————————————————————————————————————————————————————————————— 
*/

app.use(express.json());
app.use(cookieParser());
app.use(corsMiddleware);

/* 
————————————————————————————————————————————————————————————————
Routes
———————————————————————————————————————————————————————————————— 
*/

app.use("/", express.static(path.join(config.folders.public), 
    {
        immutable: true,
        maxAge: "30d",
        setHeaders: (res: Response) => {
            res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
            res.setHeader("Cache-Control", "public, max-age=2592000");
        }
    }
));

app.use("/uploads", express.static(path.join(config.folders.data, "uploads"),
    { 
        maxAge: "7d",
        setHeaders: (res) => {
            res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
            res.setHeader("Cache-Control", "public, max-age=604800");
        }
    }
));

/* 
————————————————————————————————————————————————————————————————
Start server
———————————————————————————————————————————————————————————————— 
*/

const server = https.createServer(getEnv("SSL"), app);
const port = config.ports.cdn

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