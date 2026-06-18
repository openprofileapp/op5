import { DateTime } from "luxon";

import { Snowflake } from "kage-library";

import { db, mdb } from "../../db.js";
import { log } from "../../../instances.js";
import { config } from "../../../../../../app.config.js";

const snowflake = new Snowflake(config.generation.epoch, 1);

const readsResult = mdb.interactions.query("SELECT * from reads");
const viewsResult = mdb.interactions.query("SELECT * from views");

db.audits.transaction(q => {
    if (!readsResult.success) return log.db.error(readsResult.error).save();

    for (const d of readsResult.rows) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (d.user && d.user.includes(".")) d.user = "unknown";
        
        const readsResult = q(
            `INSERT INTO views (
                id,
                source,
                target,
                action,
                date
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                snowflake.gen(),
                d.user,
                d.interaction,
                "READ",
                DateTime.fromSQL(d.date as string, { zone: "utc" }).toISO()
            ]
        );

        if (!readsResult.success) return log.db.error(readsResult.error).save();
    }
});

db.audits.transaction(q => {
    if (!viewsResult.success) return log.db.error(viewsResult.error).save();

    for (const d of viewsResult.rows) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (d.user && d.user.includes(".")) d.user = "unknown";
        
        const viewsResult = q(
            `INSERT INTO views (
                id,
                source,
                target,
                action,
                date
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                snowflake.gen(),
                d.user,
                d.interaction,
                "VIEW",
                DateTime.fromSQL(d.date as string, { zone: "utc" }).toISO()
            ]
        );

        if (!viewsResult.success) return log.db.error(viewsResult.error).save();
    }
});