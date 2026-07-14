/*import type { Request, Response, NextFunction } from "express";

import { AdvancedError } from "kage-library";
import { config } from "../../../../app.config.js";

import { log, wc } from "../instances.js";
import { ValidSessionType } from "../../_common/types/validSession.type.js";

export const fetchSessionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await wc.callAPI<ValidSessionType>(
            `https://${config.domains.auth}/session`
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
};*/