import type { Request, Response } from 'express';
import validateSession from '../services/validateSession.service.js';

import { AdvancedError } from 'kage-library';

import { log } from '../server.js';

/*
// Guard
// Variables
let COCURRENT_SESSIONS: number = 0;

// If more than the max users, return 503
COCURRENT_SESSIONS++;

if (COCURRENT_SESSIONS > config.maxSessions) {
    throw new Error("Server is busy", { cause: { code: 503 } });
}
*/

export const getSession = async (req: Request, res: Response) => {
    try {
        const response = await validateSession(req, res);

        if (response.action) {
            switch (response.action) {
                case "REFRESH_PAGE":
                    return res.redirect(
                        req.originalUrl || "/"
                    );
                default: 
                    return res.status(200).json(
                        {...response}
                    );
            }
        } else {
            return res.status(200).json({
                ...response
            });
        }
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