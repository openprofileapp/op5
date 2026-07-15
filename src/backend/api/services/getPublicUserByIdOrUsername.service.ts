import { AdvancedError } from "kage-library";

import { db } from "../databases/db.js";

export default function getPublicUserByIdOrUsername(id?: string) {
    const userResult = db.users.query(
        "SELECT * FROM users WHERE id = ? OR username = ? OR usernameOld = ?", 
        [id, id, id]
    );

    if (!userResult.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching user",
            details: userResult.error
        })
    }

    if (userResult.rowCount < 1) {
        throw new AdvancedError({
            code: 404,
            message: "User not found"
        })
    }
  
    const badgesResult = db.badges.query(
        "SELECT * FROM badges WHERE id = ?", 
        [userResult.rows[0].id]
    );

    if (!badgesResult.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching badges",
            details: badgesResult.error
        })
    }

    const linksResult = db.links.query(
        "SELECT * FROM links WHERE id = ?", 
        [userResult.rows[0].id]
    );

    if (!linksResult.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching links",
            details: linksResult.error
        })
    }

    const followingResult = db.interactions.query(
        "SELECT * FROM follows WHERE source = ?", 
        [userResult.rows[0].id]
    );

    const followersResult = db.interactions.query(
        "SELECT * FROM follows WHERE target = ?", 
        [userResult.rows[0].id]
    );

    if (!followingResult.success || !followersResult.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching follows",
            details: {
            ...(!followingResult.success && { following: followingResult.error }),
            ...(!followersResult.success && { followers: followersResult.error }),
            }
        })
    }
    
    return {
        ...userResult.rows[0],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        badges: badgesResult.rows.map(({ id, ...badge }) => badge),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        links: linksResult.rows.map(({ id, ...link }) => link),
        interactions: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            following: followingResult.rows.map(({ source, ...follow }) => follow),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            followers: followersResult.rows.map(({ target, ...follower }) => follower),
        }

        // Get the count somewhere, but not as var, but count directly from the query
    };
}