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
};

export default function getUsersByIdOrUsername(
    id: string,
    options?: Options
): GetUserType | null;

export default function getUsersByIdOrUsername(
    ids: string[],
    options?: Options
): Map<string, GetUserType>;

export default function getUsersByIdOrUsername(
    ids: string | string[],
    options?: Options
): GetUserType | null | Map<string, GetUserType> {
    const isArray = Array.isArray(ids);
    const array = isArray ? ids : [ids];

    if (array.length === 0) {
        return isArray ? new Map() : null;
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
        return isArray ? new Map() : null;
    }

    const userIds = result.rows.map((row) => row.id);

    const badgesMap = getBadgesById(userIds);

    const linksMap = getLinksById(userIds);

    const interactionsMap = getInteractionsById(
        userIds,
        { 
            method: options?.interactionMethod || "target",
            types: options?.interactionTypes || ["views", "follows"],
            checkSourceInteraction: options?.getAs,
            countOnly: options?.interactionCountOnly
        }
    );

    const formatUser = (row: UserType): GetUserType => ({
        ...row,
        tags: parseTags(row.tags),
        badges: badgesMap[row.id] || [],
        links: linksMap[row.id] || [],
        interactions: interactionsMap[row.id] || {}
    });

    if (!isArray) {
        return formatUser(result.rows[0]);
    }

    const dataMap = new Map<string, GetUserType>();

    for (const inputKey of array) {
        const match = result.rows.find(
            (row) => row.id === inputKey || row.username === inputKey || row.usernameOld === inputKey
        );

        if (match) {
            dataMap.set(inputKey, formatUser(match));
        }
    }

    return dataMap;
}
