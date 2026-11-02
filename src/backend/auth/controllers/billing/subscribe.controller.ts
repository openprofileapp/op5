import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";
import { config } from "../../../../../app.config.js";
import { i18n } from "../../../_common/instances.js";
import getEnv from "../../../../_common/helpers/getEnv.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { db } from "../../databases/db.js";
import { SubscriptionType } from "../../../../_common/types/subscription.type.js";

export const subscribeController = async (req: Request, res: Response) => {
    try {
        await assertBearer(req);
        assertAccount(req.session);

        const paypalBaseUrl = config.isProduction
            ? "https://api-m.paypal.com"
            : "https://api-m.sandbox.paypal.com";

        const clientId = getEnv("INTEGRATION_PAYPAL_CLIENT") as string;
        const clientSecret = getEnv("INTEGRATION_PAYPAL_SECRET") as string;
        const planId = getEnv("INTEGRATION_PAYPAL_PLAN_ID") as string;

        const userId = req.session.userId;
        const plan = "PREMIUM_MONTHLY";
        const method = "PAYPAL";

        const existingSubscription = db.billing.query<SubscriptionType>(
            `
                SELECT *
                FROM subscriptions
                WHERE userId = ?
                    AND plan = ?
                    AND method = ?
                    AND status IN ('PENDING', 'ACTIVE', 'SUSPENDED')
                ORDER BY
                    CASE
                        WHEN status = 'ACTIVE' THEN 1
                        WHEN status = 'SUSPENDED' THEN 2
                        WHEN status = 'PENDING' THEN 3
                        ELSE 4
                    END
                LIMIT 1
            `,
            [userId, plan, method]
        );

        assertDbSuccess(existingSubscription);

        const existing = existingSubscription.rows?.[0];

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
            throw new AdvancedError({
                code: 502,
                message: "Failed to authenticate with PayPal",
            });
        }

        const tokenData = await tokenResponse.json() as {
            access_token: string;
        };

        const accessToken = tokenData.access_token;

        const paypalHeaders = {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        };

        if (
            existing &&
            (existing.status === "ACTIVE" || existing.status === "SUSPENDED")
        ) {
            const existingResponse = await fetch(
                `${paypalBaseUrl}/v1/billing/subscriptions/${encodeURIComponent(existing.id)}`,
                {
                    method: "GET",
                    headers: paypalHeaders,
                }
            );

            if (!existingResponse.ok) {
                throw new AdvancedError({
                    code: 502,
                    message: "Unable to retrieve existing PayPal subscription",
                });
            }

            const paypalSubscription = await existingResponse.json() as {
                status: string;
            };

            if (
                paypalSubscription.status === "ACTIVE" ||
                paypalSubscription.status === "SUSPENDED"
            ) {
                if (paypalSubscription.status !== existing.status) {
                    const updateResult = db.billing.query(
                        `
                            UPDATE subscriptions
                            SET status = ?
                            WHERE id = ?
                                AND userId = ?
                        `,
                        [
                            paypalSubscription.status,
                            existing.id,
                            userId,
                        ]
                    );

                    assertDbSuccess(updateResult);
                }

                throw new AdvancedError({
                    code: 409,
                    message: "You are already subscribed",
                });
            }

            if (
                paypalSubscription.status === "CANCELLED" ||
                paypalSubscription.status === "EXPIRED"
            ) {
                const updateResult = db.billing.query(
                    `
                        UPDATE subscriptions
                        SET status = ?
                        WHERE id = ?
                            AND userId = ?
                    `,
                    [
                        paypalSubscription.status === "CANCELLED"
                            ? "CANCELED"
                            : "EXPIRED",
                        existing.id,
                        userId,
                    ]
                );

                assertDbSuccess(updateResult);
            } else {
                throw new AdvancedError({
                    code: 409,
                    message: `Existing PayPal subscription has status ${paypalSubscription.status}`,
                });
            }
        }

        if (existing?.status === "PENDING") {
            const existingResponse = await fetch(
                `${paypalBaseUrl}/v1/billing/subscriptions/${encodeURIComponent(existing.id)}`,
                {
                    method: "GET",
                    headers: paypalHeaders,
                }
            );

            if (!existingResponse.ok) {
                throw new AdvancedError({
                    code: 502,
                    message: "Unable to retrieve pending subscription",
                });
            }

            const pendingSubscription = await existingResponse.json() as {
                id: string;
                status: string;
                links?: {
                    rel: string;
                    href: string;
                }[];
            };

            if (pendingSubscription.status === "APPROVAL_PENDING") {
                const approvalUrl = pendingSubscription.links?.find(
                    (link) => link.rel === "approve"
                )?.href;

                if (!approvalUrl) {
                    throw new AdvancedError({
                        code: 502,
                        message: "PayPal did not provide an approval URL",
                    });
                }

                return res.json({
                    approvalUrl,
                });
            }

            if (
                pendingSubscription.status === "ACTIVE" ||
                pendingSubscription.status === "SUSPENDED"
            ) {
                const updateResult = db.billing.query(
                    `
                        UPDATE subscriptions
                        SET status = ?
                        WHERE id = ?
                            AND userId = ?
                    `,
                    [
                        pendingSubscription.status,
                        existing.id,
                        userId,
                    ]
                );

                assertDbSuccess(updateResult);

                throw new AdvancedError({
                    code: 409,
                    message: "You are already subscribed",
                });
            }

            if (
                pendingSubscription.status === "CANCELLED" ||
                pendingSubscription.status === "EXPIRED"
            ) {
                const updateResult = db.billing.query(
                    `
                        UPDATE subscriptions
                        SET status = ?
                        WHERE id = ?
                            AND userId = ?
                    `,
                    [
                        pendingSubscription.status === "CANCELLED"
                            ? "CANCELED"
                            : "EXPIRED",
                        existing.id,
                        userId,
                    ]
                );

                assertDbSuccess(updateResult);
            } else {
                throw new AdvancedError({
                    code: 409,
                    message: `Existing PayPal subscription has status ${pendingSubscription.status}`,
                });
            }
        }

        const canceledSubscription = db.billing.query<SubscriptionType>(
            `
                SELECT *
                FROM subscriptions
                WHERE userId = ?
                    AND plan = ?
                    AND method = ?
                    AND status = 'CANCELED'
                ORDER BY dateEnded DESC
                LIMIT 1
            `,
            [userId, plan, method]
        );

        assertDbSuccess(canceledSubscription);

        const canceled = canceledSubscription.rows?.[0];

        let startTime: string | undefined;

        if (canceled?.dateEnded) {
            const endDate = new Date(canceled.dateEnded);

            if (
                !Number.isNaN(endDate.getTime()) &&
                endDate.getTime() > Date.now()
            ) {
                startTime = endDate.toISOString();
            }
        }

        const planResponse = await fetch(
            `${paypalBaseUrl}/v1/billing/plans/${encodeURIComponent(planId)}`,
            {
                method: "GET",
                headers: paypalHeaders,
            }
        );

        if (!planResponse.ok) {
            throw new AdvancedError({
                code: 502,
                message: "Unable to verify PayPal subscription plan",
            });
        }

        const planData = await planResponse.json() as {
            status: string;
        };

        if (planData.status !== "ACTIVE") {
            throw new AdvancedError({
                code: 502,
                message: "PayPal subscription plan is not active",
            });
        }

        const subscriptionResponse = await fetch(
            `${paypalBaseUrl}/v1/billing/subscriptions`,
            {
                method: "POST",
                headers: paypalHeaders,
                body: JSON.stringify({
                    plan_id: planId,
                    custom_id: String(userId),

                    ...(startTime
                        ? { start_time: startTime }
                        : {}),

                    application_context: {
                        brand_name: config.metadata.name,
                        user_action: "SUBSCRIBE_NOW",
                        return_url: `https://${config.domains.main}/premium`,
                        cancel_url: `https://${config.domains.main}/premium`,
                    },
                }),
            }
        );

        if (!subscriptionResponse.ok) {
            const errorDetails = await subscriptionResponse.text();

            log.unknown.error(
                new Error(
                    `PayPal subscription creation failed: ${errorDetails}`
                )
            ).save();

            throw new AdvancedError({
                code: 502,
                message: "Unable to create subscription",
            });
        }

        const subscription = await subscriptionResponse.json() as {
            id: string;
            status: string;
            links?: {
                rel: string;
                href: string;
            }[];
        };

        const approvalUrl = subscription.links?.find(
            (link) => link.rel === "approve"
        )?.href;

        if (!approvalUrl) {
            throw new AdvancedError({
                code: 502,
                message: "PayPal did not provide an approval URL",
            });
        }

        const insertResult = db.billing.query(
            `
                INSERT INTO subscriptions (
                    id,
                    userId,
                    plan,
                    method,
                    status
                ) VALUES (?, ?, ?, ?, ?)
            `,
            [
                subscription.id,
                userId,
                plan,
                method,
                "PENDING",
            ]
        );

        assertDbSuccess(insertResult);

        return res.json({
            approvalUrl
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
