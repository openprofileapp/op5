import type { Request, Response } from "express";
import { AdvancedError } from "kage-library";

import { config } from "../../../../app.config.js";
import getEnv from "../../../_common/helpers/getEnv.js";
import { log, wc } from "../instances.js";
import { i18n } from "../../_common/instances.js";
import { db } from "../databases/db.js";
import { assertApiSecret } from "../../_common/asserts/apiSecret.assert.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";

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
            `INSERT OR IGNORE INTO badges (
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

        const usersResult = db.users.query(
            `
                UPDATE users
                SET isAuraEnabled = 1
                WHERE id = ?
            `,
            [id]
        );

        assertDbSuccess(usersResult);

        await wc.callAPI(
            `https://${config.domains.auth}/permissions/${id}/add/premium`,
            { auth: `ApiSecret ${getEnv("API_SECRET")}` }
        );

        const connectedAccount = await wc.callAPI<{ externalId: string }>(
            `https://${config.domains.auth}/integration/get/external/discord/${id}`,
            { auth: `ApiSecret ${getEnv("API_SECRET")}` }
        );

        if (connectedAccount.externalId) {
            await wc.callAPI(
                `https://${config.domains.discord_api}/v1/roles/${connectedAccount.externalId}/add/${config.integrations.discord.roles.premium}`,
                { auth: `ApiSecret ${getEnv("API_SECRET")}` }
            );
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
