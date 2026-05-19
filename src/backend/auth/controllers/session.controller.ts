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

        return res.status(200).json({
            ...response
        });

    } catch (error) {
        if (error instanceof AdvancedError) {
            log.db.error(error.stack).save();
            return res.status(error.code).json(error.message);
        } else {
            console.log("Unknown error:", error);
        }
    }
};