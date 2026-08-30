import type { Request, Response } from "express";
import crypto from "crypto";

import { AdvancedError, URL } from "kage-library";

import { db } from "../databases/db.js";
import { log } from "../instances.js";
import { SessionType } from "../types/session.type.js";
import { config } from "../../../../app.config.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import updateToken from "../helpers/updateToken.js";
import { i18n } from "../../_common/instances.js";

export const logoutController = async (req: Request, res: Response) => {
    try {
        const { redirect } = req.query;

        const sessionId = req.cookies?.sessionId;
        const delegationToken = req.cookies?.delegationToken;

        const url = new URL(`https://${config.domains.main}`);

        if (!delegationToken || !sessionId) {
            return res.redirect(redirect as string || "/");
        }

        const hashedDelegationToken = crypto.createHash("sha256").update(delegationToken).digest("hex")

        const deleteResult = db.accounts.query(
            `DELETE FROM sessions WHERE sessionId = ?`,
            [sessionId]
        );

        assertDbSuccess(deleteResult);

        const getResult = db.accounts.query<SessionType>(
            `SELECT * FROM sessions 
                WHERE delegationToken = ? LIMIT 1`,
            [hashedDelegationToken]
        );

        assertDbSuccess(getResult);

        if (getResult.rowCount === 0) {
            return res.redirect(redirect as string || "/");
        }

        const row = getResult.rows[0];

        const accessToken = updateToken(row.sessionId, "ACCESS");
        const sessionToken =  updateToken(row.sessionId, "SESSION");

        res.cookie("sessionId", row.sessionId, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            domain: `.${url.domain}`,
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
        });

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            domain: `.${url.domain}`,
            path: "/",
            maxAge: 1000 * 60 * 5, // 5 minutes
        });

        res.cookie("sessionToken", sessionToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            domain: `.${url.domain}`,
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        });

        return res.redirect(redirect as string || "/");
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
