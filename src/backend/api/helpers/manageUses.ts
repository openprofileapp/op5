import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { FieldItemType } from "../../../_common/types/blocks/field.type.js";
import { db } from "../databases/db.js";

export function updateDatasetUses(
    fieldId: string,
    dataset: string | null
) {
    const getResult = db.templates.query<FieldItemType>(
        "SELECT options FROM draft_fields WHERE fieldId = ?",
        [fieldId]
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
            const result = q(
                `UPDATE draft_datasets
                 SET uses = MAX(uses - 1, 0)
                 WHERE id = ?`,
                [previousDataset]
            );

            assertDbSuccess(result);
        }

        if (dataset) {
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
