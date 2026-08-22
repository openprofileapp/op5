import { AdvancedError } from "kage-library";

import { db } from "../databases/db.js";
import { BadgeType, GetBadgeType } from "../../../_common/types/badge.type.js";
import { buildSqlInClause } from "../../../_common/helpers/sql.js";

export default function getBadgesById(
    id: string
): GetBadgeType[];

export default function getBadgesById(
    ids: string[]
): Record<string, GetBadgeType[]>;

export default function getBadgesById(
    ids: string | string[]
): GetBadgeType[] | Record<string, GetBadgeType[]> {
    const isArray = Array.isArray(ids);
    const array = isArray ? ids : [ids];

    if (array.length === 0) {
        return isArray ? {} : [];
    }

    const { clause, params } = buildSqlInClause("id", array);

    const result = db.badges.query<BadgeType>(
        `SELECT * FROM badges WHERE ${clause}`, 
        params
    );

    if (!result.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching badges",
            details: result.error
        });
    }

    if (!isArray) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return result.rows.map(({ id, ...rest }) => rest);
    }

    const data: Record<string, GetBadgeType[]> = {};

    for (const id of array) {
        data[id] = [];
    }

    for (const row of result.rows) {
        const { id, ...rest } = row;
        if (data[id]) {
            data[id].push(rest);
        }
    }

    return data;
}
