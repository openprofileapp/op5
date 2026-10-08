import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../instances.js";
import { i18n } from "../../_common/instances.js";
import { assertApiSecret } from "../../_common/asserts/apiSecret.assert.js";
import { db } from "../databases/db.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";

export const checkController = async (req: Request, res: Response) => {
    try {
        await assertApiSecret(req);

        const onlineResult = db.accounts.query(
            "SELECT COUNT(*) AS length FROM sessions WHERE isConnected = 1"
        )

        assertDbSuccess(onlineResult);

        res.status(200).json({
            onlineUsers: Number(onlineResult.rows[0].length)
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
