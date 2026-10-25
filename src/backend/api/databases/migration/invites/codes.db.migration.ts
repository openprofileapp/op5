import { DateTime } from "luxon";

import { db, mdb } from "../../db.js";
import { log } from "../../../instances.js";

const result = mdb.partners.query("SELECT * from codes");

db.invites.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    result.rows.push({
        user: "5719552362357773",
        code: "avatarkage",
        date: "2026-10-25 06:50:00"
    });

    result.rows.push({
        user: "8986001119807525",
        code: "celestrials",
        date: "2026-10-25 06:54:00"
    });

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
