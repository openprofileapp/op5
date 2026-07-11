import { DateTime } from "luxon";

import { db, mdb } from "../db.js";
import { log } from "../../instances.js";

const result = mdb.accounts.query("SELECT * from badges");

db.badges.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    let presursorCount = 0;

    const rows = [...result.rows].sort(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    rows.push({
        user: "8057185762390040",
        type: "staff",
        text: "Social Media Manager",
        date: "2026-05-08T01:53:00Z"
    });

    rows.push({
        user: "3912544802938547",
        type: "staff",
        text: "Graphics Designer",
        date: "2026-06-12T00:17:00Z"
    });

    for (const d of rows) {
        if (d.type === "admin" || d.type === "moderator") {
            d.type = "staff";
        }

        if (d.type === "admin") {
            d.text = "Administrator";
        }

        if (d.type === "moderator") {
            d.text = "Moderator";
        }

        if (d.type === "precursor") {
            presursorCount++;

            d.text = `Registration #${presursorCount}`;
        }

        if (d.user === "0000000000000000" && d.type === "staff") continue;

        const result = q(
            `INSERT INTO badges (
                id,
                type,
                comment,
                visibility,
                date
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                d.user,
                d.type,
                d.text,
                d.visibility || "public",
                DateTime.fromSQL(d.date as string, { zone: "utc" }).toISO()
            ]
        );

        if (!result.success) return log.db.error(result.error).save();
    }
});