import { db, mdb } from "../../db.js";
import { log } from "../../../instances.js";

const result = mdb.accounts.query("SELECT * from interests");

db.users.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        const result = q(
            `INSERT INTO interests (
                userId,
                tag,
                algorithmScore
            ) VALUES (?, ?, ?)`,
            [
                d.user,
                d.topic,
                d.score
            ]
        );

        if (!result.success) return log.db.error(result.error).save();
    }
})
