import { AdvancedError, DurationType } from "kage-library";
import whatIs, { WhatIsType } from "../helpers/whatIs.js";

interface EventType {
    score: number;
    cooldown?: DurationType;
    scope?: "global" | "user";
}

interface IndexType {
    event: Record<string, EventType>;
    multiplier: Record<string, number>;
}

const index: IndexType = {
    event: {
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
        UPDATE: { score: 50, cooldown: "7d", scope: "global" },
        REPORT: { score: -50, scope: "global" }, 
        // ^ Rejected reports will return the score; frequent false reports will suspend accounts

        // Member; user scope
        ADD_TO_COLLECTION: { score: 4, scope: "user" },
        REMOVE_FROM_COLLECTION: { score: -4, scope: "user" },
        ADD_INTEREST: { score: 10, scope: "user" },
        REMOVE_INTEREST: { score: -10, scope: "user" },
    },
        
    // Multiplies the base (1.0)
    multiplier: {
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

    private calculate(whatIsData: WhatIsType, score: number) {
        let multiplier = 1.0;

        





        // Include the verified type as a badge if applicable
        let badges = (data.badges || []).map(b => b.type.toUpperCase());
        if (verified_type) badges.push(verified_type);

        // Add multipliers for all badges that exist in index.multiplier
        for (const badge of badges) {
            if (index.multiplier[badge]) {
                multiplier += index.multiplier[badge];
            }
        }

        // DEVELOPER NEEDED: Enable completion cron and timestamps of last update on lower profile tab

        // Incomplete occures when lack of activity after 30 days
        // if (data.stage && data.stage == "incomplete") {
        //     score = score / 2;
        // }

        return score * multiplier;
    };











    /**
     * Update algorithm score for an asset or account
     * @param {string} EVENT - type of EVENT from index (required)
     * @param {string} assetId - the id of the asset or account to update (required)
     */
    public update(
        EVENT: string, 
        assetId: string,
    ) {
        if (!EVENT || !assetId) {
            throw new AdvancedError({
                code: 400,
                message: "Malformed request",
                details: { event: EVENT, assetId: assetId }
            });
        }

        let score = index.event[EVENT].score;

        if (!score) return;

        const whatIsData = whatIs(assetId);

        if (!whatIsData) {
            throw new AdvancedError({
                code: 400,
                message: "Unknown asset",
                details: { whatIsData: whatIsData }
            });
        }

        score = this.calculate(whatIsData, score);
    }
}























// DEVELOPER NEEDED: Make read score based on time spent (2 initial then idk, needs to be using time and activity)
// Store read time in a database using socket




algorithm.update = function(data, db, table, event) {
    try {

        // Calculate the event score 


        // Assign account multipliers from badges and if asset, assign decay from last updated date
       
        if (data.owner && !data.promoted) {score = algorithm.decay(score, data.updated_date);}

        // Update databases
        database.query(db, `UPDATE ${table} SET score = score + ? WHERE id = ?`, [score, data.id]);

        return score;
    } catch (error) {
        return forward_status("error", "server", "algorithm.update", error.code || 500, error.message);
    }
};

/**
 * Update aura (algorithm) topic of interest score for an account
 * @param {string} account - account id (required)
 * @param {string} topic - topic of interest (required)
 * @param {string} EVENT - type of EVENT from index (required)
 */
algorithm.interest = function(account, topic, event) {
    try {
        if (!account || !event) {throw Object.assign(new Error(messages.error.field_validation), { code: 400 });}

        // Calculate the event score 
        let score = index.event[event];
        if (score === undefined) {return}

        // Split tags and update each, else register new interest for user
        if (topic) {
            let tags = topic.split(",").map(tag => tag.trim()).filter(Boolean);
            for (const tag of tags) {
                const result = database.query("accounts", `UPDATE interests SET score = score + ? WHERE user = ? AND topic = ?`, [score, account, tag]);
                if (result.changes === 0) {database.query("accounts", `INSERT INTO interests (user, topic, score) VALUES (?, ?, ?)`, [account, tag, score]);}
            }
            return;
        }

        return
    } catch (error) {
        return forward_status("error", "server", "algorithm.interest", error.code || 500, error.message);
    }
};









































// Decay older content and boost newer ones
algorithm.decay = function(score, date) {
    const age = timestamp.generate("now", "subtract", date).total_days;
    if (age < 3) {return score * 1.5}
    return score * Math.exp(-0.01 * age);
}

// combine total 
// If a lot of activity, reverse the decay slowly based on dates like -0.01 * age * activity (base 1.0)



// Sync an asset's total score dynamically
algorithm.sync = function(asset) {
    try {
        if (!asset || !asset.id) throw Object.assign(new Error("Missing asset.id"), { code: 400 });

        // Get all aura events for this asset
        const events = database.query("aura", "SELECT * FROM aura_events WHERE asset_id = ?", [asset.id]);

        let totalScore = 0;
        for (const event of events) {
            // Get user badges
            const account = database.query("accounts", "SELECT * FROM accounts WHERE id = ?", [event.user_id]);
            account.badges = database.query("accounts", "SELECT type FROM badges WHERE user = ?", [event.user_id]);

            const multiplier = algorithm.calculate(account);
            totalScore += algorithm.decay(event.base_score * multiplier, event.timestamp);
        }

        // Update asset's total score
        database.query("assets", "UPDATE assets SET score = ? WHERE id = ?", [totalScore, asset.id]);

        return { success: true, score: totalScore };
    } catch (error) {
        return forward_status("error", "server", "algorithm", error.code || 500, error.message);
    }
};
