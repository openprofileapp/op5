import { DateTime } from "luxon";

import { AdvancedError, DurationType } from "kage-library";

import whatIs, { WhatIsType } from "../helpers/whatIs.js";
import { db } from "../databases/db.js";

type EventNameType = 
    "API" |
    "VIEW" |
    "READ" |
    "CHAT" |
    "LIKE" |
    "UNLIKE" |
    "FOLLOW" |
    "UNFOLLOW" |
    "COMMENT" |
    "UNCOMMENT" |
    "SHARE" |
    "UPDATE" |
    "REPORT" |
    "ADD_TO_COLLECTION" |
    "REMOVE_FROM_COLLECTION" |
    "ADD_INTEREST" |
    "REMOVE_INTEREST"

interface EventType {
    score: number;
    cooldown?: DurationType;
    scope: "global" | "user";
}

interface IndexType {
    events: Record<string, EventType>;
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
        ADD_INTEREST: { score: 10, scope: "user" },
        REMOVE_INTEREST: { score: -10, scope: "user" },
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

    private static calculate(whatIsData: WhatIsType, score: number) {
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

        return score * multipliers;
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
    private static decay(updatedDate: string, score: number): number {
        const updatedDateTime = DateTime.fromISO(updatedDate);

        if (!updatedDateTime.isValid) {
            return score;
        }

        const gracePeriodDays = 3;
        const graceMultiplier = 1.5;
        const decayRate = 0.01;

        const rawAge = DateTime.now().diff(updatedDateTime, "days").days;
        const age = Math.max(0, rawAge);

        if (age <= gracePeriodDays) {
            return score * graceMultiplier;
        }

        return score * graceMultiplier * Math.exp(-decayRate * (age - gracePeriodDays));
    }

    /**
     * Update topic of interest score for an account
     * @param {string} userId - user id (required)
     * @param {string} whatIsData - whatIsData of the target id (required)
     * @param {string} EVENT - type of EVENT from index (required)
     */
    private static interest(
        userId: string, 
        whatIsData: WhatIsType, 
        EVENT: EventNameType
    ) {
        if (!userId || !whatIsData || !EVENT) {
            throw new AdvancedError({
                code: 400,
                message: "Malformed request",
                details: { userId, whatIsData, EVENT }
            });
        }

        const score = index.events[EVENT].score;

        if (!score) return;

        for (const tag of whatIsData.tags) {
            const userResult = db.users.query(
                `
                    INSERT INTO interests (userId, tag, algorithmScore)
                    VALUES (?, ?, ?)
                    ON CONFLICT(userId, tag) 
                    DO UPDATE SET algorithmScore = algorithmScore + excluded.algorithmScore
                `,
                [userId, tag, score]
            );

            if (!userResult.success) {
                throw new AdvancedError({
                    code: 500,
                    message: "An error occurred while saving interests",
                    details: userResult.error
                })
            }
        }

        return score;
    };

    /**
     * Update algorithm score for an asset or account
     * @param {string} targetId - the id of the asset or account to update (required)
     * @param {string} sourceId - the id of the user causing the update (required)
     * @param {string} EVENT - type of EVENT from index (required)
     */
    public static update(
        targetId: string,
        sourceId: string,
        EVENT: EventNameType
    ) {
        if (!targetId || !sourceId || !EVENT) {
            throw new AdvancedError({
                code: 400,
                message: "Malformed request",
                details: { targetId, sourceId, EVENT }
            });
        }

        let score = index.events[EVENT].score;
        const { cooldown, scope } = index.events[EVENT];

        if (!score || !scope) return;

        const whatIsData = whatIs(targetId);

        if (!whatIsData) {
            throw new AdvancedError({
                code: 400,
                message: "Unknown whatIsData"
            });
        }

        if (scope === "user") {
            const score = this.interest(sourceId, whatIsData, EVENT);

            return score;
        }

        // DEVELOPER NEEDED: Check the latest interaction of event. If less than cooldown, return. 

        score = this.calculate(whatIsData, score);

        if (!whatIsData.isPromoted && whatIsData.updatedDate) {
            score = this.decay(whatIsData.updatedDate, score);
        }

        // DEVELOPER NEEDED: Log the final score, target and source ids, and boost in audit

        if (whatIsData.type === "USER") {
            const userResult = db.users.query(
                "UPDATE users SET algorithmScore = algorithmScore + ? WHERE id = ?",
                [score, targetId]
            )

            if (!userResult.success) {
                throw new AdvancedError({
                    code: 500,
                    message: "An error occurred while saving user",
                    details: userResult.error
                })
            }
        }

        if (whatIsData.type === "CHARACTER") {
            db.characters.query(
                "UPDATE published SET algorithmScore = algorithmScore + ? WHERE id = ?",
                [score, targetId]
            )

            const characterResult = db.characters.query(
                "UPDATE drafts SET algorithmScore = algorithmScore + ? WHERE id = ?",
                [score, targetId]
            )

            if (!characterResult.success) {
                throw new AdvancedError({
                    code: 500,
                    message: "An error occurred while saving character",
                    details: characterResult.error
                })
            }
        }

        return score;
    }
}
