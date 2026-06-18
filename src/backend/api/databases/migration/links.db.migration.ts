import { DateTime } from "luxon";

import { db, mdb } from "../db.js";
import { log } from "../../instances.js";

const result = mdb.accounts.query("SELECT * from connections");

db.links.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        if (d.verified) continue;
        
        const result = q(
            `INSERT INTO links (
                id,
                url,
                name,
                previewText,
                visibility,
                date
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                d.user,
                d.id,
                d.name,
                d.text,
                d.visibility || "public",
                DateTime.fromSQL(d.date as string, { zone: "utc" }).toISO()
            ]
        );

        if (!result.success) return log.db.error(result.error).save();
    }
});
