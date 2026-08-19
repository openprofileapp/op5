import { ValidSessionType } from "../../../_common/types/validSession.type.js";
import { db } from "../databases/db.js";
import getPublicUserById from "./getPublicUserByIdOrUsername.service.js";

export default function getPublishedProfiles(visibility: string = "public", session: ValidSessionType) {
    // If not visibility throw a malformed request

    let result;

    if (session.userId) {
        // Get session user interests here

        // Apply them below with a 20 limit or smth
        result = db.characters.query("SELECT * FROM published WHERE visibility = ?", [visibility]);
    } else {
        result = db.characters.query("SELECT * FROM published WHERE visibility = ?", [visibility]);
    }

    if (!result.success) return { error: "An error occurred while fetching profiles" }
    if (result.rowCount < 1) return { error: "No profiles found" }

    // DEVELOPER NEEDED: CALL THE VISIBILITY FUNCTION TO DETERMINE IF THE USER CAN VIEW DATA
    // visibility: owner.visibility

    const profiles = result.rows.map((d) => {
        const owner = getPublicUserById(d.ownerId);

        // Check for project too

        return {
            ...d,

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
    });

    return profiles;
}