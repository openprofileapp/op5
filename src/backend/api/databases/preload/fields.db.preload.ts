import { db } from "../db.js";
import { log } from "../../instances.js";
import { TemplateFieldItemType } from "../../../../_common/types/template/field.type.js";

// @openprofile
const createdBy = "9534968913312158";

const index: Partial<TemplateFieldItemType>[] = [
    {
        blockId: "93861942229209088",
        fieldId: "first-name",
        rowId: "93861942229209089",
        type: "text",
        label: "First Name",
        placeholder: "What is {DISPLAY_NAME_POSSESSIVE} first name?",
        guide: "First names are generally given by parents or legal guardians. It could reflect something from their personalities or how they view {DISPLAY_NAME}.\n\nIt is recommended choosing a name that fits {DISPLAY_NAME_POSSESSIVE} ethnic background, social class, and birth era.\n\n[Learn more](https://support.openprofile.app/en-us/article/choosing-a-name)",
        position: 0,
        createdBy,
    }
];

db.templates.transaction(q => {
    for (const d of index) {
        const result = q(
            `INSERT INTO fields (
                blockId,
                fieldId,
                rowId,
                type,
                label,
                placeholder,
                guide,
                position,
                createdBy
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                d.blockId,
                d.fieldId,
                d.rowId,
                d.type,
                d.label,
                d.placeholder,
                d.guide,
                d.position,
                d.createdBy
            ]
        );

        if (!result.success) {
            log.db.error(result.error).save();
            continue;
        }
    }
});
