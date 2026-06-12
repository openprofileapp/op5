import { db } from "../server.js";
import getPublicUserById from "./getPublicUserByIdOrUsername.service.js";

export default function getPublishedProfileByOwner(id?: string) {
    if (!id) return { error: "Invalid id" };

    const result = db.characters.query("SELECT * FROM published WHERE ownerId = ?", [id]);

    if (!result.success) return { error: "An error occurred while fetching profile" }
    if (result.rowCount < 1) return { error: "Profile not found" }

    const profile = result.rows[0];
    const owner = getPublicUserById(profile.ownerId);

    // CALL THE VISIBILITY FUNCTION TO DETERMINE IF THE USER CAN VIEW DATA
    // visibility: owner.visibility

    // Check for project too

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