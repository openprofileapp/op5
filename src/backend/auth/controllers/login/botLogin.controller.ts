import type { Request, Response } from "express";
import getBotAccountByToken from "../../services/getBotAccountByToken.service.js";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";

export const botLogin = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ error: "Missing Authorization header" });
        }

        const authToken = authHeader.split(" ")[1];

        // REJECT IF DOESN'T INCLUDE BEARER

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