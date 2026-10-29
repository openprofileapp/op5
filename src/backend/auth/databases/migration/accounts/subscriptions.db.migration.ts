import { DateTime } from "luxon";

import { db, mdb } from "../../db.js";
import { log } from "../../../instances.js";

const result = mdb.accounts.query("SELECT * from subscriptions");

db.billing.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        if (d.plan === "lifetime-premium") {
            d.plan = "PREMIUM_LIFETIME";
        }

        if (d.method === "precursor") {
            d.method = "PRECURSOR_GIFT";
        }

        const result = q(
            `INSERT INTO subscriptions (
                id,
                userId,
                plan,
                method,
                status,
                dateCreated,
                dateStarted
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                d.id,
                d.user,
                d.plan,
                d.method,
                "ACTIVE",
                DateTime.fromSQL(d.date_start as string, { zone: "utc" }).toISO(),
                DateTime.fromSQL(d.date_start as string, { zone: "utc" }).toISO()
            ]
        );

        if (!result.success) return log.db.error(result.error).save();
    }
});
