import { db } from "../server.js";

// Add an offset
export default function getAllUsers() {
    const result = db.users.query(
  "SELECT * FROM users WHERE visibility NOT IN ('private', 'hidden')"
);
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
