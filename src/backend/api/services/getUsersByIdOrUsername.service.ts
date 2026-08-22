import { AdvancedError } from "kage-library";

import { db } from "../databases/db.js";
import getBadgesById from "./getBadgesById.service.js";
import { GetUserType, UserType } from "../../../_common/types/user.type.js";
import { buildSqlInClause } from "../../../_common/helpers/sql.js";
import { parseTags } from "../helpers/parseTags.js";

export default function getUsersByIdOrUsername(
    id: string
): GetUserType | null;

export default function getUsersByIdOrUsername(
    ids: string[]
): Record<string, GetUserType[]>;

export default function getUsersByIdOrUsername(
    ids: string | string[]
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
            message: "An error occurred while fetching users",
            details: result.error
        });
    }

    if (result.rowCount < 1) {
        return isArray ? {} : null;
    }

    const userIds = result.rows.map((row) => row.id);

    const badgesMap = getBadgesById(userIds);

    if (!isArray) {
        const row = result.rows[0];
        
        return {
            ...row,
            tags: parseTags(row.tags),
            badges: badgesMap[row.id] || []
        };
    }

    const data: Record<string, GetUserType[]> = {};

    for (const key of array) {
        data[key] = [];
    }

    for (const row of result.rows) {
        const userPayload: GetUserType = {
            ...row,
            tags: parseTags(row.tags),
            badges: badgesMap[row.id] || []
        };

        for (const key of array) {
            if (row.id === key || row.username === key || row.usernameOld === key) {
                data[key].push(userPayload);
            }
        }
    }

    return data;
}




/*
// DEVELOPER NEEDED: Rename to getUserProfileByIdOrUsername
export default function GetUserType(id?: string): GetUserType {

    const linksResult = db.links.query<LinkType>(
        "SELECT * FROM links WHERE id = ?", 
        [userResult.rows[0].id]
    );

    if (!linksResult.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching links",
            details: linksResult.error
        })
    }

    const followingResult = db.interactions.query(
        "SELECT * FROM follows WHERE source = ?", 
        [userResult.rows[0].id]
    );

    const followersResult = db.interactions.query(
        "SELECT * FROM follows WHERE target = ?", 
        [userResult.rows[0].id]
    );

    if (!followingResult.success || !followersResult.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching follows",
            details: {
            ...(!followingResult.success && { following: followingResult.error }),
            ...(!followersResult.success && { followers: followersResult.error }),
            }
        })
    }
    
    return {
        ...userResult.rows[0],
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        badges: badges.map(({ id, ...badge }) => badge),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        links: linksResult.rows.map(({ id, ...link }) => link),
        interactions: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            following: followingResult.rows.map(({ source, ...follow }) => follow),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            followers: followersResult.rows.map(({ target, ...follower }) => follower),
        }

        // Get the count somewhere, but not as var, but count directly from the query
    };
}
*/