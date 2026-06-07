import { db } from "../server.js";

export default function getPublicUserByIdOrUsername(id?: string) {
    const userResult = db.users.query("SELECT * FROM users WHERE id = ? OR username = ? OR usernameOld = ?", [id, id, id]);
    
    if (!userResult.success) return { message: "An error occurred while fetching user" }
    if (userResult.rowCount < 1) return { message: "User not found" }

    const badgesResult = db.badges.query("SELECT * FROM badges WHERE id = ?", [userResult.rows[0].id]);

    if (!badgesResult.success) return { message: "An error occurred while fetching badges" }

    const linksResult = db.links.query("SELECT * FROM links WHERE id = ?", [userResult.rows[0].id]);

    if (!linksResult.success) return { message: "An error occurred while fetching links" }

    return {
        ...userResult.rows[0],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        badges: badgesResult.rows.map(({ id, ...badge }) => badge),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        links: linksResult.rows.map(({ id, ...link }) => link),
    };
}