import { DateTime } from "luxon";

import { db, mdb } from "../../db.js";
import { log } from "../../../instances.js";
import { assertDbSuccess } from "../../../../../_common/asserts/dbSuccess.assert.js";
import { CollectionType } from "../../../../../_common/types/collection.type.js";

const result = mdb.accounts.query("SELECT * from notifications");

db.notifications.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        if (d.type === "LOGIN") continue;

        if (d.type === "FOLLOW" && d.data === "{}") {
            d.type = "NEW_FOLLOW"
        }

        if (d.type === "LIKE" && d.data === "{}") {
            d.type = "NEW_LIKE"
        }

        if (d.type === "READ") {
            d.type = "READS_MILESTONE"
        }

        if (d.type === "SHARE") {
            d.type = "SHARES_MILESTONE"
        }

        if (d.type === "VIEW") {
            d.type = "VIEWS_MILESTONE"
        }

        if (d.type === "PROFILE_PUBLISH") {
            d.type = "PUBLISHED_CHARACTER"
        }

        if (d.type === "FAVORITE") {
            d.type = "ADD_TO_COLLECTION"
        }

        if (d.type === "PROFILE_UPDATE") {
            d.type = "UPDATED_CHARACTER"
        }

        if (d.type === "UPDATED_CHARACTER" && d.id === d.user) {
            continue;
        }

        let parsedData: Record<string, unknown> = {};

        if (d.data !== null) {
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

        let collection;

        if (d.type === "ADD_TO_COLLECTION") {
            const result = db.collections.query<CollectionType>(
                "SELECT * FROM collections WHERE ownerId = ? AND isFavorites = 1",
                [d.user]
            );

            assertDbSuccess(result)

            collection = result.rows?.[0]?.id;
        }

        const mergedData = JSON.stringify({
            ...(d.user !== null && { source: d.user }),
            ...(d.asset !== null && { target: d.asset }),
            ...(d.type === "ADD_TO_COLLECTION" && { collection }),
            ...parsedData,
        });

        const insertResult = q(
            `INSERT INTO inbox (
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
