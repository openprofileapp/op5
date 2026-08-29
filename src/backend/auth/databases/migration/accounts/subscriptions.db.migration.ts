import { DateTime } from "luxon";

import { db, mdb } from "../../db.js";
import { log } from "../../../instances.js";

const result = mdb.accounts.query("SELECT * from subscriptions");

db.accounts.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        const result = q(
            `INSERT INTO subscriptions (
                id,
                userId,
                plan,
                method,
                dateStart
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                d.id,
                d.user,
                d.plan,
                d.method,
                DateTime.fromSQL(d.date_start as string, { zone: "utc" }).toISO()
            ]
        );

        if (!result.success) return log.db.error(result.error).save();
    }
});
