import { AdvancedError } from "kage-library";

import { db } from "../databases/db.js";
import getBadgesById from "./getBadgesById.service.js";
import { buildSqlInClause } from "../../../_common/helpers/sql.js";
import { parseTags } from "../helpers/parseTags.js";
import { GetPublishedCharacterType, PublishedCharacterType } from "../../../_common/types/character.type.js";
import getOwnersById from "./getOwnersById.service.js";
import getInteractionsById from "./getInteractionsById.service.js";
import { InteractionMethod, InteractionNameType } from "../../../_common/types/interaction.type.js";
import getLinksById from "./getLinksById.service.js";
import { i18n } from "../../_common/instances.js";

type Options = {
    getAs?: string;
    interactionTypes?: InteractionNameType[];
    interactionMethod?: InteractionMethod;
    interactionCountOnly?: boolean;
};

export default function getPublishedCharactersById(
    id: string,
    options?: Options
): GetPublishedCharacterType | null;

export default function getPublishedCharactersById(
    ids: string[],
    options?: Options
): Record<string, GetPublishedCharacterType>;

export default function getPublishedCharactersById(
    ids: string | string[],
    options?: Options
): GetPublishedCharacterType | null | Record<string, GetPublishedCharacterType> {
    const isArray = Array.isArray(ids);
    const array = isArray ? ids : [ids];

    if (array.length === 0) {
        return isArray ? {} : null;
    }

    const { clause, params } = buildSqlInClause("id", array);

    const result = db.characters.query<PublishedCharacterType>(
        `SELECT * FROM published WHERE ${clause}`, 
        params
    );

    if (!result.success) {
        throw new AdvancedError({
            code: 500,
            message: i18n.t("responses.error.character"),
            details: result.error
        });
    }

    if (result.rowCount < 1) {
        return isArray ? {} : null;
    }

    const characterIds = result.rows.map((row) => row.id);

    const ownerMap = getOwnersById(
        Array.from(new Set(result.rows.map((row) => row.ownerId)))
    );

    const badgesMap = getBadgesById(characterIds);

    const linksMap = getLinksById(characterIds);

    const interactionsMap = getInteractionsById(
        characterIds,
        { 
            method: options?.interactionMethod || "target",
            types: options?.interactionTypes || [
                "dismisses",
                "follows",
                "hiddenCollaborations",
                "hides",
                "likes",
                "mutes",
                "views"
            ],
            checkSourceInteraction: options?.getAs,
            countOnly: options?.interactionCountOnly
        }
    );

    // DEVELOPER NEEDED: Turn this into a resuable function
    const visibleCharacters = result.rows.filter((character) => {
        if (character.ownerId === options?.getAs) return true;

        if (character.visibility === "public") return true;
        // DEVELOPER NEEDED: Only dsplay unlisted if on a profile directly; need an options.pageType or smth
        if (character.visibility === "unlisted") return false;
        if (character.visibility === "private") return false; // Only display on owner profile regardless if owner or not

        if (character.visibility === "registered" && options?.getAs) return true;

        if (character.visibility === "followers") {            
            if (interactionsMap[character.id]?.follows?.hasInteracted) {
                return true;
            }
        }

        if (character.visibility === "friends" && options?.getAs) {
            const result = db.interactions.query(
                `
                    SELECT 1 FROM friends 
                        WHERE (source = ? AND target = ?) 
                        OR (source = ? AND target = ?)
                `,
                [character.ownerId, options.getAs, options.getAs, character.ownerId]
            );

            console.log(result)

            if (!result.success) {
                throw new AdvancedError({
                    code: 500,
                    message: "An error occurred while fetching friends",
                    details: result.error
                })
            }

            if (result.rowCount === 2) {
                return true;
            }
        }
        
        return false;
    });

    if (!isArray) {
        const { ownerId, ...rest } = visibleCharacters[0];

        return {
            ...rest,
            tags: parseTags(rest.tags),
            owner: ownerMap[ownerId]?.[0],
            badges: badgesMap[rest.id] || [],
            links: linksMap[rest.id] || [],
            interactions: interactionsMap[rest.id] || {}
        };
    }

    const data: Record<string, GetPublishedCharacterType> = {};
    const rowMap = new Map(visibleCharacters.map(row => [row.id, row]));

    for (const id of array) {
        const row = rowMap.get(id);
        if (!row) continue;

        const { ownerId, ...rest } = row;

        data[rest.id] = {
            ...rest,
            tags: parseTags(rest.tags),
            owner: ownerMap[ownerId]?.[0],
            badges: badgesMap[rest.id] || [],
            links: linksMap[rest.id] || [],
            interactions: interactionsMap[rest.id] || {}
        };
    }

    return data;
}
