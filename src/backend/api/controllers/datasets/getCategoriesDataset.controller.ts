import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";
import { db } from "../../databases/db.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { i18n } from "../../../_common/instances.js";
import { log } from "../../instances.js";

export const getCategoriesDataset = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await assertBearer(req);
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "WRITE");

        const result = db.templates.query(`
            WITH dataset AS (
                SELECT d.data
                FROM draft_datasets d
                WHERE d.id = ?
                    AND d.ownerId = ?

                UNION ALL

                SELECT p.data
                FROM published_datasets p
                WHERE p.id = ?
                    AND NOT EXISTS (
                        SELECT 1
                        FROM draft_datasets d
                        WHERE d.id = ?
                            AND d.ownerId = ?
                    )
            ),
            categories AS (
                SELECT json_extract(j.value, '$.category') AS category
                FROM dataset
                JOIN json_tree(dataset.data) AS j
                WHERE j.type = 'object'
                    AND json_extract(j.value, '$.category') IS NOT NULL

                UNION ALL

                SELECT json_each.key AS category
                FROM dataset
                JOIN json_each(dataset.data)
                WHERE json_each.type = 'array'
            )
            SELECT DISTINCT category
            FROM categories
            WHERE category IS NOT NULL
            ORDER BY category
            `,
            [
                id,
                req.session.userId,
                id,
                id,
                req.session.userId
            ]
        );

        assertDbSuccess(result);

        return res.status(200).json({
            ok: true,
            array: result.rows.map(row => row.category)
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
            message: i18n.t("responses.unknown"),
        });
    }
};
