import { AdvancedError } from "kage-library";

import { db } from "../databases/db.js";
import { LinkType, GetLinkType } from "../../../_common/types/link.type.js";
import { buildSqlInClause } from "../../../_common/helpers/sql.js";

export default function getLinksById(
    id: string
): GetLinkType[];

export default function getLinksById(
    ids: string[]
): Record<string, GetLinkType[]>;

export default function getLinksById(
    ids: string | string[]
): GetLinkType[] | Record<string, GetLinkType[]> {
    const isArray = Array.isArray(ids);
    const array = isArray ? ids : [ids];

    if (array.length === 0) {
        return isArray ? {} : [];
    }

    const { clause, params } = buildSqlInClause("id", array);

    const result = db.links.query<LinkType>(
        `SELECT * FROM links WHERE ${clause}`, 
        params
    );

    if (!result.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching links",
            details: result.error
        });
    }

    if (!isArray) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return result.rows.map(({ id, ...rest }) => rest);
    }

    const data: Record<string, GetLinkType[]> = {};

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
