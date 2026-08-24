import type { Request, Response } from "express";
import crypto from "crypto";

import { AdvancedError } from "kage-library";

import { db } from "../databases/db.js";
import { log } from "../instances.js";
import { SessionType } from "../types/session.type.js";

export const isAccessTokenValid = async (req: Request, res: Response) => {
    try {
        const hashedAccessToken = crypto.createHash("sha256").update(req.body.token).digest("hex");

        const result = db.accounts.query<SessionType>(
            `SELECT accessToken FROM sessions WHERE accessToken = ? LIMIT 1`,
            [hashedAccessToken]
        );

        if (!result.success) {
            throw new AdvancedError({
                code: 500,
                message: "An error occurred while fetching access token",
                details: result.error
            })
        }

        return res.status(200).json(
            { valid: result.rowCount > 0 }
        );

    } catch (error) {
        if (error instanceof AdvancedError) {
            log.db.error(error).save();
            return res.status(error.code).json({
                id: error.id,
                message: error.message
            });
        } else {
            log.unknown.error(error).save();
        }
    } 
};
