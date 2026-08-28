import type { Request, Response } from 'express';

import { assertBearer } from '../../../_common/asserts/bearer.assert.js';
import { assertNotNull } from '../../../../_common/asserts/notNull.assert.js';
import { assertPlatformPermissions } from '../../../_common/asserts/platformPermissions.assert.js';
import { db } from '../../databases/db.js';
import { PinType } from '../../../../_common/types/pin.type.js';
import { assertDbSuccess } from '../../../../_common/asserts/dbSuccess.assert.js';
import getPublishedCharactersService from '../../services/getPublishedCharacters.service.js';
import { AdvancedError } from 'kage-library';
import { log } from '../../instances.js';
import { i18n } from '../../../_common/instances.js';

export const getPins = async (req: Request, res: Response) => {
    try {
        const { ownerId } = req.params;

        await assertBearer(req); 
        assertNotNull(ownerId);
        assertPlatformPermissions(req.session, "READ");

        const result = db.pins.query<PinType>(
            `SELECT * FROM pins WHERE ownerId = ?`,
            [ownerId]
        );

        assertDbSuccess(result);

        const characterPromises = result.rows.map(row => 
            getPublishedCharactersService({ id: row.assetId })
        );

        const characterResults = await Promise.all(characterPromises);

        const items = characterResults.flatMap(res => res.items);

        return res.status(200).json({
            items,
            count: items.length
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
