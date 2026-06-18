import { DateTime } from "luxon";
import crypto from "crypto"

import { AdvancedError } from "kage-library";

import { db } from "../databases/db.js";
import { id } from "../instances.js";

export function createMfaChallenge(secret: string, userId: string, sessionId: string) {
    const mfaToken = id.gen("TOKEN");
    const in30Days = DateTime.now().toUTC().plus({ days: 30 }).toISO();

    const hashedMfaToken = crypto.createHash("sha256").update(mfaToken).digest("hex");

    const sessionResult = db.accounts.query(
        `UPDATE sessions SET 
            mfaToken = ?, 
            mfaTokenExpireDate = ?
            WHERE sessionId = ? LIMIT 1`,
        [
            hashedMfaToken,
            in30Days,
            sessionId,
        ]
    );

    if (!sessionResult.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while saving session token",
            details: sessionResult.error
        })
    }

    const in15Minutes = DateTime.now().toUTC().plus({ minutes: 15 }).toISO();

    const challengeResult = db.accounts.query(
        `INSERT INTO mfaChallenges (
            mfaToken, 
            userId,
            expireDate
        ) VALUES (?, ?, ?)`,
        [
            hashedMfaToken, 
            userId,
            in15Minutes
        ]
    );

    if (!challengeResult.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while saving mfa challenge",
            details: challengeResult.error
        })
    }

    // ALSO ADD AUDIT LOGGING FOR A SUCESSFUL CHALLENGE CREATION

    return {
        type: "mfa",
        value: mfaToken
    };
}