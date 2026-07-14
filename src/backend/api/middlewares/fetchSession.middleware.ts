import type { Request, Response, NextFunction } from "express";

import { AdvancedError } from "kage-library";

import { config } from "../../../../app.config.js";
import getEnv from "../../../_common/helpers/getEnv.js";
import { log, wc } from "../instances.js";
import { ValidSessionType } from "../../_common/types/validSession.type.js";

export const fetchSessionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await wc.callAPI<ValidSessionType>(
            `https://${config.domains.auth}/session`,
            {
                method: "POST",
                auth: `ApiSecret ${getEnv("API_SECRET")}`,
                body: {
                    headers: req.headers,
                    cookies: req.cookies,
                    query: req.query,
                    ip: req.ip,
                    socket: {
                        remoteAddress: req.socket.remoteAddress,
                    },
                    method: req.method,
                    originalUrl: req.originalUrl,
                },
            }
        );

        req.session = response;

        next();
    } catch (error) {
        if (error instanceof AdvancedError) {
            log.network.error(error).save();
            return res.status(error.code).json({
                id: error.id,
                message: error.message
            });
        } else {
            log.unknown.error("Unknown error (fetchSession.middleware.ts):", error).save();
        }
    } 
};