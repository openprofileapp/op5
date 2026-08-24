import { AdvancedError } from "kage-library";

import { db } from "../databases/db.js";
import { UsernameType, GetUsernameType } from "../../../_common/types/username.type.js";
import { buildSqlInClause } from "../../../_common/helpers/sql.js";

export default function getUsernamesById(
    id: string
): GetUsernameType[];

export default function getUsernamesById(
    ids: string[]
): Record<string, GetUsernameType[]>;

export default function getUsernamesById(
    ids: string | string[]
): GetUsernameType[] | Record<string, GetUsernameType[]> {
    const isArray = Array.isArray(ids);
    const array = isArray ? ids : [ids];

    if (array.length === 0) {
        return isArray ? {} : [];
    }

    const { clause, params } = buildSqlInClause("userId", array);

    const result = db.users.query<UsernameType>(
        `SELECT * FROM usernames 
         WHERE ${clause} 
         ORDER BY isPrimary DESC, addedDate ASC`, 
        params
    );

    if (!result.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching usernames",
            details: result.error
        });
    }

    if (!isArray) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return result.rows.map(({ userId, ...rest }) => rest);
    }

    const data: Record<string, GetUsernameType[]> = {};

    for (const userId of array) {
        data[userId] = [];
    }

    for (const row of result.rows) {
        const { userId, ...rest } = row;
        if (data[userId]) {
            data[userId].push(rest);
        }
    }

    return data;
}
