import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../instances.js";
import { config } from "../../../../app.config.js";
import { i18n } from "../../_common/instances.js";
import getEnv from "../../../_common/helpers/getEnv.js";
import { assertBearer } from "../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../_common/asserts/account.assert.js";

export const subscribeController = async (req: Request, res: Response) => {
    try {
        await assertBearer(req);
        assertAccount(req.session);

        const clientId = getEnv("INTEGRATION_PAYPAL_CLIENT") as string;
        const clientSecret = getEnv("INTEGRATION_PAYPAL_SECRET") as string;
        const planId = getEnv("INTEGRATION_PAYPAL_PLAN_ID") as string;

        const credentials = Buffer.from(
            `${clientId}:${clientSecret}`
        ).toString("base64");

        const tokenResponse = await fetch(
            "https://api-m.paypal.com/v1/oauth2/token",
            {
                method: "POST",
                headers: {
                    Authorization: `Basic ${credentials}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: "grant_type=client_credentials",
            }
        );

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            throw new AdvancedError({
                code: 502,
                message: "Failed to authenticate with PayPal",
            });
        }

        const accessToken: string = tokenData.access_token;

        const planResponse = await fetch(
            `https://api-m.paypal.com/v1/billing/plans/${encodeURIComponent(planId)}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const planData = await planResponse.json();

        if (!planResponse.ok) {
            throw new AdvancedError({
                code: 502,
                message: "Unable to verify PayPal subscription plan",
            });
        }

        if (planData.status !== "ACTIVE") {
            throw new AdvancedError({
                code: 502,
                message: "PayPal subscription plan is not active",
            });
        }

        const subscriptionResponse = await fetch(
            "https://api-m.paypal.com/v1/billing/subscriptions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    plan_id: planId,
                    custom_id: String(req.session.userId),
                    application_context: {
                        brand_name: config.metadata.name,
                        user_action: "SUBSCRIBE_NOW",
                        return_url: `https://${config.domains.main}/premium`, // MUST BE PREMIUM ASSIGN API
                        cancel_url: `https://${config.domains.main}/premium`,
                    },
                }),
            }
        );

        const subscription = await subscriptionResponse.json();

        if (!subscriptionResponse.ok) {
            throw new AdvancedError({
                code: 502,
                message: "Unable to create PayPal subscription",
            });
        }

        const approvalUrl = subscription.links?.find(
            (link: { rel: string; href: string }) =>
                link.rel === "approve"
        )?.href;

        if (!approvalUrl) {
            throw new AdvancedError({
                code: 502,
                message: "PayPal did not provide an approval URL",
            });
        }

        // DEVELOPER NEEDED: SAVE STUFF IN A DATABASE AND CALL API TO MAKE PREMIUM ON API SERVER
        // MAYBE SAVE TO AUDIT

        return res.json({
            subscriptionId: subscription.id,
            approvalUrl,
        });
    } catch(error) {
        if (error instanceof AdvancedError) {
            log.unknown.error(error).save();
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
