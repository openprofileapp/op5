import type { Request, Response } from "express";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import { AdvancedError } from "kage-library";
import { log, wc } from "../instances.js";
import { i18n } from "../../_common/instances.js";
import { db } from "../databases/db.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import sendNotificationService from "../services/sendNotification.service.js";
import { assertApiSecret } from "../../_common/asserts/apiSecret.assert.js";
import { config } from "../../../../app.config.js";
import getEnv from "../../../_common/helpers/getEnv.js";

export const postSubscribeController = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;

        assertApiSecret(req);
        assertNotNull(id);

        const response = await wc.callAPI<{ dateStarted: string }>(
            `https://${config.domains.auth}/subscriptions/date/${id}`,
            { auth: `ApiSecret ${getEnv("API_SECRET")}` }
        );

        const badgesResult = db.badges.query(
            `INSERT INTO badges (
                id, 
                type,
                date
            ) VALUES (?, ?, ?)`,
            [
                id,
                "PREMIUM",
                response.dateStarted || new Date().toISOString()
            ]
        );

        assertDbSuccess(badgesResult);

        // ASSIGN DISCORD ROLE HERE

        res.status(200).json({
            ok: true
        });

        await sendNotificationService(
            id,
            "PREMIUM_ACTIVATED"
        );
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
