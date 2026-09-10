import { DateTime } from "luxon";

import { db, mdb } from "../db.js";
import { log } from "../../instances.js";
import { AwardNameType } from "../../../../_common/types/award.type.js";

const allowed: readonly AwardNameType[] = [
    "CONTRIBUTOR",
    "ENTOMOLOGIST",
    "PRECURSOR"
];

const result = mdb.accounts.query("SELECT * from badges");

db.awards.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    let presursorCount = 0;

    const rows = [...result.rows].sort(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (const d of rows) {
        if (d.type === "precursor") {
            presursorCount++;

            d.text = `${presursorCount}`;
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        d.type = d.type?.toUpperCase();

        if (d.user === "0000000000000000" && d.type === "staff") continue;

        if (!allowed.includes(d.type as AwardNameType)) {
            continue;
        }

        const result = q(
            `INSERT INTO awards (
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
