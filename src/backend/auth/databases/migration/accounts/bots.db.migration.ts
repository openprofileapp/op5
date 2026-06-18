import { DateTime } from "luxon";

import { db, mdb } from "../../db.js";
import { log } from "../../../instances.js";

const result = mdb.accounts.query("SELECT * from bots");

db.accounts.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        const result = q(
            `INSERT INTO bots (
                id,
                token,
                ownerId,
                displayName,
                about,
                permissions,
                lastActive,
                createdDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                d.id,
                d.token,
                d.owner,
                d.name,
                d.about,
                d.permissions,
                d.last_active,
                DateTime.fromSQL(d.created_date as string, { zone: "utc" }).toISO()
            ]
        );

        if (!result.success) return log.db.error(result.error).save();
    }
});