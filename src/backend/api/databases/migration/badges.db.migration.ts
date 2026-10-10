import { DateTime } from "luxon";

import { db, mdb } from "../db.js";
import { log } from "../../instances.js";
import { BadgeNameType } from "../../../../_common/types/badge.type.js";

const allowed: readonly BadgeNameType[] = [
    "OFFICIAL",
    "PARTNER",
    "PREMIUM",
    "PROMOTED",
    "STAFF",
    "UNOFFICIAL",
    "VERIFIED",
    "LIMITED"
];

const result = mdb.accounts.query("SELECT * from badges");

db.badges.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    const rows = [...result.rows].sort(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    rows.push({
        user: "8057185762390040",
        type: "staff",
        text: "Social Media Manager",
        date: "2026-05-08T01:53:00.000Z"
    });

    rows.push({
        user: "3912544802938547",
        type: "staff",
        text: "Graphics Designer",
        date: "2026-06-12T00:17:00.000Z"
    });

    rows.push({
        user: "1844584278027570",
        type: "staff",
        text: "Support Agent",
        date: "2026-10-18T17:18:00.000Z"
    });

    for (const d of rows) {
        if (d.type === "admin") {
            d.text = "Administrator";
        }

        if (d.type === "moderator") {
            d.text = "Moderator";
        }

        if (d.type === "admin" || d.type === "moderator") {
            d.type = "staff";
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        d.type = d.type?.toUpperCase();

        if (d.user === "0000000000000000" && d.type === "staff") continue;

        if (!allowed.includes(d.type as BadgeNameType)) {
            continue;
        }

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
