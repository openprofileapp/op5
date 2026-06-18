import { DateTime } from "luxon";

import { Snowflake } from "kage-library";

import { db, mdb } from "../../db.js";
import { log } from "../../../instances.js";
import { config } from "../../../../../../app.config.js";

const snowflake = new Snowflake(config.generation.epoch, 1);

const result = mdb.interactions.query("SELECT * from follows");

db.audits.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        
        const result = q(
            `INSERT INTO follows (
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
                "FOLLOW",
                DateTime.fromSQL(d.date as string, { zone: "utc" }).toISO()
            ]
        );

        if (!result.success) return log.db.error(result.error).save();
    }
});