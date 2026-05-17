import { db } from "../server.js";
import getPublicUserById from "./getPublicUserById.service.js";

export default function getPublishedProfiles(visibility: string = "public") {
    const result = db.characters.query("SELECT * FROM published WHERE visibility = ?", [visibility]);

    if (!result.success) return { message: "An error occurred while fetching profiles" }
    if (result.rowCount < 1) return { message: "No profiles found" }

    // CALL THE VISIBILITY FUNCTION TO DETERMINE IF THE USER CAN VIEW DATA
    // visibility: owner.visibility

    const profiles = result.rows.map((d) => {
        const owner = getPublicUserById(d.owner);

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