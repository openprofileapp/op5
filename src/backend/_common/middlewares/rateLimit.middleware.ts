import { Request, Response } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

import { config } from "../../../../app.config.js";
import PlatformPermissionsService from "../services/platformPermissions.service.js";
import { i18n, wc } from "../instances.js";
import getEnv from "../../../_common/helpers/getEnv.js";
import { AuditApiType } from "../../../_common/types/audit.type.js";

export default function rateLimitMiddleware(requests: number = 240) {
    return rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: requests,

        keyGenerator: (req: Request): string => {
            const session = req.session?.sessionId;
            const ip = ipKeyGenerator(req.ip as string);

            return session ?? ip ?? "unknown";
        },

        skip: (req: Request): boolean => {
            if (req.session?.permissions?.value) {
                return PlatformPermissionsService.has(
                    req.session?.permissions?.value,
                    "SUPER_ADMIN"
                );
            }

            return false;
        },

        handler: async (req: Request, res: Response) => {

            await wc.callAPI(
                `https://${config.domains.api}/v3/audit/create`,
                {
                    method: "POST",
                    auth: `ApiSecret ${getEnv("API_SECRET")}`,
                    body: {
                        type: "rateLimits", 
                        source: req.session?.sessionId ?? ipKeyGenerator(req.ip as string) ?? "unknown", 
                        action: "HIT",
                        origin: req.originalUrl
                    } as AuditApiType
                }
            );

            return res.status(429).json({
                code: 429,
                message: i18n.t("responses.rateLimit")
            });
        },
    });
}
