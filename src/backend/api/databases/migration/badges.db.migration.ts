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
    "VERIFIED",
    "LIMITED"
];

const newData = [
    {
        user: "8057185762390040",
        type: "staff",
        text: "Social Media Manager",
        date: "2026-05-08 01:53:00"
    },
    {
        user: "3912544802938547",
        type: "staff",
        text: "Graphics Designer",
        date: "2026-06-12 00:17:00"
    },
    {
        user: "1844584278027570",
        type: "staff",
        text: "Support Agent",
        date: "2026-10-18 17:18:00"
    },
    {
        user: "5719552362357773",
        type: "partner",
        text: "avatarkage",
        date: "2026-10-25 06:50:00"
    },
    {
        user: "1844584278027570",
        type: "partner",
        text: "kiraskun",
        date: "2026-10-25 10:12:00"
    }
]

const result = mdb.accounts.query("SELECT * from badges");

db.badges.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    const rows = [...result.rows].sort(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    rows.push(...newData);

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

db.notifications.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    const rows = [...result.rows].sort(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    rows.push(...newData);

    for (const d of rows) {
        let canProceed;

        if (d.type === "verified") {
            canProceed = true;

            d.type = "ACCOUNT_VERIFIED";
        }

        if (d.type === "partner") {
            canProceed = true;

            d.type = "PARTNER_PROGRAM";
        }

        if (d.type === "premium") {
            canProceed = true;

            d.type = "GIFTED_PREMIUM";
            d.source = "9534968913312158";
            d.count = -1
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (["admin", "moderator", "staff"].includes(d.type?.toLowerCase())) {
            canProceed = true;
            d.type = "ASSIGNED_STAFF";
        }

        if (!canProceed) continue;

        const mergedData = JSON.stringify({
            ...(d.source !== null && { source: d.source }),
            ...(d.count !== null && { count: d.count })
        });

        const insertResult = q(
            `INSERT INTO inbox (
                userId,
                type,
                data,
                sentDate
            ) VALUES (?, ?, ?, ?)`,
            [
                d.user,
                d.type,
                mergedData,
                DateTime.fromSQL(d.date as string, { zone: "utc" }).toISO()
            ]
        );

        if (!insertResult.success) return log.db.error(insertResult.error).save();
    }
});
