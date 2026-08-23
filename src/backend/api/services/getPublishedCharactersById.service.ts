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

type Options = {
    getAs?: string;
    interactionTypes?: InteractionNameType[];
    interactionMethod?: InteractionMethod;
    interactionCountOnly?: boolean;
}

export default function getPublishedCharactersById(
    id: string,
    options?: Options
): GetPublishedCharacterType | null;

export default function getPublishedCharactersById(
    ids: string[],
    options?: Options
): Record<string, GetPublishedCharacterType[]>;

export default function getPublishedCharactersById(
    ids: string | string[],
    options?: Options
): GetPublishedCharacterType | null | Record<string, GetPublishedCharacterType[]> {
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
            message: "An error occurred while fetching character",
            details: result.error
        });
    }

    if (result.rowCount < 1) {
        return isArray ? {} : null;
    }

    const ownerMap = getOwnersById(
        Array.from(new Set(result.rows.map((row) => row.ownerId)))
    );

    const badgesMap = getBadgesById(
        result.rows.map((row) => row.id)
    );

    const linksMap = getLinksById(
        result.rows.map((row) => row.id)
    )

    const interactionsMap = getInteractionsById(
        result.rows.map((row) => row.id),
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
            interactions: interactionsMap[rest.id] || []
        };
    }

    const data: Record<string, GetPublishedCharacterType[]> = {};

    for (const id of array) {
        data[id] = [];
    }

    for (const row of result.rows) {
        const { ownerId, ...rest } = row;
        if (data[rest.id]) {
            data[rest.id].push({
                ...rest,
                tags: parseTags(rest.tags),
                owner: ownerMap[ownerId]?.[0],
                badges: badgesMap[rest.id] || [],
                links: linksMap[rest.id] || [],
                interactions: interactionsMap[rest.id] || []
            });
        }
    }

    return data;
}
