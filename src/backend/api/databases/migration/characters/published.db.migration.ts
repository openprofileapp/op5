import { DateTime } from "luxon";

import { db, mdb } from "../../db.js";
import { log } from "../../../instances.js";

const result = mdb.profiles.query("SELECT * from published");

db.characters.transaction(q => {
    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        const result = q(
            `INSERT INTO published (
                algorithmScore,
                id, 
                ownerId, 
                slug,
                displayName,
                avatar,
                banner,
                about,
                tags,
                isAuraEnabled,
                auraType,
                auraPrimary,
                auraSecondary,
                isExplicit,
                visibility,
                isScheduled,
                updatedDate,
                createdDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                d.score,
                d.id,
                d.owner,
                d.url,
                d.display_name,
                d.avatar,
                d.banner,
                d.about,
                JSON.stringify((d.tags as string ?? '').split(',').map(tag => tag.trim()).filter(Boolean)),
                d.aura || 0,
                "flow",
                d.aura_primary,
                d.aura_secondary,
                d.explicit || 0,
                d.visibility || "public",
                0,
                DateTime.fromSQL(d.updated_date as string, { zone: "utc" }).toISO(),
                DateTime.fromSQL(d.created_date as string, { zone: "utc" }).toISO()
            ]
        );

        if (!result.success) return log.db.error(result.error).save();
    }
});