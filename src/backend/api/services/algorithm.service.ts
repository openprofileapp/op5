import { DateTime } from "luxon";

import { DurationType, parseDuration } from "kage-library";

import whatIs, { WhatIsType } from "../helpers/whatIs.js";
import { db } from "../databases/db.js";
import { AlgorithmEventNameType } from "../../../_common/types/algorithm.type.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import createAuditLogService from "./createAuditLog.service.js";
import { AuditType } from "../../../_common/types/audit.type.js";

interface eventType {
    score: number;
    cooldown?: DurationType;
    scope: "global" | "user";
}

interface IndexType {
    events: Record<string, eventType>;
    multipliers: Record<string, number>;
}

const index: IndexType = {
    events: {
        // Guest; cooldown per IP
        API: { score: 0.25, cooldown: "24h", scope: "global" },

        // Member; global scope
        VIEW: { score: 1, cooldown: "1h", scope: "global" },
        READ: { score: 2, cooldown: "1h", scope: "global" },
        CHAT: { score: 2, cooldown: "1h", scope: "global" },
        LIKE: { score: 3, scope: "global" },
        UNLIKE: { score: -3, scope: "global" },
        FOLLOW: { score: 5, scope: "global" },
        UNFOLLOW: { score: -5, scope: "global" },
        COMMENT: { score: 7, cooldown: "1h", scope: "global" },
        UNCOMMENT: { score: -7, cooldown: "1h", scope: "global" },
        SHARE: { score: 10, cooldown: "1h", scope: "global" },
        UPDATE: { score: 50, cooldown: "30d", scope: "global" },
        REPORT: { score: -50, scope: "global" }, 
        // ^ Rejected reports will return the score; frequent false reports will suspend accounts

        // Member; user scope
        ADD_TO_COLLECTION: { score: 4, scope: "user" },
        REMOVE_FROM_COLLECTION: { score: -4, scope: "user" },
        UNHIDE: { score: 10, scope: "user" },
        HIDE: { score: -10, scope: "user" },
    },
        
    // Multiplies the base (1.0)
    multipliers: {
        OFFICIAL: 4, // Platform mascot or collaborations
        VERIFIED: 1,
        PREMIUM: 0.1
    }
};

/**
 * Handles updating the algorithm and user interest scores.
 * Scores, cooldowns, scopes, and multipliers are stored on an index map.
 */
export default class AlgorithmService {
    public static scores = index.events;
    public static multipliers = index.multipliers;

    private static calculate(
        whatIsData: WhatIsType, 
        score: number
    ): { score: number, multiplier: number } {
        let multipliers = 1.0;
        const badges = [];

        if (whatIsData.isPremium) badges.push("PREMIUM");
        if (whatIsData.isVerified) badges.push("VERIFIED");
        if (whatIsData.isOfficial) badges.push("OFFICIAL");

        for (const badge of badges) {
            if (index.multipliers[badge]) {
                multipliers += index.multipliers[badge];
            }
        }

        return {
            score: score * multipliers,
            multiplier: multipliers
        };
    };

    /**
     * Calculates the time-decayed weight of an engagement score 
     * using a hybrid grace period and exponential decay model.
     * 
     * - Days 0 to grace period: Applies a fixed multiplier boost (e.g., 1.5x = 150%).
     * - After grace period: Continuously decays towards 0 using e^(-decayRate * age - gracePeriodDays).
     * 
     * Example:
     * - Day 1: 150.0%
     * - Day 7: 144.1%
     * - Day 30: 114.5%
     * - Day 44: 100.0%
     * - Day 365: 4.0%
     * 
     * @param updatedDate - ISO timestamp string of the last activity/update.
     * @param score - Base value to decay (e.g., 1 view = 1.0).
     * @returns Decayed score/weight percentage.
     */
    private static decay(
        updatedDate: string, 
        score: number
    ): { score: number, decay: number } {
        const updatedDateTime = DateTime.fromISO(updatedDate);

        if (!updatedDateTime.isValid) {
            return {
                score,
                decay: 0
            };
        }

        const gracePeriodDays = 3;
        const graceMultiplier = 1.5;
        const decayRate = 0.01;

        const rawAge = DateTime.now().diff(updatedDateTime, "days").days;
        const age = Math.max(0, rawAge);

        if (age <= gracePeriodDays) {
            return {
                score: score * graceMultiplier,
                decay: 0
            };
        }

        const newScore = score * graceMultiplier * Math.exp(-decayRate * (age - gracePeriodDays))

        return {
            score: newScore,
            decay: score - newScore
        };
    }

    /**
     * Update topic of interest score for an account
     * @param {string} userId - user id (required)
     * @param {string} whatIsData - whatIsData of the target id (required)
     * @param {string} event - type of event from index (required)
     */
    private static interest(
        userId: string, 
        whatIsData: WhatIsType, 
        event: AlgorithmEventNameType
    ) {
        assertNotNull([userId, whatIsData, event])

        const score = index.events[event].score;

        if (!score) return;

        for (const tag of whatIsData.tags) {
            const result = db.users.query(
                `
                    INSERT INTO interests (userId, tag, algorithmScore)
                    VALUES (?, ?, ?)
                    ON CONFLICT(userId, tag) 
                    DO UPDATE SET algorithmScore = algorithmScore + excluded.algorithmScore
                `,
                [userId, tag, score]
            );

            assertDbSuccess(result);
        }

        return score;
    };

    /**
     * Update algorithm score for an asset or account
     * @param {string} targetId - the id of the asset or account to update (required)
     * @param {string} sourceId - the id of the user causing the update (required)
     * @param {string} event - type of event from index (required)
     */
    public static update(
        targetId: string,
        sourceId: string,
        event: AlgorithmEventNameType
    ) {
        assertNotNull([targetId, sourceId]);

        if (!event) return;

        let score = index.events[event].score;
        const { cooldown, scope } = index.events[event];

        assertNotNull([score, scope]);

        const whatIsData = whatIs(targetId);

        assertNotNull(whatIsData);

        if (scope === "user") {
            const score = this.interest(sourceId, whatIsData, event);

            return score;
        }

        this.interest(sourceId, whatIsData, event);

        if (cooldown) {
            const result = db.audits.query<AuditType>(
                `SELECT * FROM algorithm 
                    WHERE source = ? AND target = ? AND action = ? 
                    ORDER BY created_at DESC LIMIT 1`,
                [sourceId, targetId, event]
            );

            assertDbSuccess(result);

            const latestDate = result.rows[0].date;

            if (latestDate) {
                const latestDateMs = DateTime.fromISO(latestDate).toMillis();
                const expiresAtMs = latestDateMs + parseDuration(cooldown);
                const nowMs = DateTime.now().toMillis();

                if (expiresAtMs > nowMs) return;
            }
        }

        const initialScore = score
        let decayedResult;

        const calculatedResult = this.calculate(whatIsData, score);

        if (!whatIsData.isPromoted && whatIsData.updatedDate) {
            decayedResult = this.decay(whatIsData.updatedDate, score);
            score = decayedResult.score;
        }

        createAuditLogService(
            "algorithm",
            event,
            sourceId,
            {
                target: targetId,
                changes: { 
                    initialScore, 
                    multiplier: calculatedResult.multiplier, 
                    decay: decayedResult?.decay || 0
                }
            }
        )

        if (whatIsData.type === "USER") {
            const result = db.users.query(
                "UPDATE users SET algorithmScore = algorithmScore + ? WHERE id = ?",
                [score, targetId]
            )

            assertDbSuccess(result);
        }

        if (whatIsData.type === "CHARACTER") {
            const publishedResult = db.characters.query(
                "UPDATE published SET algorithmScore = algorithmScore + ? WHERE id = ?",
                [score, targetId]
            )

            assertDbSuccess(publishedResult);

            const draftsResult = db.characters.query(
                "UPDATE drafts SET algorithmScore = algorithmScore + ? WHERE id = ?",
                [score, targetId]
            )

            assertDbSuccess(draftsResult);
        }

        return score;
    }
}
