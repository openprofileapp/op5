import { db } from "../server.js";

export default function getPublicUsers(visibility: string = "public") {
    const result = db.accounts.query("SELECT * FROM public WHERE visibility = ?", [visibility]);

    if (!result.success) return { message: "An error occurred while fetching users" }
    if (result.rowCount < 1) return { message: "No users found" }

    const users = result.rows.map((d) => {
        const badgesResult = db.badges.query("SELECT * FROM badges WHERE id = ?", [d.id]);

        if (!badgesResult.success) return { message: "An error occurred while fetching badges" }

        return {
            ...d,
            badges: badgesResult.rows
        };
    });

    return users;
}
