import { db } from "../db.js";
import { log } from "../../instances.js";
import { TemplateBlockItemType } from "../../../../_common/types/template/block.type.js";

// @openprofile
const ownerId = "9534968913312158";

const index: Partial<TemplateBlockItemType>[] = [
    {
        blockId: "93861942229209088",
        ownerId,
        categoryType: "identity",
        icon: "/graphics/openmoji/1F9D1.svg",
        label: "Legal",
        description: "Legal name, living status, citizenship, and identifiers.",
        tags: JSON.stringify([]),
        source: "official",
    }
];

db.templates.transaction(q => {
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
