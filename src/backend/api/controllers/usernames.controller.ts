import type { Request, Response } from "express";
import { assertBearer } from "../../_common/asserts/bearer.assert.js";
import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import { AdvancedError } from "kage-library";
import { log } from "../instances.js";
import { i18n } from "../../_common/instances.js";
import { db } from "../databases/db.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";

export const usernamesController = async (req: Request, res: Response) => {
    try {
        const { username } = req.body;

        await assertBearer(req);
        assertNotNull(username);

        const usernameResult = db.users.query(
            `SELECT 1 FROM usernames 
            WHERE username = ? OR userId = ? LIMIT 1`, 
            [username, username]
        );

        assertDbSuccess(usernameResult);

        res.status(200).json({
            isAvailable: usernameResult.rowCount === 0
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
