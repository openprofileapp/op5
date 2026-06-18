import { DateTime } from "luxon";

import { db, mdb } from "../../db.js";
import { log } from "../../../instances.js";

const result = mdb.interactions.query("SELECT * from follows");

db.interactions.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        
        const result = q(
            `INSERT INTO follows (
                source,
                target,
                date
            ) VALUES (?, ?, ?)`,
            [
                d.user,
                d.interaction,
                DateTime.fromSQL(d.date as string, { zone: "utc" }).toISO()
            ]
        );

        if (!result.success) return log.db.error(result.error).save();
    }
});
