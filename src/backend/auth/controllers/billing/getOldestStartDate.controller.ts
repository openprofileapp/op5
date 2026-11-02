import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";
import { i18n } from "../../../_common/instances.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { db } from "../../databases/db.js";
import { assertApiSecret } from "../../../_common/asserts/apiSecret.assert.js";

export const getOldestStartDateController = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        await assertApiSecret(req)

        const sixtyDaysAgo = new Date(
            Date.now() - 60 * 24 * 60 * 60 * 1000
        ).toISOString();

        const result = db.billing.query<{ oldestDateStarted: string | null }>(
            `
                SELECT MIN(dateStarted) AS oldestDateStarted
                FROM subscriptions
                WHERE userId = ?
                    AND dateStarted >= ?
                    AND dateStarted <= ?
            `,
            [
                userId,
                sixtyDaysAgo,
                new Date().toISOString()
            ]
        );

        assertDbSuccess(result);

        return res.json({
            dateStarted: result.rows[0]?.oldestDateStarted ?? null
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
