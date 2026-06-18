import { Request, Response } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

import { config } from "../../../../app.config.js";
import PlatformPermissionsService from "../services/platformPermissions.service.js";
import { wc } from "../instances.js";
import getEnv from "../../../_common/helpers/getEnv.js";
import { AuditApiType } from "../types/queries/audit.type.js";

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
            // Skip if super admin
            if (req.session?.permissions?.value) {
                return PlatformPermissionsService.has(
                    req.session?.permissions?.value,
                    "SUPER_ADMIN"
                );
            }

            return false;
        },

        handler: async (req: Request, res: Response) => {
            
            // Create audit log
            await wc.callAPI(
                `https://${config.domains.api}/v2/audit/create`,
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

            res.status(429).json({
                error: "Too many requests, please try again later.",
            });
        },
    });
}