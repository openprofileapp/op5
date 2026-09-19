import { db } from "../db.js";
import { log } from "../../instances.js";
import { TemplateRowItemType } from "../../../../_common/types/template/row.type.js";

// @openprofile
const createdBy = "9534968913312158";

const index: Partial<TemplateRowItemType>[] = [
    {
        rowId: "93861942229209089",
        blockId: "93861942229209088",
        position: 0,
        createdBy,
    },
    {
        rowId: "93861942229209090",
        blockId: "93861942229209088",
        position: 1,
        createdBy,
    },
    {
        rowId: "93861942229209091",
        blockId: "93861942229209088",
        position: 2,
        createdBy,
    },
    {
        rowId: "93861942229209092",
        blockId: "93861942229209088",
        position: 3,
        createdBy,
    },
    {
        rowId: "93861942229209093",
        blockId: "93861942229209088",
        position: 4,
        createdBy,
    },
    {
        rowId: "93861942229209094",
        blockId: "93861942229209088",
        position: 5,
        createdBy,
    },
    {
        rowId: "93861942229209095",
        blockId: "93861942229209088",
        position: 6,
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
