import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { config } from "../../../../../app.config.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import getEnv from "../../../../_common/helpers/getEnv.js";
import { db } from "../../databases/db.js";
import { SubscriptionType } from "../../../../_common/types/subscription.type.js";
import { log } from "../../instances.js";
import { i18n, wc } from "../../../_common/instances.js";
import { PaymentType } from "../../types/payment.type.js";

export const unsubscribeController = async (req: Request, res: Response) => {
    try {
        const { requestRefund, reason } = req.body;
        
        await assertBearer(req);
        assertAccount(req.session);

        const existingSubscription = db.billing.query<SubscriptionType>(
            `
                SELECT *
                FROM subscriptions
                WHERE userId = ?
                    AND plan = ?
                    AND method = ?
                    AND status IN ('ACTIVE', 'SUSPENDED')
                LIMIT 1
            `,
            [
                req.session.userId,
                "PREMIUM_MONTHLY",
                "PAYPAL",
            ]
        );

        assertDbSuccess(existingSubscription);

        const subscription = existingSubscription.rows?.[0];

        if (!subscription) {
            throw new AdvancedError({
                code: 404,
                message: "No active subscription found",
            });
        }

        const subscriptionId = subscription.id;

        if (!subscriptionId) {
            throw new AdvancedError({
                code: 500,
                message: "PayPal subscription ID is missing",
            });
        }

        const paypalBaseUrl = config.isProduction
            ? "https://api-m.paypal.com"
            : "https://api-m.sandbox.paypal.com";

        const clientId = getEnv("INTEGRATION_PAYPAL_CLIENT") as string;
        const clientSecret = getEnv("INTEGRATION_PAYPAL_SECRET") as string;

        const credentials = Buffer.from(
            `${clientId}:${clientSecret}`
        ).toString("base64");

        const tokenResponse = await fetch(
            `${paypalBaseUrl}/v1/oauth2/token`,
            {
                method: "POST",
                headers: {
                    Authorization: `Basic ${credentials}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: "grant_type=client_credentials",
            }
        );

        if (!tokenResponse.ok) {
            const details = await tokenResponse.text();

            log.unknown.error(
                new Error(`PayPal authentication failed: ${details}`)
            ).save();

            throw new AdvancedError({
                code: 502,
                message: "Failed to authenticate with PayPal",
            });
        }

        const tokenData = await tokenResponse.json() as {
            access_token: string;
        };

        const cancelResponse = await fetch(
            `${paypalBaseUrl}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    reason: "User requested cancellation",
                }),
            }
        );

        if (!cancelResponse.ok) {
            const details = await cancelResponse.text();

            log.unknown.error(
                new Error(
                    `PayPal cancellation failed (${cancelResponse.status}): ${details}`
                )
            ).save();

            throw new AdvancedError({
                code: 502,
                message: "Unable to cancel subscription with PayPal",
            });
        }

        const patchSubscriptions = db.billing.query(
            `
                UPDATE subscriptions
                SET status = ?, endReason = ?
                WHERE id = ?
                    AND userId = ?
                    AND method = ?
            `,
            [
                "CANCELED",
                reason,
                subscription.id,
                req.session.userId,
                "PAYPAL",
            ]
        );

        assertDbSuccess(patchSubscriptions);

        const getPayment = db.billing.query<PaymentType>(
            `
                SELECT *
                FROM payments
                WHERE subscriptionId = ?
                AND userId = ?
                AND status = 'COMPLETED'
                ORDER BY dateCreated DESC
                LIMIT 1
            `,
            [subscription.id, req.session.userId]
        );

        assertDbSuccess(getPayment);

        const payment = getPayment?.rows?.[0];

        const paymentDate = payment?.dateCreated
            ? new Date(payment.dateCreated).getTime()
            : NaN;

        const paymentAge = Date.now() - paymentDate;

        const getRefundedPayments = db.billing.query<PaymentType>(
            `
                SELECT *
                FROM payments
                WHERE status = 'REFUNDED'
                AND userId = ?
            `,
            [req.session.userId]
        );

        assertDbSuccess(getRefundedPayments);

        const allowRefund =
            getRefundedPayments.rowCount === 0 &&
            Boolean(requestRefund) &&
            payment?.status === "COMPLETED" &&
            Number.isFinite(paymentDate) &&
            paymentAge >= 0 &&
            paymentAge < 48 * 60 * 60 * 1000; // 48 hours

        if (allowRefund) {
            const patchSubscriptions = db.billing.query(
                `
                    UPDATE subscriptions
                    SET dateEnded = ?
                    WHERE id = ?
                        AND userId = ?
                        AND method = ?
                `,
                [
                    new Date().toISOString(),
                    subscription.id,
                    req.session.userId,
                    "PAYPAL",
                ]
            );

            assertDbSuccess(patchSubscriptions);

            await wc.callAPI(
                `https://${config.domains.api}/v3/post/unsubscribe`,
                {
                    method: "POST",
                    auth: `ApiSecret ${getEnv("API_SECRET")}`,
                    body: {
                        id: req.session.userId
                    }
                }
            );

            const refundResponse = await fetch(
                `${paypalBaseUrl}/v1/payments/sale/${encodeURIComponent(payment.id)}/refund`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${tokenData.access_token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        reason: "User requested refund",
                    }),
                }
            );

            if (!refundResponse.ok) {
                const details = await refundResponse.text();

                log.unknown.error(
                    new Error(
                        `PayPal refund failed (${refundResponse.status}): ${details}`
                    )
                ).save();

                throw new AdvancedError({
                    code: 502,
                    message: "Unable to refund subscription with PayPal",
                });
            }
        }

        await wc.callAPI(
            `https://${config.domains.discord_api}/v1/notifications/subscriptions/canceled`,
            {
                method: "POST",
                auth: `ApiSecret ${getEnv("API_SECRET")}`,
                body: {
                    userId: req.session.userId,
                    subscriptionId: subscription.id
                },
            }
        );

        return res.json({
            success: true,
        });
    } catch (error) {
        if (error instanceof AdvancedError) {
            log.unknown.error(error).save();
            return res.status(error.code).json({
                id: error.id,
                message: error.message,
            });
        }
        log.unknown.error(error).save();
        return res.status(500).json({
            message: i18n.t("responses.unknown"),
        });
    }
};
