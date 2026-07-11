import https from "https";
import httpProxy from "http-proxy";
import { IncomingMessage, ServerResponse } from "http";
import cron from "node-cron";

import { 
    Logger,
    I18nService,
    backupService
} from "kage-library";

import { config } from "./app.config.js";
import getEnv from "./src/_common/helpers/getEnv.js";
import terminateApp from "./src/_common/helpers/terminateApp.js";

const log = new Logger({
    path: "/logs", 
    useNerdFonts: config.useNerdFonts
});

/* 
————————————————————————————————————————————————————————————————
Setup server
———————————————————————————————————————————————————————————————— 
*/

const proxy = httpProxy.createProxyServer({
    ws: true,
    secure: config.isProduction
});

// Map routes to ports
const routeMap: Record<string, string> = {};

for (const [key, port] of Object.entries(config.ports)) {
    if (!port) {
        log.gateway.warn(`Missing port for "${key}" key in app.config.ts`).save();
        continue;
    }

    if (key === "gateway") {
        continue;
    }

    if (key === "main") {
        routeMap[`/`] = `https://localhost:${port}`;
        continue;
    }

    routeMap[`/${key.toLowerCase()}`] = `https://localhost:${port}`;
}

// HTTPS server
const local = https.createServer(
    getEnv("SSL"),
    async (req: IncomingMessage, res: ServerResponse) => {
        if (!req.url) {
            res.writeHead(400);
            return res.end();
        }

        if (req.url.startsWith("/favicon.ico")) {
            res.writeHead(302, {
                Location: `https://${config.domains.cdn}${config.metadata.assets.icon}`
            });
            return res.end();
        }

        const route = Object.keys(routeMap).find(prefix =>
            req.url!.startsWith(prefix)
        );

        if (!route) {
            log.gateway.warn(`No route found for '${req.url}'`).save();

            const i18n = await I18nService.load({
                localesPath: "/public/locales",
                locale: "en",
                defaultLocale: config.metadata.locale
            });

            res.writeHead(404);
            return res.end(i18n.t("messages.notFound"));
        }

        const target = routeMap[route];

        req.url = req.url.substring(route.length) || "/";

        proxy.web(
            req,
            res,
            {
                target,
                secure: config.isProduction,
                changeOrigin: true,
                headers: {
                    "x-forwarded-for": req.headers["x-forwarded-for"]
                        ? `${req.headers["x-forwarded-for"]}, ${req.socket.remoteAddress}`
                        : req.socket.remoteAddress || "",
                    "x-real-ip": req.socket.remoteAddress || ""
                }
            },
            async (error: Error) => {
                log.gateway.error(`Error proxying '${route}'`, error).save();

                const i18n = await I18nService.load({
                    localesPath: "/public/locales",
                    locale: "en",
                    defaultLocale: config.metadata.locale
                });

                res.writeHead(502);
                res.end(i18n.t("messages.badGateway"));
            }
        );
    }
);

// WebSocket handling
local.on("upgrade", (req, socket, head) => {
    if (!req.url) {
        socket.destroy();
        return;
    }

    const route = Object.keys(routeMap).find(prefix =>
        req.url!.startsWith(prefix)
    );

    if (!route) {
        socket.destroy();
        return;
    }

    const target = routeMap[route];

    req.url = req.url.substring(route.length) || "/";

    proxy.ws(req, socket, head, {
        target,
        secure: config.isProduction,
        changeOrigin: true
    });
});

/* 
————————————————————————————————————————————————————————————————
Start server
———————————————————————————————————————————————————————————————— 
*/

const port = config.ports.gateway;

local.listen(port, () => {
    log.gateway.info(`Proxy online at https://localhost:${port}`);
});

process.once("SIGTERM", () => terminateApp(log)); // Host
process.once("SIGINT", () => terminateApp(log)); // Ctrl+C

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