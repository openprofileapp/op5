import { db } from "../server.js";

export default function getPublicUserByIdOrUsername(id?: string) {
    const userResult = db.users.query("SELECT * FROM users WHERE id = ? OR username = ? OR usernameOld = ?", [id, id, id]);
    
    if (!userResult.success) return { message: "An error occurred while fetching user" }
    if (userResult.rowCount < 1) return { message: "User not found" }

    const badgesResult = db.badges.query("SELECT * FROM badges WHERE id = ?", [userResult.rows[0].id]);

    if (!badgesResult.success) return { message: "An error occurred while fetching badges" }

    const linksResult = db.links.query("SELECT * FROM links WHERE id = ?", [userResult.rows[0].id]);

    if (!linksResult.success) return { message: "An error occurred while fetching links" }

    const followingResult = db.interactions.query("SELECT * FROM follows WHERE sourceId = ?", [userResult.rows[0].id]);
    const followersResult = db.interactions.query("SELECT * FROM follows WHERE targetId = ?", [userResult.rows[0].id]);

    if (!followingResult.success || !followersResult.success) return { message: "An error occurred while fetching follows" }

    return {
        ...userResult.rows[0],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        badges: badgesResult.rows.map(({ id, ...badge }) => badge),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        links: linksResult.rows.map(({ id, ...link }) => link),
        interactions: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            following: followingResult.rows.map(({ sourceId, ...follow }) => follow),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            followers: followersResult.rows.map(({ targetId, ...follower }) => follower),
        }

        // Get the count somewhere, but not as var, but count directly from the query
    };
}