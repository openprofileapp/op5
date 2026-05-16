import { db } from "../server.js";
import getPublicUserById from "./getPublicUserById.service.js";

export default function getPublishedProfileById(id?: string) {
    const result = db.characters.query("SELECT * FROM published WHERE id = ?", [id]);

    if (!result.success) return { message: "An error occurred while fetching profile" }
    if (result.rowCount < 1) return { message: "Profile not found" }

    const profile = result.rows[0];
    const owner = getPublicUserById(profile.owner);

    // CALL THE VISIBILITY FUNCTION TO DETERMINE IF THE USER CAN VIEW DATA
    // visibility: owner.visibility

    return {
        ...profile,
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
}