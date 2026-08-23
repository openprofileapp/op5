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
import { i18n } from "../instances.js";

// DEVELOPER NEEDED: Add an option to skip interaction and link fetching
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
): Map<string, GetPublishedCharacterType>;

export default function getPublishedCharactersById(
    ids: string | string[],
    options?: Options
): GetPublishedCharacterType | null | Map<string, GetPublishedCharacterType> {
    const isArray = Array.isArray(ids);
    const array = isArray ? ids : [ids];

    if (array.length === 0) {
        return isArray ? new Map() : null;
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
        return isArray ? new Map() : null;
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
            types: options?.interactionTypes || ["views", "likes"],
            checkSourceInteraction: options?.getAs,
            countOnly: options?.interactionCountOnly
        }
    );

    if (!isArray) {
        const { ownerId, ...rest } = result.rows[0];

        return {
            ...rest,
            tags: parseTags(rest.tags),
            owner: ownerMap[ownerId]?.[0],
            badges: badgesMap[rest.id] || [],
            links: linksMap[rest.id] || [],
            interactions: interactionsMap[rest.id] || {}
        };
    }

    const dataMap = new Map<string, GetPublishedCharacterType>();
    const rowMap = new Map(result.rows.map(row => [row.id, row]));

    for (const id of array) {
        const row = rowMap.get(id);
        if (!row) continue;

        const { ownerId, ...rest } = row;

        dataMap.set(rest.id, {
            ...rest,
            tags: parseTags(rest.tags),
            owner: ownerMap[ownerId]?.[0],
            badges: badgesMap[rest.id] || [],
            links: linksMap[rest.id] || [],
            interactions: interactionsMap[rest.id] || {}
        });
    }

    return dataMap;
}
