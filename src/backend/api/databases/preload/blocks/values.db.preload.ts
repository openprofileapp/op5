import { db } from "../../db.js";
import { log } from "../../../instances.js";
import { ValueType } from "framer-motion";

// @openprofile
// const author = "9534968913312158";

const index: Partial<ValueType>[] = [
    /*{
        blockId: "93861942229209088",
        fieldId: "first-name",
        author,
        content: "Alice"
    }*/
];

db.blocks.transaction(q => {
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
