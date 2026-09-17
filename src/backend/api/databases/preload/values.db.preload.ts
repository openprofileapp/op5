import { db } from "../db.js";
import { log } from "../../instances.js";
import { TemplateValueType } from "../../../../_common/types/template/value.type.js";

// @openprofile
// const author = "9534968913312158";

const index: Partial<TemplateValueType>[] = [
    /*{
        blockId: "93861942229209088",
        fieldId: "first-name",
        author,
        content: "Alice"
    }*/
];

db.templates.transaction(q => {
    for (const d of index) {
        const result = q(
            `INSERT INTO "values" (
                blockId,
                fieldId,
                author,
                content
            ) VALUES (?, ?, ?, ?)`,
            [
                d.blockId,
                d.fieldId,
                d.author,
                d.content
            ]
        );

        if (!result.success) {
            log.db.error(result.error).save();
            continue;
        }
    }
});
