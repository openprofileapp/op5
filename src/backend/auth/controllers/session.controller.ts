import type { Request, Response } from 'express';
import validateSession from '../services/validateSession.service.js';

import { AdvancedError } from 'kage-library';

import { log } from '../server.js';

export const authenticateSession = async (req: Request, res: Response) => {
    try {
        // Validates and returns the session
        const response = await validateSession(req, res);

        if (response.action === "REFRESH_PAGE") {
            return res.redirect(
                req.originalUrl || "/"
            );
        }

        return res.status(200).json(
            {...response}
        );
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