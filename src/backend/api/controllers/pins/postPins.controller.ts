import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";
import { db } from "../../databases/db.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertNotNull } from "../../../../_common/asserts/notNull.assert.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { i18n } from "../../../_common/instances.js";

export const postPins = async (req: Request, res: Response) => {
    try {
        const { ownerId, assetId } = req.params;
        const { position } = req.body;

        await assertBearer(req); 
        assertAccount(req.session);
        assertNotNull([ownerId, assetId, position]);
        assertPlatformPermissions(req.session, "WRITE");


        const getResult = db.pins.query(
            `SELECT 1 FROM pins WHERE ownerId = ?`,
            [req.session.userId]
        );

        assertDbSuccess(getResult);

        if (getResult.rowCount >= 24) {
            throw new AdvancedError({
                code: 400,
                message: i18n.t("responses.pinLimit")
            })
        }

        const postResult = db.pins.query(
            `
                INSERT INTO pins (ownerId, assetId, position)
                VALUES (?, ?, ?)
                ON CONFLICT(ownerId, assetId)
                DO UPDATE SET
                    position = excluded.position
            `,
            [req.session.userId, assetId, position]
        );

        assertDbSuccess(postResult);

        res.status(200).json({
            ok: true
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
