import { DateTime } from "luxon";

import { db, mdb } from "../../db.js";
import { log } from "../../../instances.js";

const result = mdb.accounts.query("SELECT * from webpush");

db.users.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        const result = q(
            `INSERT INTO webpush (
                userId,
                endpoint,
                keys,
                date
            ) VALUES (?, ?, ?, ?)`,
            [
                d.user,
                d.endpoint,
                d.keys,
                DateTime.fromSQL(d.registered_date as string, { zone: "utc" }).toISO()
            ]
        );

        if (!result.success) return log.db.error(result.error).save();
    }
})
