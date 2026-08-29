import type { Request, Response } from "express";
import { assertBearer } from "../../_common/asserts/bearer.assert.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import { AdvancedError } from "kage-library";
import { log } from "../instances.js";
import { i18n } from "../../_common/instances.js";
import { db } from "../databases/db.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import getEnv from "../../../_common/helpers/getEnv.js";
import postInteractionService from "../services/postInteraction.service.js";

export const postregisterController = async (req: Request, res: Response) => {
    try {
        const { 
            id,
            username,
            displayName,
            avatar,
            banner,
            isAuraEnabled,
            about,
            theme,
            badges,
            notifications 
        } = req.body;

        const authHeader = req.headers.authorization;

        let isAuthorized = false;

        if (authHeader?.startsWith("ApiSecret ")) {
            isAuthorized = authHeader.split(" ")[1] === getEnv("API_SECRET");
        }

        if (!isAuthorized) {
            throw new AdvancedError({
                code: 401,
                message: i18n.t("responses.unauthorized")
            })
        }

        assertNotNull(id);

        const userResult = db.users.query(
            `INSERT INTO users (
                id, 
                displayName,
                avatar,
                banner,
                about,
                theme,
                isAuraEnabled
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                displayName,
                avatar,
                banner,
                about,
                theme,
                isAuraEnabled
            ]
        );

        // USERNAMES HERE

        assertDbSuccess(userResult);

        await postInteractionService(
            id,
            "9534968913312158", 
            "follows"
        );

        // BADGES HERE

        






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
