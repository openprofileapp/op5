import { AdvancedError } from "kage-library";

import { db } from "../databases/db.js";
import getBadgesById from "./getBadgesById.service.js";
import { UserType } from "../../../_common/types/user.type.js";
import { buildSqlInClause } from "../../../_common/helpers/sql.js";
import { OwnerType } from "../../../_common/types/owner.type.js";
import { GetBadgeType } from "../../../_common/types/badge.type.js";

function formatOwner(
    row: UserType, 
    badgesMap: Record<string, GetBadgeType[]>
): OwnerType {
    return {
        id: row.id,
        username: row.username,
        displayName: row.displayName,
        isVerified: (badgesMap[row.id] || []).some((badge) => badge.type === "verified"),
        type: row.type
    };
}

export default function getOwnersById(
    id: string
): OwnerType | null;

export default function getOwnersById(
    ids: string[]
): Record<string, OwnerType[]>;

export default function getOwnersById(
    ids: string | string[]
): OwnerType | null | Record<string, OwnerType[]> {
    const isArray = Array.isArray(ids);
    const array = isArray ? ids : [ids];

    if (array.length === 0) {
        return isArray ? {} : null;
    }

    const { clause, params } = buildSqlInClause("id", array);

    const result = db.users.query<UserType>(
        `SELECT * FROM users WHERE ${clause}`, 
        params
    );

    if (!result.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching owner",
            details: result.error
        });
    }

    if (result.rowCount < 1) {
        return isArray ? {} : null;
    }

    const userIds = result.rows.map((row) => row.id);
    const badgesMap = getBadgesById(userIds);

    if (!isArray) {
        return formatOwner(result.rows[0], badgesMap);
    }

    const data: Record<string, OwnerType[]> = {};

    for (const key of array) {
        data[key] = [];
    }

    for (const row of result.rows) {
        const ownerPayload = formatOwner(row, badgesMap);

        if (data[row.id]) {
            data[row.id].push(ownerPayload);
        }
    }

    return data;
}
