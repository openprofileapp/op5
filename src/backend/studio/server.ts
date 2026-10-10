import https from "https";
import express, { Router } from "express";
import cookieParser from "cookie-parser";
import cron from "node-cron";

import { config } from "../../../app.config.js";
import { log } from "./instances.js";
import getEnv from "../../_common/helpers/getEnv.js";
import terminateApp from "../../_common/helpers/terminateApp.js";
import createViteServer from "../_common/helpers/createViteServer.js";
import { corsMiddleware } from "../_common/middlewares/cors.middleware.js";
import { maintenanceMiddleware } from "../_common/middlewares/maintenance.middleware.js";
import rateLimitMiddleware from "../_common/middlewares/rateLimit.middleware.js";
import appRoute from "./routes/app.route.js";
import path from "path";

/* 
————————————————————————————————————————————————————————————————
Create server 
———————————————————————————————————————————————————————————————— 
*/

const app = express();
app.set("trust proxy", 1);
app.set("json spaces", 2);
const router = Router();

const vitePort = config.ports.ws.studio
export const vite = await createViteServer({
    isProduction: config.isProduction,
    host: config.domains.studio,
    port: vitePort,
    ssl: getEnv("SSL") as object,
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

if (!vite) app.use(express.static(path.join(config.folders.root, "src", "frontend")));

app.use("/", router);

router.use("/", appRoute);

/* 
————————————————————————————————————————————————————————————————
Start server
———————————————————————————————————————————————————————————————— 
*/

const server = https.createServer(getEnv("SSL") as object, app);
const port = config.ports.studio

server.listen(port, "0.0.0.0", () => {
    log.server.info(`Server online at https://localhost:${port}`);
    if (vite) log.server.info(`Vite online at wss://localhost:${vitePort}`);
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
