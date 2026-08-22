import { AdvancedError } from "kage-library";

import { db } from "../databases/db.js";
import { BadgeType } from "../../../_common/types/queries/badge.type.js";
import { GetBadgeType } from "../../../_common/types/getBadge.type.js";

export default function getBadgesById(id: string): GetBadgeType[]  {
    const result = db.badges.query<BadgeType>(
        "SELECT * FROM badges WHERE id = ?", 
        [id]
    );

    if (!result.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching badges",
            details: result.error
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return result.rows.map(({ id, ...badge }) => badge);
}
