import type { Request, Response } from "express";
import { AdvancedError } from "kage-library";

import { log } from "../../../../instances.js";
import { assertBearer } from "../../../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../../../../_common/asserts/platformPermissions.assert.js";
import { i18n } from "../../../../../_common/instances.js";
import { db } from "../../../../databases/db.js";
import { assertDbSuccess } from "../../../../../../_common/asserts/dbSuccess.assert.js";
import { updateBlockUses } from "../../../../helpers/manageUses.js";

export const deleteCategories = async (req: Request, res: Response) => {
    try {
        const { templateId, categoryId } = req.params;

        await assertBearer(req); 
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "WRITE");

        const getResult = db.templates.query(
            "SELECT * FROM drafts WHERE id = ?",
            [templateId]
        );

        assertDbSuccess(getResult);

        if (getResult.rowCount === 0) {
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

        if (!categoryId) {
            throw new AdvancedError({
                code: 400,
                message: i18n.t("responses.malformedRequest")
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
                                    AND b.categoryId = ?
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
                                AND b.categoryId = ?
                        )
                    )
                    AND json_extract(f.options, '$.dataset') IS NOT NULL
                )
                `,
                [
                    templateId,
                    categoryId,
                    templateId,
                    categoryId
                ]
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
                            AND categoryId = ?
                    )
                )
                `,
                [templateId, categoryId]
            );

            assertDbSuccess(deleteFieldsResult);

            const deleteRowsResult = q(
                `DELETE FROM draft_rows
                WHERE blockId IN (
                    SELECT blockId
                    FROM draft_blocks
                    WHERE templateId = ?
                    AND categoryId = ?
                )`,
                [templateId, categoryId]
            );

            assertDbSuccess(deleteRowsResult);

            const getBlockResult = q(
                `SELECT sourceBlockId
                FROM draft_blocks
                WHERE templateId = ?
                AND categoryId = ?`,
                [templateId, categoryId]
            );

            assertDbSuccess(getBlockResult);

            for (const block of getBlockResult.rows) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                updateBlockUses(block?.sourceBlockId as string, "remove");
            }

            const deleteBlocksResult = q(
                `DELETE FROM draft_blocks
                WHERE templateId = ?
                AND categoryId = ?`,
                [templateId, categoryId]
            );

            assertDbSuccess(deleteBlocksResult);

            const deleteCategoriesResult = q(
                `DELETE FROM draft_categories
                WHERE templateId = ?
                AND categoryId = ?`,
                [templateId, categoryId]
            );

            assertDbSuccess(deleteCategoriesResult);
        });

        return res.status(200).json({ ok: true });
    } catch (error) {
        if (error instanceof AdvancedError) {
            log.db.error(error).save();
            return res.status(error.code).json({ id: error.id, message: error.message });
        } else {
            log.unknown.error(error).save();
            return res.status(500).json({ message: i18n.t("responses.unknown") });
        }
    }
};
