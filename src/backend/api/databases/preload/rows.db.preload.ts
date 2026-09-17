import { db } from "../db.js";
import { log } from "../../instances.js";
import { TemplateRowItemType } from "../../../../_common/types/template/row.type.js";

// @openprofile
const createdBy = "9534968913312158";

const index: Partial<TemplateRowItemType>[] = [
    {
        rowId: "SNOWFLAKE HERE",
        blockId: "93861942229209088",
        position: 0,
        createdBy,
    }
];

db.templates.transaction(q => {
    for (const d of index) {
        const result = q(
            `INSERT INTO rows (
                rowId,
                blockId,
                position,
                createdBy
            ) VALUES (?, ?, ?, ?)`,
            [
                d.rowId,
                d.blockId,
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
