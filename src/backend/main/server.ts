import https from "https";
import express, { Router } from "express";
import { WebSocket, WebSocketServer } from "ws";
import cookieParser from "cookie-parser";
import { IncomingMessage } from "http";
import cron from "node-cron";
import path from "path";

import { 
    Logger,
} from "kage-library";

import { config } from "../../../app.config.js";
import getEnv from "../../_common/helpers/getEnv.js";
import terminateApp from "../../_common/helpers/terminateApp.js";
import createViteServer from "../_common/helpers/createViteServer.js";
import { corsMiddleware } from "../_common/middlewares/cors.middleware.js";
import { maintenanceMiddleware } from "../_common/middlewares/maintenance.middleware.js";
import appRoute from "./routes/app.route.js";
import commonRoutes from "../_common/routes/common.routes.js";

/* 
————————————————————————————————————————————————————————————————
Create instances 
———————————————————————————————————————————————————————————————— 
*/

const app = express();
app.set("json spaces", 2);
const router = Router();

const vitePort = config.ports.ws.main
export const vite = await createViteServer({
    isProduction: config.isProduction,
    host: config.domains.main,
    port: vitePort,
    ssl: getEnv("SSL"),
    root: "src/frontend",
});

export const log = new Logger({
    path: "/logs/main",
    useNerdFonts: config.useNerdFonts,
    saveAllToFile: config.debug.logger.main
});

/* 
————————————————————————————————————————————————————————————————
Middlewares
———————————————————————————————————————————————————————————————— 
*/

app.use(express.json());
app.use(cookieParser());
if (vite) app.use(vite.middlewares);
app.use(corsMiddleware);
app.use(maintenanceMiddleware);

/* 
————————————————————————————————————————————————————————————————
Routes
———————————————————————————————————————————————————————————————— 
*/

if (!vite) app.use(express.static(path.join(config.folders.root, "src", "frontend")));

app.use("/", router);

router.use("/", commonRoutes);
router.use("/", appRoute);

/* 
————————————————————————————————————————————————————————————————
Start server
———————————————————————————————————————————————————————————————— 
*/

const server = https.createServer(getEnv("SSL"), app);
const port = config.ports.main

server.listen(port, "0.0.0.0", () => {
    log.server.info(`Server online at https://localhost:${port}`);
    if (vite) log.server.info(`Vite online at wss://localhost:${vitePort}`);
});

process.once("SIGTERM", () => terminateApp(log));
process.once("SIGINT", () => terminateApp(log));

/* 
————————————————————————————————————————————————————————————————
Websocket
———————————————————————————————————————————————————————————————— 
*/

const connectedClients = new Map<string, WebSocket>();

const wss = new WebSocketServer({ server });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const clientId = crypto.randomUUID();

    ws.id = clientId;

    log.ws.info("Client connected:", ws.id);

    connectedClients.set(clientId, ws);

    ws.on("message", (message: WebSocket.RawData) => {
        let data;

        try {
            data = JSON.parse(message.toString());
        } catch {
            log.ws.error("Invalid JSON").save();
            return;
        }

        log.ws.info(`Received from ${ws.id}:`, data);

        if (data.status === "ready") {
            ws.send(JSON.stringify({ message: "connected" }));
        }
    });

    ws.on("close", () => {
        connectedClients.delete(clientId);
        log.ws.info("Client disconnected:", ws.id);
    });

    ws.on("error", () => {
        log.ws.error("Client crashed:", ws.id).save();
        connectedClients.delete(clientId);
    });
});

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