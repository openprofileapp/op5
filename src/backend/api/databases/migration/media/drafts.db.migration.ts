import { DateTime } from "luxon";

import { db, mdb } from "../../db.js";
import { log } from "../../../instances.js";
import uploadFile from "../../../../_common/helpers/uploadFile.js";
import { config } from "../../../../../../app.config.js";

const result = mdb.profiles.query("SELECT * from media_draft");

db.media.transaction(async q => {
    if (!result.success) return log.db.error(result.error).save();

    for (const d of result.rows) {
        if (d.url) {
            try {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const hash = d.url
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    .replace(`/uploads/profiles/${d.profile}/`, "")
                    .replace(".png", "")
                    .replace(".jpg", "")
                    .replace(".jpeg", "")

                const uploadedMedia = await uploadFile({
                    folder: `media/${d.profile}`,
                    name: hash,
                    fileInput: `https://${config.domains.cdn}${d.url}`
                });

                d.url = uploadedMedia?.path;
            } catch {
                // continue
            }
        }

        const result = q(
            `INSERT INTO drafts (
                assetId,
                url, 
                description, 
                credit, 
                position,
                visibility,
                addedBy,
                addedDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                d.profile,
                d.url,
                d.description,
                d.credit,
                d.position,
                d.visibility,
                d.added_by,
                DateTime.fromSQL(d.date as string, { zone: "utc" }).toISO()
            ]
        );

        if (!result.success) return log.db.error(result.error).save();
    }
});
