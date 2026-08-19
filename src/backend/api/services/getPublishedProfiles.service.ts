import { AdvancedError } from "kage-library";

import { ValidSessionType } from "../../../_common/types/validSession.type.js";
import { db } from "../databases/db.js";
import getPublicUserById from "./getPublicUserByIdOrUsername.service.js";
import getUserInterestsById from "./getUserInterestsById.service.js";

export default function getPublishedProfiles(visibility: string = "public", session?: ValidSessionType) {
    // If not visibility throw a malformed request

    let result;

    // Recommended should be stuff you have not read or liked or followed based on all interests
    // Popular should be stuff current popular in the last 7 days regardless of interaction
    // Because You Liked should be stuff you have not read or liked or followed based on a single interest

    if (session?.userId) {
        const userInterests = getUserInterestsById(session.userId); 
        const userInterestList = userInterests?.interests || [];

        if (userInterestList.length === 0) {
            result = db.characters.query(
                "SELECT * FROM published WHERE visibility = ? ORDER BY algorithmScore DESC LIMIT 30", 
                [visibility]
            );
        } else {
            // ALSO CHECK FOR NOT-INTERESTED. FIX INTERACTIONS TO INCLUDE IT
            const interactionResult = db.interactions.query(
                `
                    SELECT target FROM reads WHERE source = ?
                    UNION SELECT target FROM likes WHERE source = ?
                    UNION SELECT target FROM follows WHERE source = ?
                `,
                [session.userId, session.userId, session.userId]
            );

            if (!interactionResult.success) {
                throw new AdvancedError({
                    code: 500,
                    message: "An error occurred while fetching interactions",
                    details: interactionResult.error
                })
            }

            const excludedIds = interactionResult.rows.map(row => row.target);

            const likeClauses = userInterestList.map(() => `tags LIKE ?`).join(" OR ");
            const likeParams = userInterestList.map(item => `%${item.tag}%`);

            const ownerClause = session?.userId ? `AND ownerId != ?` : '';
            const ownerParams = session?.userId ? [session.userId] : [];

            const orderScoreClauses = userInterestList
                .map(() => `(CASE WHEN tags LIKE ? THEN ? ELSE 0 END)`)
                .join(" + ");

            const orderParams = userInterestList.flatMap(item => [
                `%${item.tag}%`, 
                item.algorithmScore
            ]);

            const excludeClause = excludedIds.length > 0 
                ? `AND id NOT IN (${excludedIds.map(() => '?').join(',')})` 
                : '';

            result = db.characters.query(
                `
                    SELECT * FROM published 
                    WHERE visibility = ? AND (${likeClauses}) ${excludeClause} ${ownerClause}
                    ORDER BY (${orderScoreClauses}) DESC, algorithmScore DESC 
                    LIMIT 30
                `,
                [visibility, ...likeParams, ...excludedIds, ...ownerParams, ...orderParams]
            );
        }
    } else {
        result = db.characters.query(
            "SELECT * FROM published WHERE visibility = ? ORDER BY algorithmScore DESC LIMIT 30", 
            [visibility]
        );
    }


    // NORMAL
    /*if (session?.userId) {
        const userInterests = getUserInterestsById(session.userId); 
        const userInterestList = userInterests?.interests || [];

        if (userInterestList.length === 0) {
            result = db.characters.query(
                "SELECT * FROM published WHERE visibility = ? ORDER BY algorithmScore DESC LIMIT 30", 
                [visibility]
            );
        } else {
            const orderScoreClauses = userInterestList
                .map(() => `(CASE WHEN tags LIKE ? THEN ? ELSE 0 END)`)
                .join(" + ");

            const orderParams = userInterestList.flatMap(item => [
                `%${item.tag}%`, 
                item.algorithmScore
            ]);

            result = db.characters.query(
                `SELECT * FROM published 
                WHERE visibility = ? 
                ORDER BY (${orderScoreClauses}) DESC, algorithmScore DESC 
                LIMIT 30`,
                [visibility, ...orderParams]
            );
        }

        // Few edits to make;
        // Fetch 30 then filter if the ids were previous liked, read, or followed
        // If less than 30 remaining, fetch 30 more and repeat
        // If over than 30 remaining, filter out those below 30

    } else {
        result = db.characters.query(
            "SELECT * FROM published WHERE visibility = ? ORDER BY algorithmScore DESC LIMIT 30", 
            [visibility]
        );
    }*/

    if (!result.success) return { error: "An error occurred while fetching profiles" }
    if (result.rowCount < 1) return { error: "No profiles found" }

    // DEVELOPER NEEDED: CALL THE VISIBILITY FUNCTION TO DETERMINE IF THE USER CAN VIEW DATA
    // visibility: owner.visibility

    const profiles = result.rows.map((d) => {
        const owner = getPublicUserById(d.ownerId);

        // Check for project too

        return {
            ...d,

            owner: owner
                ? {
                    id: owner.id,
                    username: owner.username,
                    displayName: owner.displayName,
                    badges: owner.badges,
                    type: owner.type
                }
                : null
        };
    });

    return profiles;
}