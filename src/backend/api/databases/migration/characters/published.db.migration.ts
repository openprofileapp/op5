import { DateTime } from "luxon";

import { db, mdb } from "../../db.js";
import { log } from "../../../instances.js";
import uploadFile from "../../../../_common/helpers/uploadFile.js";
import { config } from "../../../../../../app.config.js";

const result = mdb.profiles.query("SELECT * from published");

db.characters.transaction(async q => {
    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        if (d.avatar) {
            try {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const hash = d.avatar
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    .replace(`/uploads/profiles/${d.id}/`, "")
                    .replace(".png", "")
                    .replace(".jpg", "")
                    .replace(".jpeg", "")

                const uploadedAvatar = await uploadFile({
                    folder: `characters/avatars/${d.id}`,
                    name: hash,
                    fileInput: `https://${config.domains.cdn}${d.avatar}`
                });

                d.avatar = uploadedAvatar?.path;
            } catch {
                // continue
            }
        }

        if (d.banner) {
            try {
                const hash = d.banner
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    .replace(`/uploads/profiles/${d.id}`, "")
                    .replace(".png", "")
                    .replace(".jpg", "")
                    .replace(".jpeg", "")

                const uploadedBanner = await uploadFile({
                    folder: `characters/banners/${d.id}`,
                    name: hash,
                    fileInput: `https://${config.domains.cdn}${d.banner}`
                });

                d.banner = uploadedBanner?.path;
            } catch {
                // continue
            }
        }

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
                readVisibility,
                isScheduled,
                updatedDate,
                createdDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                d.visibility || "public",
                0,
                DateTime.fromSQL(d.updated_date as string, { zone: "utc" }).toISO(),
                DateTime.fromSQL(d.created_date as string, { zone: "utc" }).toISO()
            ]
        );

        if (!result.success) return log.db.error(result.error).save();
    }
});
