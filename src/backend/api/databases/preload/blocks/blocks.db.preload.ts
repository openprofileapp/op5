import { db } from "../../db.js";
import { log } from "../../../instances.js";
import { BlockItemType } from "../../../../../_common/types/blocks/block.type.js";

// @openprofile
const ownerId = "9534968913312158";

const index: Partial<BlockItemType>[] = [
    {
        blockId: "93861942229209088",
        ownerId,
        categoryType: "identity",
        icon: "/graphics/openmoji/1F9D1.svg",
        label: "General",
        description: "Legal name, living status, citizenship, and identifiers.",
        tags: JSON.stringify([]),
        source: "official",
    }
];

db.blocks.transaction(q => {
    for (const d of index) {
        const result = q(
            `INSERT INTO blocks (
                blockId,
                ownerId,
                categoryType,
                icon,
                label,
                description,
                tags,
                source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                d.blockId,
                d.ownerId,
                d.categoryType,
                d.icon,
                d.label,
                d.description,
                d.tags,
                d.source
            ]
        );

        if (!result.success) {
            log.db.error(result.error).save();
            continue;
        }
    }
});
