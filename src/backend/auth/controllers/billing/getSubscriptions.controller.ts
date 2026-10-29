import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";
import { i18n } from "../../../_common/instances.js";
import { assertApiSecret } from "../../../_common/asserts/apiSecret.assert.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { db } from "../../databases/db.js";
import { SubscriptionType } from "../../types/subscription.type.js";

export const getSubscriptionsController = async (req: Request, res: Response) => {
    try {
        await assertApiSecret(req);

        const userIds: unknown = req.body?.userIds;

        if (
            !Array.isArray(userIds) ||
            !userIds.every(
                (id): id is string => typeof id === "string"
            )
        ) {
            throw new AdvancedError({
                code: 400,
                message: "userIds must be an array of strings"
            });
        }

        const uniqueUserIds = [...new Set(userIds)];

        if (uniqueUserIds.length === 0) {
            return res.json({});
        }

        const placeholders = uniqueUserIds
            .map(() => "?")
            .join(", ");

        const result = db.billing.query<SubscriptionType>(
            `
                SELECT *
                FROM subscriptions
                WHERE userId IN (${placeholders})
                    AND status IN (
                        'PENDING',
                        'ACTIVE',
                        'SUSPENDED'
                    )
            `,
            uniqueUserIds
        );

        assertDbSuccess(result);

        const subscriptions: Record<string, string | null> = {};

        for (const userId of uniqueUserIds) {
            subscriptions[userId] = null;
        }

        for (const subscription of result.rows ?? []) {
            const userId = String(subscription.userId);

            let text;

            if (subscription.plan === "PREMIUM_LIFETIME") {
                text = "Lifetime"
            } else {
                if (
                    subscription.method === "OFFICIAL_GIFT" ||
                    subscription.method === "PARTNER_GIFT"
                ) {
                    text = "Gift"
                } else {
                    text = "Subscribed"
                }
            }

            if (subscriptions[userId] === null) {
                subscriptions[userId] = text;
            }
        }

        return res.json(subscriptions);
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
