import { db, mdb } from "../../db.js";
import { log } from "../../../instances.js";

const result = mdb.interactions.query("SELECT * from follows");

db.notifications.transaction(async q => {
    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        const result = q(
            `INSERT INTO subscriptions (
                source,
                target, 
                isSubscribedToContent,
                isSubscribedToCollaborationChanges,
                isSubscribedToNewComments,
                isSubscribedToNewInteractions
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                d.user,
                d.interaction,
                1,
                0,
                0,
                0
            ]
        );

        if (!result.success) {
            log.db.error(result.error).save();

            continue;
        }
    }
});
