import type { Request, Response } from "express";
import { AdvancedError } from "kage-library";

import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { db } from "../../databases/db.js";
import { i18n } from "../../../_common/instances.js";
import { log } from "../../instances.js";

export const deleteBlocks = async (req: Request, res: Response) => {
    try {
        const { id: blockId } = req.params;

        await assertBearer(req);
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "CREATE_ASSETS");

        const getResult = db.blocks.query(
            "SELECT * FROM drafts WHERE blockId = ? LIMIT 1",
            [blockId]
        );

        assertDbSuccess(getResult);

        const block = getResult.rows[0];

        if (!block) {
            throw new AdvancedError({
                code: 404,
                message: i18n.t("responses.templateNotFound")
            });
        }

        if (block.ownerId !== req.session.userId) {
            throw new AdvancedError({
                code: 401,
                message: i18n.t("responses.unauthorized")
            });
        }

        db.blocks.transaction(q => {
            const deleteFieldsResult = q(
                `
                DELETE FROM draft_fields
                WHERE rowId IN (
                    SELECT rowId
                    FROM draft_rows
                    WHERE blockId = ?
                )
                `,
                [blockId]
            );

            assertDbSuccess(deleteFieldsResult);

            const deleteRowsResult = q(
                `
                DELETE FROM draft_rows
                WHERE blockId = ?
                `,
                [blockId]
            );

            assertDbSuccess(deleteRowsResult);

            const deleteValuesResult = q(
                `
                DELETE FROM draft_values
                WHERE blockId = ?
                `,
                [blockId]
            );

            assertDbSuccess(deleteValuesResult);

            const deleteDraftResult = q(
                `
                DELETE FROM drafts
                WHERE blockId = ?
                `,
                [blockId]
            );

            assertDbSuccess(deleteDraftResult);
        });

        const updateDatasetsResult = db.templates.query(
            `
            UPDATE draft_datasets
            SET uses = MAX(
                uses - (
                    SELECT COUNT(*)
                    FROM draft_fields f
                    INNER JOIN draft_rows r
                        ON r.rowId = f.rowId
                    WHERE r.blockId = ?
                    AND json_extract(f.options, '$.dataset') = draft_datasets.id
                ),
                0
            )
            WHERE id IN (
                SELECT json_extract(f.options, '$.dataset')
                FROM draft_fields f
                INNER JOIN draft_rows r
                    ON r.rowId = f.rowId
                WHERE r.blockId = ?
                AND json_extract(f.options, '$.dataset') IS NOT NULL
            )
            `,
            [blockId, blockId]
        );
        
        assertDbSuccess(updateDatasetsResult);

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
        }

        log.unknown.error(error).save();

        return res.status(500).json({
            message: i18n.t("responses.unknown")
        });
    }
};
