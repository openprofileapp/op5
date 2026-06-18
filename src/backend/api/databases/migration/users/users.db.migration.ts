import { DateTime } from "luxon";

import { db, mdb } from "../../db.js";
import { log } from "../../../instances.js";

const result = mdb.accounts.query("SELECT * from public");

db.users.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        const result = q(
            `INSERT INTO users (
                id,
                username,
                usernameOld,
                usernameOldExpire,
                displayName,
                fanflair,
                avatar,
                banner,
                status,
                about,
                tags,
                birthdate,
                birthdateVisibility,
                foundedDate,
                foundedDateVisibility,
                theme,
                isAuraEnabled,
                auraType,
                auraPrimary,
                auraSecondary,
                type,
                isExplicit,
                visibility,
                sendMessages,
                lastActive,
                presenceVisibility,
                createdDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                d.id,
                d.username,
                d.username_old ,
                d.username_old_expire ,
                d.display_name,
                d.fanflair,
                d.avatar,
                d.banner,
                d.status,
                d.about,
                d.tags,
                d.birthdate,
                d.birthdate_visibility,
                d.founded,
                d.founded_visibility,
                d.theme,
                d.aura || 0,
                "flow",
                d.aura_primary,
                d.aura_secondary,
                d.type,
                d.explicit || 0,
                d.visibility || "public",
                d.messages,
                d.last_active,
                d.last_active_visibility,
                DateTime.fromSQL(d.created_date as string, { zone: "utc" }).toISO()
            ]
        );

        if (!result.success) return log.db.error(result.error).save();
    }
})