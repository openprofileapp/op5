import { DateTime } from "luxon";

import { db, mdb } from "../../db.js";
import { log } from "../../../instances.js";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    const result = mdb.interactions.query("SELECT * from favorites");

    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        let collectionId;
        
        while (true) {
            const getResult = db.collections.query(
                "SELECT * FROM collections WHERE ownerId = ? AND isFavorites = 1",
                [d.user]
            );

            if (!getResult.success) return log.db.error(getResult.error).save();

            if (getResult.rowCount === 0) {
                await sleep(10); 
                continue;
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            collectionId = getResult.rows[0]?.id;

            if (collectionId) {
                break;
            }
        }

        const postResult = db.collections.query(
            `INSERT INTO items (
                collectionId,
                assetId,
                addedBy,
                date
            ) VALUES (?, ?, ?, ?)`,
            [
                collectionId,
                d.interaction,
                d.user,
                DateTime.fromSQL(d.date as string, { zone: "utc" }).toISO()
            ]
        );

        if (!postResult.success) return log.db.error(postResult.error).save();
    }
})();
