import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";
import { i18n } from "../../../_common/instances.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { db } from "../../databases/db.js";
import { UserAccountType } from "../../types/userAccount.type.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";

export const getPartnerEarningsController = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params

        await assertBearer(req); 
        assertAccount(req.session);

        if (userId !== req.session.userId) {
            throw new AdvancedError({
                code: 401,
                message: i18n.t("responses.unauthorized")
            });
        }

        const result = db.accounts.query<UserAccountType>(
            `
                SELECT *
                FROM users
                WHERE id = ?
            `,
            [userId]
        );

        assertDbSuccess(result);

        if (result.rowCount < 1) {
            throw new AdvancedError({
                code: 404,
                message: "Account not found"
            })
        }

        const account = result.rows[0]

        return res.json({
            available: account.availableEarningsUSD,
            lifetime: account.lifetimeEarningsUSD
        });
    } catch (error) {
        if (error instanceof AdvancedError) {
            log.unknown.error(error).save();
            return res.status(error.code).json({
                id: error.id,
                message: error.message
            });
        }
        log.unknown.error(error).save();
        return res.status(500).json({
            message: i18n.t("responses.unknown")
        });
    }
};
