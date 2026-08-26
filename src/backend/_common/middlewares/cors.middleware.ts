import { NextFunction, Request, Response } from "express";
import cors from "cors";
import { Agent, fetch } from "undici";

import { config } from "../../../../app.config.js";
import validateIp from "../helpers/validateIp.js";
import { AdvancedError } from "kage-library";
import { i18n } from "../instances.js";
import getEnv from "../../../_common/helpers/getEnv.js";
import { AuditApiType } from "../../../_common/types/audit.type.js";

const allowedDomains = Object.values(config.domains);

const allowedOrigins = allowedDomains.map(
    domain => `https://${domain}`
);

const insecureAgent = new Agent({
    connect: {
        rejectUnauthorized: config.isProduction
    }
});

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    return cors({
        origin: async (origin, callback) => {
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            if (origin === "null" && !config.isProduction) {
                return callback(null, true);
            }

            await fetch(`https://${config.domains.api}/v2/audit/create`, {
                method: "POST",
                headers: {
                    "Authorization": `ApiSecret ${getEnv("API_SECRET")}`,
                    "Content-Type": "application/json"
                },
                dispatcher: insecureAgent,
                body: JSON.stringify({
                    type: "cors", 
                    source: validateIp(req), 
                    action: "BLOCKED",
                    origin: origin
                } as AuditApiType)
            });

            return callback(new Error("BLOCKED"));
        },
        credentials: true,
        methods: ["GET", "POST", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })(req, res, (error) => {
        if (error) {
            const error = new AdvancedError({
                code: 403,
                message: i18n.t("responses.cors")
            });

            return res.status(error.code).json(error);
        }

        next();
    });
};
