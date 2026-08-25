import { AdvancedError } from "kage-library";

import { db } from "../databases/db.js";
import getBadgesById from "./getBadgesById.service.js";
import { buildSqlInClause } from "../../../_common/helpers/sql.js";
import { parseTags } from "../helpers/parseTags.js";
import { GetUserType, UserType } from "../../../_common/types/user.type.js";
import getInteractionsById from "./getInteractionsById.service.js";
import { InteractionMethod, InteractionNameType } from "../../../_common/types/interaction.type.js";
import getLinksById from "./getLinksById.service.js";
import getUsernamesById from "./geUsernamesById.service.js";

type Options = {
    getAs?: string;
    interactionTypes?: InteractionNameType[];
    interactionMethod?: InteractionMethod;
    interactionCountOnly?: boolean;
};

export default function getUsersById(
    id: string,
    options?: Options
): GetUserType | null;

export default function getUsersById(
    ids: string[],
    options?: Options
): Record<string, GetUserType>;

export default function getUsersById(
    ids: string | string[],
    options?: Options
): GetUserType | null | Record<string, GetUserType> {
    const isArray = Array.isArray(ids);
    const array = isArray ? ids : [ids];

    if (array.length === 0) {
        return isArray ? {} : null;
    }

    const { clause, params } = buildSqlInClause(
        "id", array
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

    const userIds = result.rows.map((row) => row.id);

    const usernamesMap = getUsernamesById(userIds);

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

    /*
    
    // DEVELOPER NEEDED: Copy over the published character code and format this
    const sanitizedCharacters = visibleCharacters.map((character) => {
        if (character.displayName === "TEMP") {
            const characterInteractions = interactionsMap[character.id];
            const isFollowing = characterInteractions?.follows?.hasInteracted;

            if (!isFollowing) {
                return {
                    ...character,
                    displayName: undefined
                };
            }
        }

        return character;
    });
    */

    const formatUser = (row: UserType): GetUserType => ({
        ...row,
        tags: parseTags(row.tags),
        usernames: usernamesMap[row.id] || [],
        badges: badgesMap[row.id] || [],
        links: linksMap[row.id] || [],
        interactions: interactionsMap[row.id] || {}
    });

    if (!isArray) {
        return formatUser(result.rows[0]);
    }

    const data: Record<string, GetUserType> = {};

    for (const inputKey of array) {
        const match = result.rows.find(
            (row) => row.id === inputKey
        );

        if (match) {
            data[inputKey] = formatUser(match);
        }
    }

    return data;
}
