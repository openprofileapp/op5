import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import isBearerTokenAuthorized from "../../_common/helpers/isBearerTokenAuthorized.js";
import { db } from "../databases/db.js";
import { log } from "../instances.js";
import { SessionType } from "../types/session.type.js";

export const isAccessTokenValid = async (req: Request, res: Response) => {
    try {
        if (!await isBearerTokenAuthorized(req.headers.authorization)) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const result = db.accounts.query<SessionType>(
            `SELECT accessToken FROM sessions WHERE accessToken = ? LIMIT 1`,
            [req.body.token]
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