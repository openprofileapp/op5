import { log } from "../../../instances.js";
import { db, mdb } from "../../db.js";

const result = mdb.accounts.query("SELECT * from emails");

db.accounts.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        const result = q(
            `INSERT INTO emails (
                userId,
                email,
                isVerified,
                isMfa,
                isSubscribedToNewsletters,
                isSubscribedToAccountNotifications,
                isSubscribedToPromotionalMaterial
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                d.user,
                d.email,
                d.confirmed,
                d.mfa_enabled,
                d.newsletter_updates,
                d.newsletter_notifications,
                d.newsletter_promotional
            ]
        );

        if (!result.success) return log.db.error(result.error).save();
    }
});