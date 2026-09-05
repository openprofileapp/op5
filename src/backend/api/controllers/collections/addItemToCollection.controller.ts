import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertNotNull } from "../../../../_common/asserts/notNull.assert.js";
import { log } from "../../instances.js";
import { i18n } from "../../../_common/instances.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";
import { db } from "../../databases/db.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import whatIs from "../../helpers/whatIs.js";
import sendNotificationService from "../../services/sendNotification.service.js";

export const addItemToCollectionController = async (req: Request, res: Response) => {
    try {
        const { collectionId, assetId } = req.params;

        await assertBearer(req);
        assertAccount(req.session);
        assertNotNull([collectionId, assetId]);
        assertPlatformPermissions(req.session, "WRITE");

        const result = db.collections.query(
            "SELECT * FROM collections WHERE id = ? AND ownerId = ?",
            [collectionId, req.session.userId]
        );

        assertDbSuccess(result);

        if (result.rowCount === 0) {
            res.status(400).json({
                ok: false
            });
        }

        let newItem = false

        db.collections.transaction(q => {
            const result = q(
                "DELETE FROM items WHERE collectionId = ? AND assetId = ?",
                [collectionId, assetId]
            );

            assertDbSuccess(result);

            if (result && result.changes === 0) {
                newItem = true;

                const result = q(
                    "INSERT INTO items (collectionId, assetId, addedBy) VALUES (?, ?, ?)",
                    [collectionId, assetId, req.session.userId]
                );

                assertDbSuccess(result);
            }
        });

        if (newItem) {
            const whatIsData = whatIs(assetId as string);
            
            if (
                whatIsData &&
                (
                    req.session.userId !== whatIsData.ownerId && 
                    req.session.userId !== whatIsData.id
                )
            ) {
                await sendNotificationService(
                    whatIsData.ownerId || whatIsData.id,
                    "ADD_TO_COLLECTION",
                    { 
                        sourceId: req.session.userId, 
                        targetId: assetId as string,
                        collectionId: collectionId as string
                    }
                );
            }
        }

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
