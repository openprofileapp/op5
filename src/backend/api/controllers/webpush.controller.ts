import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";
import { assertBearer } from "../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../_common/asserts/account.assert.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import { db } from "../databases/db.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import sendPushNotificationService from "../services/sendPushNotification.service.js";
import { log } from "../instances.js";
import { i18n } from "../../_common/instances.js";

export const webPushController = async (req: Request, res: Response) => {
    try {
        const { endpoint, keys } = req.body;

        await assertBearer(req); 
        assertAccount(req.session);
        assertNotNull([endpoint, keys]);

        const result = db.users.query(
            "INSERT OR IGNORE INTO webpush (userId, endpoint, keys) VALUES (?, ?, ?)",
            [req.session.userId, endpoint, JSON.stringify(keys)]
        );

        assertDbSuccess(result);

        if (result.changes) {
            await sendPushNotificationService(
                req.session.userId,
                "WEBPUSH_SUBSCRIBE"
            )
        }

        return res.status(200).json({ ok: true });
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
