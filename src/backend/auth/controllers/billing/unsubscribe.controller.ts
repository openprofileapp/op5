import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { config } from "../../../../../app.config.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import getEnv from "../../../../_common/helpers/getEnv.js";
import { db } from "../../databases/db.js";
import { SubscriptionType } from "../../types/subscription.type.js";
import { log } from "../../instances.js";
import { i18n, wc } from "../../../_common/instances.js";

export const unsubscribeController = async (req: Request, res: Response) => {
    try {
        await assertBearer(req);
        assertAccount(req.session);

        const existingSubscription = db.billing.query<SubscriptionType>(
            `
                SELECT *
                FROM subscriptions
                WHERE userId = ?
                    AND plan = ?
                    AND method = ?
                    AND status IN (
                        'ACTIVE',
                        'SUSPENDED'
                    )
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
                message: "No subscription found",
            });
        }

        const subscriptionId = subscription.id;

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
            throw new AdvancedError({
                code: 502,
                message: "Failed to authenticate with PayPal",
            });
        }

        const tokenData = await tokenResponse.json() as {
            access_token: string;
        };

        const accessToken = tokenData.access_token;

        const cancelResponse = await fetch(
            `${paypalBaseUrl}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    reason: "User requested cancellation",
                }),
            }
        );

        if (!cancelResponse.ok) {
            throw new AdvancedError({
                code: 502,
                message: "Unable to cancel subscription",
            });
        }

        const result = db.billing.query(
            `
                UPDATE subscriptions
                SET status = ?
                WHERE id = ?
                    AND userId = ?
                    AND method = ?
            `,
            [
                "CANCELED",
                subscriptionId,
                req.session.userId,
                "PAYPAL",
            ]
        );

        assertDbSuccess(result);

        await wc.callAPI(
            `https://${config.domains.discord_api}/v1/notifications/subscriptions/canceled`,
            {
                method: "POST",
                auth: `ApiSecret ${getEnv("API_SECRET")}`,
                body: { 
                    userId: req.session.userId, 
                    subscriptionId
                }
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
