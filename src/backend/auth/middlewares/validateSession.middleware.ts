import type { Request, Response, NextFunction } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../instances.js";
import validateSession from "../services/validateSession.service.js";

export const validateSessionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validates and returns the session
        const response = await validateSession(req, res);

        if (response.action === "REFRESH_PAGE") {
            return res.redirect(
                req.originalUrl || "/"
            );
        }

        req.session = response;

        next();
    } catch (error) {
        if (error instanceof AdvancedError) {
            log.db.error(error).save();
            return res.status(error.code).json({
                id: error.id,
                message: error.message
            });
        } else {
            log.unknown.error("Unknown error:", error).save();
        }
    } 
};