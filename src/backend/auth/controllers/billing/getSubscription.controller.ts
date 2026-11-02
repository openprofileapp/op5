import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";
import { i18n } from "../../../_common/instances.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { db } from "../../databases/db.js";
import { SubscriptionType } from "../../../../_common/types/subscription.type.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { PaymentType } from "../../types/payment.type.js";

export const getSubscriptionController = async (req: Request, res: Response) => {
    try {
        await assertBearer(req);
        assertAccount(req.session);

        const payments = db.billing.query<PaymentType>(
            `
                SELECT *
                FROM payments
                WHERE userId = ? AND status = 'REFUNDED'
            `,
            [req.session.userId]
        );

        assertDbSuccess(payments);

        const subscriptions = db.billing.query<SubscriptionType>(
            `
                SELECT *
                FROM subscriptions
                WHERE userId = ?
                ORDER BY dateCreated DESC
            `,
            [req.session.userId]
        );

        assertDbSuccess(subscriptions);

        const now = Date.now();

        const subscription = subscriptions.rows
            .filter((subscription) => {
                if (
                    subscription.status === "ACTIVE" ||
                    subscription.status === "SUSPENDED"
                ) {
                    return true;
                }

                return (
                    subscription.status === "CANCELED" &&
                    !!subscription.dateEnded &&
                    new Date(subscription.dateEnded).getTime() > now
                );
            })[0];

        const paidResult = db.billing.query<PaymentType>(
            `
                SELECT *
                FROM payments
                WHERE subscriptionId = ? AND status = 'COMPLETED'
            `,
            [subscription?.id]
        );

        assertDbSuccess(paidResult);

        const hasPaid = paidResult.rowCount !== 0

        const isOver48Hours =
            !!subscription?.dateStarted &&
            Date.now() - new Date(subscription.dateStarted).getTime() >
                48 * 60 * 60 * 1000;

        const isCanceledAndLastWeek =
            subscription?.status === "CANCELED" &&
            !!subscription.dateEnded &&
            new Date(subscription.dateEnded).getTime() - Date.now() <=
                7 * 24 * 60 * 60 * 1000 &&
            new Date(subscription.dateEnded).getTime() >= Date.now();

        const endDate = subscriptions.rows.reduce(
            (latest, subscription) =>
                !latest || subscription.dateEnded > latest
                    ? subscription.dateEnded
                    : latest,
            null as SubscriptionType["dateEnded"] | null
        )

        return res.json({
            subscription,
            hasPaid,
            refundEligible: payments.rowCount === 0,
            isOver48Hours,
            isCanceledAndLastWeek,
            endDate
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
