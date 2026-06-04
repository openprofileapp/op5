import type { Request, Response } from 'express';
import getBotAccountByToken from '../services/getBotAccountByToken.service.js';

import { AdvancedError } from 'kage-library';

import { log } from '../server.js';

export const botLogin = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization as string || req.headers.Authorization as string;
        const authToken = authHeader.split(" ")[1];

        const response = getBotAccountByToken(authToken);

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