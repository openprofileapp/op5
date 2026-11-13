import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../instances.js";
import { i18n } from "../../_common/instances.js";
import { db } from "../databases/db.js";
import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { assertApiSecret } from "../../_common/asserts/apiSecret.assert.js";

export const suspendAccountController = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        await assertApiSecret(req);

        const result = db.accounts.query(
            `
                UPDATE users
                SET isSuspended = ?
                WHERE id = ?
            `,
            [
                1,
                userId
            ]
        );

        assertDbSuccess(result);

        return res.status(200).json({
            ok: true
        });
    } catch (error) {
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
