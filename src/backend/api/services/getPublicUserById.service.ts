import { db } from "../server.js";

export default function getPublicUserById(id?: string) {
    const publicResult = db.accounts.query("SELECT * FROM public WHERE id = ?", [id]);
    const badgesResult = db.badges.query("SELECT * FROM badges WHERE id = ?", [id]);

    if (!publicResult.success) return { message: "An error occurred while fetching user" }
    if (publicResult.rowCount < 1) return { message: "User not found" }
    if (!badgesResult.success) return { message: "An error occurred while fetching badges" }

    return {
        ...publicResult.rows[0],
        badges: badgesResult.rows
    };
}