import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { db } from "../databases/db.js";
import { log } from "../instances.js";
import { SessionType } from "../../../_common/types/session.type.js";
import { i18n } from "../../_common/instances.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { assertBearer } from "../../_common/asserts/bearer.assert.js";

export const sessionsController = async (req: Request, res: Response) => {
    try {
        assertBearer(req);

        const sessionId = req.cookies?.sessionId;

        const idResult = db.accounts.query<SessionType>(
            `SELECT * FROM sessions WHERE sessionId = ? LIMIT 1`,
            [sessionId]
        );

        assertDbSuccess(idResult);

        if (idResult.rows[0].userId) {
            const sessionsResult = db.accounts.query<SessionType>(
                `SELECT * FROM sessions WHERE userId = ? AND isTerminated = 0`,
                [idResult.rows[0].userId]
            );

            assertDbSuccess(sessionsResult);

            return res.status(200).json(
                sessionsResult.rows
            );
        }

        return res.status(200).json(
            []
        );
    } catch(error) {
        if (error instanceof AdvancedError) {
            log.db.error(error).save();
            return res.status(error.code).json({
                id: error.id,
                message: error.message
            });
        } else {
            log.unknown.error(error).save();
            return res.status(500).json({
                message: i18n.t("responses.unknown"),
            });
        }
    }
};
