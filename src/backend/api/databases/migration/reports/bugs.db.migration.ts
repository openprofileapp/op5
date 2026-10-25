import { DateTime } from "luxon";

import { db, mdb } from "../../db.js";
import { log } from "../../../instances.js";

const result = mdb.moderation.query("SELECT * from reports");

db.reports.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        if (String(d.description).startsWith("This is a test")) {
            continue;
        }

        if (d.id === "5116540808485836") {
            d.type = "ui"
        }

        if (d.id === "1533731839021769") {
            d.type = "localization"
        }

        const insertResult = q(
            `INSERT INTO bugs (
                id,
                source,
                type,
                description,
                affectsNightly,
                status,
                date
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                d.id,
                d.reported_by,
                d.type,
                d.description,
                1,
                d.status,
                DateTime.fromSQL(d.reported_date as string, { zone: "utc" }).toISO()
            ]
        );

        if (!insertResult.success) return log.db.error(insertResult.error).save();
    }
});
