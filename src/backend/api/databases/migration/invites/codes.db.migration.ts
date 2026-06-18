import { DateTime } from "luxon";

import { db, mdb } from "../../db.js";
import { log } from "../../../instances.js";

const result = mdb.partners.query("SELECT * from codes");

db.invites.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        const result = q(
            `INSERT INTO codes (
                ownerId,
                code,
                isUnlimited,
                createdDate
            ) VALUES (?, ?, ?, ?)`,
            [
                d.user,
                d.code,
                1,
                DateTime.fromSQL(d.date as string, { zone: "utc" }).toISO()
            ]
        );

        if (!result.success) return log.db.error(result.error).save();
    }
});