import https from "https";
import httpProxy from "http-proxy";
import { IncomingMessage, ServerResponse } from "http";
import { Socket } from "net";
import cron from "node-cron";

import { 
    Logger,
    I18nService
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

// Map domains to ports
const serverMap: Record<string, string> = {};

for (const [key, domain] of Object.entries(config.domains)) {
    const port = config.ports[key as keyof typeof config.ports];

    if (!domain) {
        log.proxy.warn(`Missing domain for "${key}" key in app.config.ts`).save();
        continue;
    }

    if (!port) {
        log.proxy.warn(`Missing port for "${key}" key in app.config.ts`).save();
        continue;
    }

    serverMap[domain.toLowerCase()] = `https://localhost:${port}`;
}

// HTTPS server
const local = https.createServer(
    getEnv("SSL"),
    async (req: IncomingMessage, res: ServerResponse) => {
        if (req.url!.startsWith("/favicon.ico")) {
            res.writeHead(302, {
                Location: `https://${config.domains.cdn}${config.metadata.assets.icon}`
            });
            return res.end();
        }

        const hostname = req.headers.host?.split(":")[0].toLowerCase();
        const target = hostname ? serverMap[hostname] : undefined;

        if (!target) {
            log.proxy.warn(`Host '${hostname}' is not mapped to a server`).save();

            const i18n = await I18nService.load(
                { 
                    localesPath: "/public/locales", 
                    locale: "en", 
                    defaultLocale: config.metadata.locale 
                }
            );

            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            res.writeHead(502);
            return res.end(i18n.t("messages.badGateway"));
        }

        proxy.web(
            req,
            res,
            {
                target,
                secure: config.isProduction,
                changeOrigin: false,
                headers: {
                    host: hostname as string
                }
            },
            async (error: Error) => {
                log.proxy.error(`Error for '${hostname}':`, error).save();

                const i18n = await I18nService.load(
                    { 
                        localesPath: "/public/locales", 
                        locale: "en", 
                        defaultLocale: config.metadata.locale 
                    }
                );

                res.writeHead(502);
                res.end(i18n.t("messages.badGateway"));
            }
        );
    }
);

// WebSocket handling
local.on(
    "upgrade",
    (req: IncomingMessage, socket: Socket, head: Buffer) => {
        const hostname = req.headers.host?.split(":")[0].toLowerCase();
        const target = hostname ? serverMap[hostname] : undefined;
        
        if (!target) {
            socket.destroy();
            return;
        }

        proxy.ws(req, socket, head, {
            target,
            secure: config.isProduction,
            headers: {
                host: hostname as string
            }
        });
    }
);

/* 
————————————————————————————————————————————————————————————————
Start server
———————————————————————————————————————————————————————————————— 
*/

const port = 443

local.listen(port, () => {
    log.proxy.info(`Proxy online at https://localhost:${port}`);
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
});