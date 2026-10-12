import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { FieldItemType } from "../../../_common/types/blocks/field.type.js";
import { db } from "../databases/db.js";

export function updateDatasetUses(
    assetId: string,
    fieldId: string,
    dataset: string | null
) {
    const columnsResult = db.templates.query<{ name: string }>(
        `PRAGMA table_info(draft_fields)`
    );

    assertDbSuccess(columnsResult);

    const columns = new Set(
        columnsResult.rows.map((row) => row.name)
    );

    const assetColumns = ["templateId", "blockId", "assetId"]
        .filter((column) => columns.has(column));

    if (assetColumns.length === 0) {
        throw new Error(
            "draft_fields does not contain templateId, blockId, or assetId"
        );
    }

    const conditions = assetColumns
        .map((column) => `${column} = ?`)
        .join(" OR ");

    const getResult = db.templates.query<FieldItemType>(
        `SELECT options
         FROM draft_fields
         WHERE fieldId = ?
         AND (${conditions})
         LIMIT 1`,
        [fieldId, ...assetColumns.map(() => assetId)]
    );

    assertDbSuccess(getResult);

    const options = getResult.rows[0]?.options
        ? JSON.parse(getResult.rows[0].options as string)
        : null;

    const previousDataset: string | null = options?.dataset ?? null;

    if (previousDataset === dataset) {
        return;
    }

    db.templates.transaction((q) => {
        if (previousDataset) {
            const publishedResult = q(
                `UPDATE published_datasets
                 SET uses = MAX(uses - 1, 0)
                 WHERE id = ?`,
                [previousDataset]
            );

            assertDbSuccess(publishedResult);

            const draftResult = q(
                `UPDATE draft_datasets
                 SET uses = MAX(uses - 1, 0)
                 WHERE id = ?`,
                [previousDataset]
            );

            assertDbSuccess(draftResult);
        }

        if (dataset) {
            const publishedResult = q(
                `UPDATE published_datasets
                 SET uses = uses + 1
                 WHERE id = ?`,
                [dataset]
            );

            assertDbSuccess(publishedResult);

            const draftResult = q(
                `UPDATE draft_datasets
                 SET uses = uses + 1
                 WHERE id = ?`,
                [dataset]
            );

            assertDbSuccess(draftResult);
        }
    });
}

export function updateBlockUses(
    blockId: string,
    action: "add" | "remove"
) {
    db.blocks.transaction((q) => {
        if (action === "remove") {
            const publishedResult = q(
                `UPDATE published
                 SET uses = MAX(uses - 1, 0)
                 WHERE blockId = ?`,
                [blockId]
            );

            assertDbSuccess(publishedResult);

            const draftResult = q(
                `UPDATE drafts
                 SET uses = MAX(uses - 1, 0)
                 WHERE blockId = ?`,
                [blockId]
            );

            assertDbSuccess(draftResult);
        }

        if (action === "add") {
            const publishedResult = q(
                `UPDATE published
                 SET uses = uses + 1
                 WHERE blockId = ?`,
                [blockId]
            );

            assertDbSuccess(publishedResult);

            const draftResult = q(
                `UPDATE drafts
                 SET uses = uses + 1
                 WHERE blockId = ?`,
                [blockId]
            );

            assertDbSuccess(draftResult);
        }
    });
}
