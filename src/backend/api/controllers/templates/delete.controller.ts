import type { Request, Response } from "express";
import { AdvancedError } from "kage-library";

import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { db } from "../../databases/db.js";
import { i18n } from "../../../_common/instances.js";
import { log } from "../../instances.js";
import { TemplateType } from "../../../../_common/types/template/template.type.js";

export const deleteTemplete = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await assertBearer(req);
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "CREATE_ASSETS");

        const getResult = db.templates.query<TemplateType>(
            "SELECT * FROM drafts WHERE id = ? LIMIT 1",
            [id]
        );

        assertDbSuccess(getResult);

        if (getResult.rowCount < 1) {
            throw new AdvancedError({
                code: 404,
                message: i18n.t("responses.templateNotFound")
            });
        }

        if (getResult.rows[0].ownerId !== req.session.userId) {
            throw new AdvancedError({
                code: 401,
                message: i18n.t("responses.unauthorized")
            });
        }

        db.templates.transaction(q => {
            const updateDatasetsResult = q(
                `
                UPDATE draft_datasets
                SET uses = MAX(
                    uses - (
                        SELECT COUNT(*)
                        FROM draft_fields f
                        WHERE f.rowId IN (
                            SELECT r.rowId
                            FROM draft_rows r
                            WHERE r.blockId IN (
                                SELECT b.blockId
                                FROM draft_blocks b
                                WHERE b.templateId = ?
                            )
                        )
                        AND json_extract(f.options, '$.dataset') = draft_datasets.id
                    ),
                    0
                )
                WHERE id IN (
                    SELECT json_extract(f.options, '$.dataset')
                    FROM draft_fields f
                    WHERE f.rowId IN (
                        SELECT r.rowId
                        FROM draft_rows r
                        WHERE r.blockId IN (
                            SELECT b.blockId
                            FROM draft_blocks b
                            WHERE b.templateId = ?
                        )
                    )
                    AND json_extract(f.options, '$.dataset') IS NOT NULL
                )
                `,
                [id, id]
            );

            assertDbSuccess(updateDatasetsResult);


            const deleteFieldsResult = q(
                `
                DELETE FROM draft_fields
                WHERE rowId IN (
                    SELECT rowId
                    FROM draft_rows
                    WHERE blockId IN (
                        SELECT blockId
                        FROM draft_blocks
                        WHERE templateId = ?
                    )
                )
                `,
                [id]
            );

            assertDbSuccess(deleteFieldsResult);

            const deleteRowsResult = q(
                `
                DELETE FROM draft_rows
                WHERE blockId IN (
                    SELECT blockId
                    FROM draft_blocks
                    WHERE templateId = ?
                )
                `,
                [id]
            );

            assertDbSuccess(deleteRowsResult);

            const deleteBlocksResult = q(
                `
                DELETE FROM draft_blocks
                WHERE templateId = ?
                `,
                [id]
            );

            assertDbSuccess(deleteBlocksResult);

            const deleteCategoriesResult = q(
                `
                DELETE FROM draft_categories
                WHERE templateId = ?
                `,
                [id]
            );

            assertDbSuccess(deleteCategoriesResult);

            const deleteTemplateResult = q(
                `
                DELETE FROM drafts
                WHERE id = ?
                `,
                [id]
            );

            assertDbSuccess(deleteTemplateResult);

            const deleteValueResult = q(
                `
                DELETE FROM draft_values
                WHERE templateId = ?
                `,
                [id]
            );

            assertDbSuccess(deleteValueResult);

            const deleteHistoryResult = q(
                `
                DELETE FROM history
                WHERE templateId = ?
                `,
                [id]
            );

            assertDbSuccess(deleteHistoryResult);
        });

        return res.status(200).json({
            ok: true
        });
    } catch (error) {
        if (error instanceof AdvancedError) {
            log.db.error(error).save();
            return res.status(error.code).json({
                id: error.id,
                message: error.message
            });
        } else {
            log.unknown.error(error).save();
            return res.status(500).json({
                message: i18n.t("responses.unknown")
            });
        }
    }
};
