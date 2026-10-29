import type { Request, Response } from "express";
import { DateTime } from "luxon";

import { AdvancedError } from "kage-library";

import { config } from "../../../../../app.config.js";
import { log } from "../../instances.js";
import getEnv from "../../../../_common/helpers/getEnv.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { db } from "../../databases/db.js";
import { i18n, wc } from "../../../_common/instances.js";
import { assertNotNull } from "../../../../_common/asserts/notNull.assert.js";
import { SubscriptionStatusType } from "../../types/subscription.type.js";

type PayPalWebhookEvent = {
    id: string;
    event_type: string;
    create_time?: string;
    resource_type?: string;
    summary?: string;
    event_version?: string;
    resource_version?: string;

    resource?: {
        id?: string;
        status?: string;
        state?: string;
        status_update_time?: string;

        plan_id?: string;
        billing_agreement_id?: string;
        custom?: string;
        invoice_id?: string;
        quantity?: string;

        create_time?: string;
        update_time?: string;
        start_time?: string;
        next_billing_time?: string;
        final_payment_time?: string;

        amount?: {
            total?: string;
            currency?: string;
        };

        shipping_amount?: {
            total?: string;
            currency?: string;
        };

        billing_info?: {
            outstanding_balance?: {
                total?: string;
                currency?: string;
            };
            last_payment?: {
                amount?: {
                    total?: string;
                    currency?: string;
                };
                time?: string;
            };
            next_billing_time?: string;
            final_payment_time?: string;
            failed_payments_count?: number;
            cycle_executions?: Array<{
                tenure_type?: string;
                sequence?: number;
                cycles_completed?: number;
                cycles_remaining?: number;
                current_pricing_scheme_version?: number;
            }>;
        };

        subscriber?: {
            name?: {
                given_name?: string;
                surname?: string;
            };
            email_address?: string;
            payer_id?: string;
        };

        dispute_id?: string;
        reason?: string;

        supplementary_data?: {
            related_ids?: {
                order_id?: string;
                capture_id?: string;
                sale_id?: string;
                billing_agreement_id?: string;
            };
        };

        links?: Array<{
            href: string;
            rel: string;
            method?: string;
            encType?: string;
        }>;
    };

    links?: Array<{
        href: string;
        rel: string;
        method?: string;
        encType?: string;
    }>;
};

const statusByEvent: Record<string, SubscriptionStatusType> = {
    "BILLING.SUBSCRIPTION.ACTIVATED": "ACTIVE",
    "BILLING.SUBSCRIPTION.SUSPENDED": "SUSPENDED",
    "BILLING.SUBSCRIPTION.CANCELLED": "CANCELED",
    "BILLING.SUBSCRIPTION.EXPIRED": "EXPIRED",
};

const paymentEventTypes = new Set([
    "BILLING.SUBSCRIPTION.PAYMENT.COMPLETED",
    "BILLING.SUBSCRIPTION.PAYMENT.FAILED",

    "PAYMENT.SALE.COMPLETED",
    "PAYMENT.SALE.REFUNDED",
    "PAYMENT.SALE.REVERSED",

    "PAYMENT.CAPTURE.COMPLETED",
    "PAYMENT.CAPTURE.REFUNDED",
    "PAYMENT.CAPTURE.REVERSED",

    "PAYMENT.PAYOUTS-ITEM.SUCCEEDED",
    "PAYMENT.PAYOUTS-ITEM.FAILED",

    "CUSTOMER.DISPUTE.CREATED",
    "CUSTOMER.DISPUTE.UPDATED",
    "CUSTOMER.DISPUTE.RESOLVED",
]);

export const webhookController = async (req: Request, res: Response) => {
    try {
        const event = req.body as PayPalWebhookEvent;

        assertNotNull(event);

        if (
            typeof event.id !== "string" ||
            typeof event.event_type !== "string" ||
            !event.resource
        ) {
            return res.status(400).json({
                message: "Invalid PayPal webhook event",
            });
        }

        const authAlgo = req.get("paypal-auth-algo");
        const certUrl = req.get("paypal-cert-url");
        const transmissionId = req.get("paypal-transmission-id");
        const transmissionSig = req.get("paypal-transmission-sig");
        const transmissionTime = req.get("paypal-transmission-time");

        assertNotNull([
            authAlgo,
            certUrl,
            transmissionId,
            transmissionSig,
            transmissionTime,
        ]);

        const paypalBaseUrl = config.isProduction
            ? "https://api-m.paypal.com"
            : "https://api-m.sandbox.paypal.com";

        const clientId = getEnv("INTEGRATION_PAYPAL_CLIENT") as string;
        const clientSecret = getEnv("INTEGRATION_PAYPAL_SECRET") as string;
        const webhookId = getEnv("INTEGRATION_PAYPAL_WEBHOOK_ID") as string;

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
            log.unknown.error(
                new Error(
                    `PayPal authentication failed: ${
                        await tokenResponse.text()
                    }`
                )
            ).save();

            const error = new AdvancedError({
                code: 502,
                message: "Failed to authenticate with PayPal",
            });

            return res.status(error.code).json({
                id: error.id,
                message: error.message,
            });
        }

        const tokenData = await tokenResponse.json() as {
            access_token: string;
        };

        const verificationResponse = await fetch(
            `${paypalBaseUrl}/v1/notifications/verify-webhook-signature`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    auth_algo: authAlgo,
                    cert_url: certUrl,
                    transmission_id: transmissionId,
                    transmission_sig: transmissionSig,
                    transmission_time: transmissionTime,
                    webhook_id: webhookId,
                    webhook_event: event,
                }),
            }
        );

        if (!verificationResponse.ok) {
            log.unknown.error(
                new Error(
                    `PayPal webhook verification failed: ${
                        await verificationResponse.text()
                    }`
                )
            ).save();

            const error = new AdvancedError({
                code: 502,
                message: "Unable to verify PayPal webhook",
            });

            return res.status(error.code).json({
                id: error.id,
                message: error.message,
            });
        }

        const verification = await verificationResponse.json() as {
            verification_status: string;
        };

        if (verification.verification_status !== "SUCCESS") {
            log.unknown.error(
                new Error(
                    `Invalid PayPal webhook signature: ${event.id}`
                )
            ).save();

            return res.status(400).json({
                message: "Invalid webhook signature",
            });
        }

        const newStatus = statusByEvent[event.event_type];

        if (newStatus) {
            const subscriptionId = event.resource.id;

            if (!subscriptionId) {
                return res.status(400).json({
                    message: "Missing PayPal subscription ID",
                });
            }

            const result = db.billing.query(
                `
                    UPDATE subscriptions
                    SET status = ?
                    WHERE id = ?
                        AND method = ?
                        AND (
                            ? IN ('CANCELED', 'EXPIRED')
                            OR status NOT IN ('CANCELED', 'EXPIRED')
                        )
                `,
                [
                    newStatus,
                    subscriptionId,
                    "PAYPAL",
                    newStatus,
                ]
            );

            assertDbSuccess(result);

            return res.sendStatus(200);
        }

        if (paymentEventTypes.has(event.event_type)) {
            const resource = event.resource;

            switch (event.event_type) {
                case "PAYMENT.SALE.COMPLETED": {
                    const premiumCost = 4.99;
                    // const taxPercentage = 6;
                    const initialPartnerSplitPercentage = 65;
                    const recurringPartnerSplitPercentage = 5;
                    let partnerSplit = 0;

                    const now = DateTime.utc();
                    const nowIso = now.toISO();
                    const in30DaysIso = now.plus({ days: 30 }).toISO();

                    const updateSubscription = db.billing.query(
                        `
                            UPDATE subscriptions
                            SET dateStarted = ?, dateEnded = ?
                            WHERE id = ?
                        `,
                        [
                            nowIso,
                            in30DaysIso,
                            resource.billing_agreement_id,
                        ]
                    );

                    assertDbSuccess(updateSubscription);

                    const getPreviousPayments = db.billing.query(
                        `
                            SELECT *
                            FROM payments
                            WHERE userId = ?
                                AND (
                                    status IN ('COMPLETED', 'REFUNDED')
                                    OR status NOT IN ('FAILED')
                                )
                        `,
                        [resource.custom]
                    );

                    assertDbSuccess(getPreviousPayments);

                    if (getPreviousPayments.rowCount === 0) {
                        partnerSplit = premiumCost * (initialPartnerSplitPercentage / 100);
                    } else {
                        partnerSplit = premiumCost * (recurringPartnerSplitPercentage / 100);
                    }

                    const insertPayment = db.billing.query(
                        `
                            INSERT INTO payments (
                                id, 
                                subscriptionId, 
                                userId,
                                subtotal,
                                tax,
                                total,
                                currency,
                                status
                            )
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        `,
                        [
                            resource.id,
                            resource.billing_agreement_id,
                            resource.custom,
                            premiumCost,
                            (Number(resource.amount?.total) - premiumCost).toFixed(2),
                            Number(resource.amount?.total),
                            resource.amount?.currency,
                            "COMPLETED"
                        ]
                    );

                    assertDbSuccess(insertPayment);

                    // Assign premium (call API incuding calling discord update roles)
                    // ^ Incude the last subscrption date for the badge. If less than 2 months, use the old date

                    const inviteResponse = await wc.callAPI<{ ownerId: string, code: string }>(
                        `https://${config.domains.api}/v3/invites/user/${resource.custom}`,
                        { auth: `ApiSecret ${getEnv("API_SECRET")}` }
                    );

                    if (inviteResponse?.ownerId) {
                        const insertPayout = db.billing.query(
                            `
                                INSERT INTO payouts (
                                    paymentId, 
                                    userId,
                                    total,
                                    currency,
                                    status
                                )
                                VALUES (?, ?, ?, ?, ?)
                            `,
                            [
                                resource.id,
                                inviteResponse.ownerId,
                                partnerSplit.toFixed(2),
                                resource.amount?.currency,
                                "PENDING"
                            ]
                        );

                        assertDbSuccess(insertPayout);

                        







                        // Save the ids to db then the response ids

                        // MOVE THIS TO CASHOUT API
                        // billing/cashout

                        // TAKES A $0.25 MIN (we won't cover it; no min to cashout)
                        // DISPLAY MODAL WITH EMAIL (and confirm email) AND WARNING ^
                        const payoutResponse = await fetch(
                            `${paypalBaseUrl}/v1/payments/payouts`,
                            {
                                method: "POST",
                                headers: {
                                    Authorization: `Bearer ${tokenData.access_token}`,
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    sender_batch_header: {
                                        sender_batch_id: crypto.randomUUID(),
                                        email_subject: "Your OpenProfile Partner Earnings",
                                    },
                                    items: [
                                        {
                                            recipient_type: "EMAIL",
                                            amount: {
                                                value: partnerSplit.toFixed(2),
                                                currency: "USD",
                                            },
                                            receiver: "sb-pent353577642@personal.example.com",
                                            note: `OpenProfile Partner Program: Revenue share earned from an invited user's${getPreviousPayments.rowCount === 0 ? " " : " recurring "}Premium subscription.`,
                                            sender_item_id: crypto.randomUUID(), // use snowflake
                                        },
                                    ],
                                }),
                            }
                        );

                        const payout = await payoutResponse.json();
                    }

                    await wc.callAPI(
                        `https://${config.domains.discord_api}/v1/notifications/subscriptions/new`,
                        {
                            method: "POST",
                            auth: `ApiSecret ${getEnv("API_SECRET")}`,
                            body: { 
                                userId: resource.custom, 
                                subscriptionId: resource.billing_agreement_id 
                            }
                        }
                    );

                    break;
                }

                case "PAYMENT.SALE.REFUNDED": {
                    // NO REFUND FOR THE TIME BEING

                    const updatePayment = db.billing.query(
                        `
                            UPDATE payments
                            SET status = ?
                            WHERE id = ?
                        `,
                        [
                            "REFUNDED",
                            resource.id
                        ]
                    );

                    assertDbSuccess(updatePayment);

                    // Remove premium (call API)

                    break;
                }

                case "PAYMENT.SALE.REVERSED": {

                    // Insert into reverse attempt
                    // Warn the account for attempt charge back

                    // IF CHARGED BACK WITHIN 48 HOURS OF FRIST SUBCIPTION, ALLOW IT. ELSE, LIMIT THE ACCOUNT UNLESS REVIEWED BY STAFF
                    break;
                }

                case "PAYMENT.PAYOUTS-ITEM.SUCCEEDED": {
                    /*
                        12:42:19 [INFO] {
                            transaction_id: "7B527729B9143193F"
                            payout_item_fee: {
                                currency: "USD"
                                value: "0.25"
                            }
                            transaction_status: "SUCCESS"
                            sender_batch_id: "3df8f0e3-35d8-4d6b-bfd9-6318d1668954"
                            time_processed: "2026-10-29T16:41:55Z"
                            activity_id: "27M36287MC048832X"
                            payout_item: {
                                recipient_type: "EMAIL"
                                amount: {
                                    currency: "USD"
                                    value: "0.25"
                                }
                                note: "OpenProfile Partner Program: Revenue share earned from an invited user's recurring Premium subscription."
                                receiver: "sb-pent353577642@personal.example.com"
                                sender_item_id: "3058face-d7a9-4626-b3c6-d4ff2cc6eadd"
                                recipient_wallet: "PAYPAL"
                            }
                            links: [
                                {
                                    href: "https://api.sandbox.paypal.com/v1/payments/payouts-item/JVE7PKG4MKTUS"
                                    rel: "self"
                                    method: "GET"
                                    encType: "application/json"
                                }
                                {
                                    href: "https://api.sandbox.paypal.com/v1/payments/payouts/W9XETF4FUWKAQ"
                                    rel: "batch"
                                    method: "GET"
                                    encType: "application/json"
                                }
                            ]
                            payout_item_id: "JVE7PKG4MKTUS"
                            payout_batch_id: "W9XETF4FUWKAQ"
                        }
                    */

                    // LOG THE FEE IN THE DB

                    break;
                }

                case "PAYMENT.PAYOUTS-ITEM.FAILED": {
                    break;
                }





















                case "CUSTOMER.DISPUTE.CREATED": {
                    break;
                }

                case "CUSTOMER.DISPUTE.UPDATED": {
                    break;
                }

                case "CUSTOMER.DISPUTE.RESOLVED": {
                    break;
                }

                default:
                    break;
            }

            return res.sendStatus(200);
        }

        return res.sendStatus(200);
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
