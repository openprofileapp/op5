import { DateTime } from "luxon";

import { db, mdb } from "../../db.js";
import { log } from "../../../instances.js";

const result = mdb.interactions.query("SELECT * from views");

db.interactions.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (d.user && d.user.includes(".")) d.user = "unknown";
        
        const result = q(
            `INSERT INTO views (
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
