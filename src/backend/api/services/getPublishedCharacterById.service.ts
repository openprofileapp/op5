import { AdvancedError } from "kage-library";

import { CharacterType } from "../../../_common/types/queries/character.type.js";
import { db } from "../databases/db.js";
import getUserByIdOrUsername from "./getUserByIdOrUsername.service.js";
import { getPublishedCharacterType } from "../../../_common/types/getPublishedCharacter.type.js";
import getBadgesById from "./getBadgesById.service.js";

export default function getPublishedCharacterById(id: string): getPublishedCharacterType {
    const characterResult = db.characters.query<CharacterType>(
        "SELECT * FROM published WHERE id = ?", 
        [id]
    );

    if (!characterResult.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching characters",
            details: characterResult.error
        });
    }

    if (characterResult.rowCount < 1) {
        throw new AdvancedError({
            code: 404,
            message: "Character not found"
        });
    }

    const { ownerId, ...character } = characterResult.rows[0];

    const owner = getUserByIdOrUsername(ownerId);
    const badges = getBadgesById(character.id);

    return {
        ...character,
        owner: {
                id: owner.id,
                username: owner.username,
                displayName: owner.displayName,
                badges: owner.badges,
                type: owner.type
            },
        badges,
        // DEVELOPER NEEDED: Get the interaction data from session if logged in
    };
}
