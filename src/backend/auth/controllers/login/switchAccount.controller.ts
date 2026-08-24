import type { Request, Response } from "express";
import crypto from "crypto";

import { AdvancedError, URL } from "kage-library";

import { db } from "../../databases/db.js";
import { log } from "../../instances.js";
import { SessionType } from "../../types/session.type.js";
import { config } from "../../../../../app.config.js";
import { id } from "../../../_common/instances.js";
import { DateTime } from "luxon";

export const switchAccount = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const delegationToken = req.cookies?.delegationToken;
    const url = new URL(`https://${config.domains.main}`);
    const refererUrl = req.get("Referer") || "/";

    function updateSessionToken(userId: string, sessionId: string) {
        const sessionToken = id.gen("TOKEN");
        const in30Days = DateTime.now().toUTC().plus({ days: 30 }).toISO();

        const hashedSessionToken = crypto.createHash("sha256").update(sessionToken).digest("hex");

        const result = db.accounts.query(
            `UPDATE sessions SET 
                userId = ?,
                sessionToken = ?, 
                sessionTokenExpireDate = ?
                WHERE sessionId = ? LIMIT 1`,
            [
                userId,
                hashedSessionToken,
                in30Days,
                sessionId,
            ]
        );

        if (!result.success) {
            throw new AdvancedError({
                code: 500,
                message: "An error occurred while saving session token",
                details: result.error
            })
        }

        return {
            type: "session",
            value: sessionToken
        };
    }

    function updateAccessToken(userId: string, sessionId: string) {
        const accessToken = id.gen("TOKEN");
        const in5Minutes = DateTime.now().toUTC().plus({ minutes: 5 }).toISO();

        const hashedAccessToken = crypto.createHash("sha256").update(accessToken).digest("hex");

        const result = db.accounts.query(
            `UPDATE sessions SET 
                userId = ?,
                accessToken = ?, 
                accessTokenExpireDate = ?
                WHERE sessionId = ? LIMIT 1`,
            [
                userId,
                hashedAccessToken,
                in5Minutes,
                sessionId,
            ]
        );

        if (!result.success) {
            throw new AdvancedError({
                code: 500,
                message: "An error occurred while saving session token",
                details: result.error
            })
        }

        return {
            type: "session",
            value: accessToken
        };
    }

    try {
        if (!delegationToken) {
            return res.redirect(refererUrl);
        }

        const hashedDelegationToken = crypto.createHash("sha256").update(delegationToken).digest("hex")

        const result = db.accounts.query<SessionType>(
            `SELECT * FROM sessions 
                WHERE delegationToken = ? AND userId = ? LIMIT 1`,
            [hashedDelegationToken, userId]
        );

        if (!result.success) {
            throw new AdvancedError({
                code: 500,
                message: "An error occurred while fetching session",
                details: result.error
            })
        }

        const session = result.rows[0];

        const sessionTokenResult = updateSessionToken(userId as string, session.sessionId);
        const accessTokenResult = updateAccessToken(userId as string, session.sessionId);

        res.cookie("sessionId", session.sessionId, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            domain: `.${url.domain}`,
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
        });

        res.cookie("sessionToken", sessionTokenResult.value, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            domain: `.${url.domain}`,
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        });

        res.cookie("accessToken", accessTokenResult.value, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            domain: `.${url.domain}`,
            path: "/",
            maxAge: 1000 * 60 * 5, // 5 minutes
        });

        return res.redirect(refererUrl);
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