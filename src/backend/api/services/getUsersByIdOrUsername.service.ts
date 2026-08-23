import { AdvancedError } from "kage-library";

import { db } from "../databases/db.js";
import getBadgesById from "./getBadgesById.service.js";
import { buildSqlInClause } from "../../../_common/helpers/sql.js";
import { parseTags } from "../helpers/parseTags.js";
import { GetUserType, UserType } from "../../../_common/types/user.type.js";
import getInteractionsById from "./getInteractionsById.service.js";
import { InteractionMethod, InteractionNameType } from "../../../_common/types/interaction.type.js";
import getLinksById from "./getLinksById.service.js";

type Options = {
    getAs?: string;
    interactionTypes?: InteractionNameType[];
    interactionMethod?: InteractionMethod;
    interactionCountOnly?: boolean;
}

export default function getUsersByIdOrUsername(
    id: string,
    options?: Options
): GetUserType | null;

export default function getUsersByIdOrUsername(
    ids: string[],
    options?: Options
): Record<string, GetUserType[]>;

export default function getUsersByIdOrUsername(
    ids: string | string[],
    options?: Options
): GetUserType | null | Record<string, GetUserType[]> {
    const isArray = Array.isArray(ids);
    const array = isArray ? ids : [ids];

    if (array.length === 0) {
        return isArray ? {} : null;
    }

    const { clause, params } = buildSqlInClause(
        ["id", "username", "usernameOld"], 
        array
    );

    const result = db.users.query<UserType>(
        `SELECT * FROM users WHERE ${clause}`, 
        params
    );

    if (!result.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching user",
            details: result.error
        });
    }

    if (result.rowCount < 1) {
        return isArray ? {} : null;
    }

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
            types: options?.interactionTypes || ["views", "follows"],
            checkSourceInteraction: options?.getAs,
            countOnly: options?.interactionCountOnly
        }
    );

    if (!isArray) {
        const row = result.rows[0]

        return {
            ...row,
            tags: parseTags(row.tags),
            badges: badgesMap[row.id] || [],
            links: linksMap[row.id] || [],
            interactions: interactionsMap[row.id] || []
        };
    }

    const data: Record<string, GetUserType[]> = {};

    for (const id of array) {
        data[id] = [];
    }

    for (const row of result.rows) {
        if (data[row.id]) {
            data[row.id].push({
                ...result.rows[0],
                tags: parseTags(row.tags),
                badges: badgesMap[row.id] || [],
                links: linksMap[row.id] || [],
                interactions: interactionsMap[row.id] || []
            });
        }
    }

    return data;
}
