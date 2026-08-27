import { DateTime } from "luxon";

import { db, mdb } from "../../db.js";
import { log } from "../../../instances.js";

const result = mdb.accounts.query("SELECT * from notifications");

db.users.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        if (d.type === "LOGIN") continue;
        
        // DEVELOPER NEEDED: Maybe reformat this to display the case id so it can render moderation info
        if (d.type === "CASE_CREATED") {
            d.data = {}
        };

        let parsedData: Record<string, unknown> = {};

        if (d.data != null) {
            let value = d.data;

            if (typeof value === "string") {
                try {
                    value = JSON.parse(value);
                } catch {
                    // Keep raw string if error
                }
            }

            if (typeof value === "number" || (typeof value === "string" && !isNaN(Number(value)) && value.trim() !== "")) {
                parsedData = { count: Number(value) };
            } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                parsedData = value as Record<string, unknown>;
            } else {
                parsedData = { raw: value };
            }
        }

        const mergedData = JSON.stringify({
            ...(d.user != null && { sourceId: d.user }),
            ...(d.asset != null && { targetId: d.asset }),
            ...parsedData,
        });

        const insertResult = q(
            `INSERT INTO notifications (
                userId,
                type,
                data,
                isRead,
                readDate,
                sentDate
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                d.id,
                d.type,
                mergedData,
                d.read,
                DateTime.fromSQL(d.read_date as string, { zone: "utc" }).toISO(),
                DateTime.fromSQL(d.sent_date as string, { zone: "utc" }).toISO()
            ]
        );

        if (!insertResult.success) return log.db.error(insertResult.error).save();
    }
});
