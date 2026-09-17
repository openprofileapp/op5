import type { Request, Response } from 'express';

import { assertBearer } from '../../../_common/asserts/bearer.assert.js';
import { db } from '../../databases/db.js';
import { assertDbSuccess } from '../../../../_common/asserts/dbSuccess.assert.js';
import { AdvancedError } from 'kage-library';
import { log } from '../../instances.js';
import { i18n } from '../../../_common/instances.js';
import { GetRowItemType } from '../../../../_common/types/template/row.type.js';
import { assertAccount } from '../../../_common/asserts/account.assert.js';

export const templateDataController = async (req: Request, res: Response) => {
    try {
        const { blockId } = req.params;

        await assertBearer(req);
        assertAccount(req.session);

        const result = db.templates.query<GetRowItemType>(
            `SELECT 
                r.*,
                CASE 
                    WHEN COUNT(f.fieldId) = 0 THEN '[]'
                    ELSE json_group_array(
                        json_object(
                            'blockId', f.blockId,
                            'fieldId', f.fieldId,
                            'rowId', f.rowId,
                            'type', f.type,
                            'label', f.label,
                            'placeholder', f.placeholder,
                            'options', f.options,
                            'guide', f.guide,
                            'position', f.position,
                            'addedCount', f.addedCount,
                            'createdBy', f.createdBy,
                            'createdDate', f.createdDate,
                            'value', CASE 
                                WHEN v.fieldId IS NULL THEN NULL 
                                ELSE json_object(
                                    'author', v.author,
                                    'content', v.content,
                                    'date', v.date
                                ) 
                            END
                        )
                    )
                END AS fields
            FROM rows r
            LEFT JOIN fields f ON r.rowId = f.rowId AND f.blockId = ?
            LEFT JOIN "values" v ON f.fieldId = v.fieldId AND f.blockId = v.blockId
            WHERE r.blockId = ?
            GROUP BY r.rowId
            ORDER BY r.position ASC`,
            [blockId, blockId]
        );

        assertDbSuccess(result);

        const items = result.rows.map((row) => ({
            ...row,
            fields: typeof row.fields === 'string' ? JSON.parse(row.fields) : row.fields,
        }));

        return res.status(200).json({
            items,
            count: result.rowCount
        });
    } catch(error) {
        if (error instanceof AdvancedError) {
            log.db.error(error).save();
            return res.status(error.code).json({
                id: error.id,
                message: error.message
            });
        } else {
            log.unknown.error(error).save();
            return res.status(500).json({
                message: i18n.t("responses.unknown"),
            });
        }
    }
};
