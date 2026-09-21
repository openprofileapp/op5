import { db } from "../../db.js";
import { log } from "../../../instances.js";
import { TemplateType } from "../../../../../_common/types/template/template.type.js";

// @openprofile
const ownerId = "9534968913312158";

const index: Partial<TemplateType>[] = [
    {
        id: "94967574239907840",
        ownerId,
        displayName: "Default",
        about: "A template closely based on OpenProfile 4.",
        source: "official"
    }
];

db.templates.transaction(q => {
    for (const d of index) {
        const result = q(
            `INSERT INTO templates (
                id,
                ownerId,
                displayName,
                about,
                source
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                d.id,
                d.ownerId,
                d.displayName,
                d.about,
                d.source
            ]
        );

        if (!result.success) {
            log.db.error(result.error).save();
            continue;
        }
    }
});
