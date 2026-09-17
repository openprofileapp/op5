import type { Request, Response } from 'express';

import { assertBearer } from '../../../_common/asserts/bearer.assert.js';
import { db } from '../../databases/db.js';
import { assertDbSuccess } from '../../../../_common/asserts/dbSuccess.assert.js';
import { AdvancedError } from 'kage-library';
import { log } from '../../instances.js';
import { i18n } from '../../../_common/instances.js';
import { RowItemType } from '../../../../_common/types/template/row.type.js';
import { assertAccount } from '../../../_common/asserts/account.assert.js';

export const templateRowController = async (req: Request, res: Response) => {
    try {
        const { blockId } = req.params;

        await assertBearer(req);
        assertAccount(req.session);

        const result = db.templates.query<RowItemType>(
            `SELECT * FROM rows WHERE blockId = ? ORDER BY position ASC`,
            [blockId]
        );

        assertDbSuccess(result);

        return res.status(200).json({
            items: result.rows,
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
