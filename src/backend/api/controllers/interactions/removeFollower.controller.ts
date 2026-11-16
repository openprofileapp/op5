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

export const removeFollowerController = async (req: Request, res: Response) => {
    try {
        const { targetId } = req.params;

        await assertBearer(req);
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "USE_INTERACTIONS");
        assertNotNull(targetId);

        const interactionResult = db.interactions.query(
            `DELETE FROM follows WHERE source = ? AND target = ? LIMIT 1`,
            [targetId, req.session.userId]
        );

        assertDbSuccess(interactionResult);

        const notificationResult = db.notifications.query(
                `DELETE FROM inbox
                WHERE userId = ? AND type = ? AND data = ? LIMIT 1`,
                [
                    req.session.userId, 
                    "NEW_FOLLOW", 
                    JSON.stringify({
                        source: req.session.userId,
                        target: targetId
                    })
                ]
            );

        assertDbSuccess(notificationResult)

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
