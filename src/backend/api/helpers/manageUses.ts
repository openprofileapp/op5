import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { FieldItemType } from "../../../_common/types/blocks/field.type.js";
import { db } from "../databases/db.js";

export function updateDatasetUses(
    assetId: string,
    fieldId: string,
    dataset: string | null
) {
   const getResult = db.templates.query<FieldItemType>(
        `SELECT options
        FROM draft_fields
        WHERE fieldId = ?
        AND (
            templateId = ?
            OR blockId = ?
            OR assetId = ?
        )`,
        [fieldId, assetId, assetId, assetId]
    );

    assertDbSuccess(getResult);

    const options = getResult.rows[0]?.options
        ? JSON.parse(getResult.rows[0].options as string)
        : null;

    const previousDataset = options?.dataset ?? null;

    if (previousDataset === dataset) {
        return;
    }

    db.templates.transaction((q) => {
        if (previousDataset) {
            q(
                `UPDATE published_datasets
                 SET uses = MAX(uses - 1, 0)
                 WHERE id = ?`,
                [previousDataset]
            );

            const result = q(
                `UPDATE draft_datasets
                 SET uses = MAX(uses - 1, 0)
                 WHERE id = ?`,
                [previousDataset]
            );

            assertDbSuccess(result);
        }

        if (dataset) {
            q(
                `UPDATE published_datasets
                 SET uses = uses + 1
                 WHERE id = ?`,
                [dataset]
            );

            const result = q(
                `UPDATE draft_datasets
                 SET uses = uses + 1
                 WHERE id = ?`,
                [dataset]
            );

            assertDbSuccess(result);
        }
    });
}

export function updateBlockUses(
    blockId: string,
    action: "add" | "remove"
) {
    db.blocks.transaction((q) => {
        if (action === "remove") {
            q(
                `UPDATE published
                 SET uses = MAX(uses - 1, 0)
                 WHERE blockId = ?`,
                [blockId]
            );

            const result = q(
                `UPDATE drafts
                 SET uses = MAX(uses - 1, 0)
                 WHERE blockId = ?`,
                [blockId]
            );

            assertDbSuccess(result);
        }

        if (action === "add") {
            q(
                `UPDATE published
                 SET uses = uses + 1
                 WHERE blockId = ?`,
                [blockId]
            );

            const result = q(
                `UPDATE drafts
                 SET uses = uses + 1
                 WHERE blockId = ?`,
                [blockId]
            );

            assertDbSuccess(result);
        }
    });
}
