import type { Request, Response } from "express";
import { DateTime } from "luxon";

import { AdvancedError } from "kage-library";

import { db } from "../../databases/db.js";
import { log } from "../../instances.js";
import { SessionType } from "../../types/session.type.js";
import { i18n } from "../../../_common/instances.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import getEnv from "../../../../_common/helpers/getEnv.js";

export const disconnectSessionController = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;

        const authHeader = req.headers.authorization;

        let isAuthorized = false;

        if (authHeader?.startsWith("ApiSecret ")) {
            isAuthorized = authHeader.split(" ")[1] === getEnv("API_SECRET");
        }

        if (!isAuthorized) {
            throw new AdvancedError({
                code: 401,
                message: i18n.t("responses.unauthorized")
            })
        }

        const getResult = db.accounts.query<SessionType>(
            "SELECT * FROM sessions WHERE sessionId = ?",
            [sessionId]
        );

        assertDbSuccess(getResult);

        if (getResult.rowCount === 0) {
            throw new AdvancedError({
                code: 401,
                message: i18n.t("responses.sessionNotFound")
            })
        }

        const session = getResult.rows[0];
        const now = DateTime.now().toUTC();

        const lastConnected = DateTime.fromISO(session.lastConnectedDate, { zone: "utc" });

        if (!lastConnected.isValid) {
            log.db.error(`Invalid lastConnectedDate for session ${sessionId}:`, session.lastConnectedDate).save();
        }

        const elapsedSeconds = lastConnected.isValid 
            ? Math.max(0, Math.floor(now.diff(lastConnected, "seconds").seconds))
            : 0;

        const updatedTotalDuration = (Number(session.totalDuration) || 0) + elapsedSeconds;

        const postResult = db.accounts.query(
            `UPDATE sessions SET isConnected = 0, totalDuration = ?, lastConnectedDate = ? WHERE sessionId = ?`,
            [updatedTotalDuration, now.toISO(), sessionId]
        );

        assertDbSuccess(postResult);

        return res.status(200).json({
            ok: true
        });
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
