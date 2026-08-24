import path from "path";
import https from "https";
import express, { Response } from "express";
import cookieParser from "cookie-parser";
import cron from "node-cron";

import { config } from "../../../app.config.js";
import { log } from "./instances.js";
import getEnv from "../../_common/helpers/getEnv.js";
import terminateApp from "../../_common/helpers/terminateApp.js";
import { corsMiddleware } from "../_common/middlewares/cors.middleware.js";
import rateLimitMiddleware from "../_common/middlewares/rateLimit.middleware.js";
import healthRoute from "../_common/routes/health.route.js";

/* 
————————————————————————————————————————————————————————————————
Create instances 
———————————————————————————————————————————————————————————————— 
*/

const app = express();
app.set("trust proxy", 1);
app.set("json spaces", 2);

/* 
————————————————————————————————————————————————————————————————
Middlewares
———————————————————————————————————————————————————————————————— 
*/

app.use(express.json());
app.use(cookieParser());
app.use(corsMiddleware);
app.use(rateLimitMiddleware(240));

/* 
————————————————————————————————————————————————————————————————
Routes
———————————————————————————————————————————————————————————————— 
*/

app.use("/health", healthRoute);

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

// DEVELOPER NEEDED: EARLY-BETA CODE BELOW
/*

server.cdn.use("/uploads", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    express.static(folders.cdn.uploads)(req, res, (err) => {
        if (err) return next(err);
        // If file not found, redirect to fallback
        res.redirect(routes.fallback);
    });
});

server.cdn.get("/crop", async (req, res) => {
    const url = req.query.url;

    try {
        if (!url) {throw Object.assign(new Error(messages.error.field_validation), { code: 400 });}

        // Fetch and buffer the image
        const response = await fetch(url);
        const array = await response.arrayBuffer();
        const buffer = Buffer.from(array);

        // Convert image to a circle
        const image = await sharp(buffer).resize(500, 500).composite([{
            input: Buffer.from(`<svg><circle cx="250" cy="250" r="250"/></svg>`),
            blend: 'dest-in'
        }]).png().toBuffer();

        // Return the image
        res.set('Content-Type', 'image/png');
        res.send(image);
    } catch (error) {
        return res.status(500).send(error.message);
    }
});
*/

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