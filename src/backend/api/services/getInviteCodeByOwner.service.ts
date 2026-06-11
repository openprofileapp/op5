import { db } from "../server.js";

export default function getInviteCodeByOwner(id?: string) {
    const codeResult = db.invites.query("SELECT * FROM codes WHERE ownerId = ?", [id]);
    if (!codeResult.success) return { error: "An error occurred while fetching invite code" }
    if (codeResult.rowCount < 1) return { error: "Code not found" }
    const usesResult = db.invites.query("SELECT * FROM uses WHERE code = ?", [codeResult.rows[0]?.code]);
    if (!usesResult.success) return { error: "An error occurred while fetching invite uses" }

    // ONLY SHOW USES IF OWNER

    return {
        ...codeResult.rows[0],
        uses: usesResult.rowCount
    };
}