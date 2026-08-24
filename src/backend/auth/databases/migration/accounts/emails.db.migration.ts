import { DateTime } from "luxon";
import { log } from "../../../instances.js";
import { db, mdb } from "../../db.js";

const emailResult = mdb.accounts.query("SELECT * from emails");
const privateResult = mdb.accounts.query("SELECT * from private");

db.accounts.transaction(q => {
    if (!emailResult.success) return log.db.error(emailResult.error).save();
    if (!privateResult.success) return log.db.error(privateResult.error).save();

    const privateMap = new Map(
        privateResult.rows.map(p => [p.id, p.created_date])
    );

    for (const d of emailResult.rows) {
        const addedDate = privateMap.get(d.user);

        const emailResult = q(
            `INSERT INTO emails (
                userId,
                email,
                isPrimary,
                isVerified,
                isMfa,
                isSubscribedToNewsletters,
                isSubscribedToAccountNotifications,
                isSubscribedToPromotionalMaterial,
                addedDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                d.user,
                d.email,
                1,
                d.confirmed,
                d.mfa_enabled,
                d.newsletter_updates,
                d.newsletter_notifications,
                d.newsletter_promotional,
                DateTime.fromSQL(addedDate as string, { zone: "utc" }).toISO()
            ]
        );

        if (!emailResult.success) return log.db.error(emailResult.error).save();
    }
});
