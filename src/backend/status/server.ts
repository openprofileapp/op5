import https from "https";
import express, { Router } from "express";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "http";

import { config } from "../../../app.config.js";
import { log } from "./instances.js";
import getEnv from "../../_common/helpers/getEnv.js";
import terminateApp from "../../_common/helpers/terminateApp.js";
import createViteServer from "../_common/helpers/createViteServer.js";
import { corsMiddleware } from "../_common/middlewares/cors.middleware.js";
import { maintenanceMiddleware } from "../_common/middlewares/maintenance.middleware.js";
import rateLimitMiddleware from "../_common/middlewares/rateLimit.middleware.js";
import statusRoute from "./routes/status.route.js";

/* 
————————————————————————————————————————————————————————————————
Create server 
———————————————————————————————————————————————————————————————— 
*/

const app = express();
app.set("trust proxy", 1);
app.set("json spaces", 2);
const router = Router();

const vitePort = config.ports.ws.status
export const vite = await createViteServer({
    isProduction: config.isProduction,
    host: config.domains.status,
    port: vitePort,
    ssl: getEnv("SSL"),
    root: "src/frontend",
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
app.use(rateLimitMiddleware(240));

/* 
————————————————————————————————————————————————————————————————
Routes
———————————————————————————————————————————————————————————————— 
*/

app.use("/", router);

router.use("/", statusRoute);

/* 
————————————————————————————————————————————————————————————————
Start server
———————————————————————————————————————————————————————————————— 
*/

const server = https.createServer(getEnv("SSL"), app);
const port = config.ports.status

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