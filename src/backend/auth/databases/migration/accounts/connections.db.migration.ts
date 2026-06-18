import { DateTime } from "luxon";

import { db, mdb } from "../../db.js";
import { log } from "../../../instances.js";

const result = mdb.accounts.query("SELECT * from connections");

db.accounts.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        if (!d.verified) continue;

        const result = q(
            `INSERT INTO connections (
                userId,
                connectionId,
                connectionName,
                isMfa,
                connectedDate
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                d.user,
                d.id,
                d.name,
                d.mfa_enabled,
                DateTime.fromSQL(d.date as string, { zone: "utc" }).toISO()
            ]
        );

        if (!result.success) return log.db.error(result.error).save();
    }
});