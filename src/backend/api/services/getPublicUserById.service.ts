import { db } from "../server.js";

export default function getPublicUserById(id?: string) {
    const userResult = db.users.query("SELECT * FROM users WHERE id = ?", [id]);
    const badgesResult = db.badges.query("SELECT * FROM badges WHERE id = ?", [id]);

    if (!userResult.success) return { message: "An error occurred while fetching user" }
    if (userResult.rowCount < 1) return { message: "User not found" }
    if (!badgesResult.success) return { message: "An error occurred while fetching badges" }

    return {
        ...userResult.rows[0],
        badges: badgesResult.rows
    };
}