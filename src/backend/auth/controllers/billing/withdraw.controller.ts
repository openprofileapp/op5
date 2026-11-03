import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { config } from "../../../../../app.config.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import getEnv from "../../../../_common/helpers/getEnv.js";
import { db } from "../../databases/db.js";
import { log, snowflake } from "../../instances.js";
import { i18n } from "../../../_common/instances.js";
import { UserAccountType } from "../../types/userAccount.type.js";

export const withdrawController = async (req: Request, res: Response) => {
    try {
        const { email, confirmEmail, amount } = req.body;
        
        await assertBearer(req);
        assertAccount(req.session);

        if (email !== confirmEmail) {
            throw new AdvancedError({
                code: 400,
                message: "Email does not match"
            })
        }

        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

        if (!emailRegex.test(email)) {
            throw new AdvancedError({
                code: 400,
                message: i18n.t("responses.invalidEmail")
            })
        }

        let finalAmount = Number(amount);

        if (finalAmount <= 0.25) {
            throw new AdvancedError({
                code: 400,
                message: "You cannot withdraw an amount less or equal to the fee",
            });
        }

        const isFeeCovered = finalAmount >= 10;

        if (!isFeeCovered) {
            finalAmount = finalAmount - 0.25;
        }

        const accountResult = db.accounts.query<UserAccountType>(
            `
                SELECT *
                FROM users
                WHERE id = ?
            `,
            [
                req.session.userId,
            ]
        );

        assertDbSuccess(accountResult);

        const account = accountResult.rows?.[0];

        if (account.availableEarningsUSD < finalAmount) {
            throw new AdvancedError({
                code: 400,
                message: "You cannot withdraw an amount greater than what you have",
            });
        }

        const senderBatchId = snowflake.gen();
        const senderItemId = snowflake.gen();

        const insertPayout = db.billing.query(
            `
                INSERT INTO payouts (
                    userId,
                    email,
                    subtotal,
                    fee,
                    isFeeCovered,
                    total,
                    currency,
                    status,
                    senderBatchId,
                    senderItemId
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                req.session.userId,
                email,
                finalAmount.toFixed(2),
                0.25,
                isFeeCovered ? 1 : 0,
                isFeeCovered ? finalAmount.toFixed(2) : Number(amount).toFixed(2),
                "USD",
                "PENDING",
                senderBatchId,
                senderItemId
            ]
        );

        assertDbSuccess(insertPayout);

        const updateRevenue = db.accounts.query(
            `
                UPDATE users
                SET
                    availableEarningsUSD = ROUND(availableEarningsUSD - ?, 2)
                WHERE id = ?
            `,
            [
                Number(amount).toFixed(2),
                req.session.userId
            ]
        );

        assertDbSuccess(updateRevenue);

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
                        sender_batch_id: senderBatchId,
                        email_subject: "Your OpenProfile Partner Earnings",
                    },
                    items: [
                        {
                            recipient_type: "EMAIL",
                            amount: {
                                value: finalAmount.toFixed(2),
                                currency: "USD",
                            },
                            receiver: email,
                            note: `OpenProfile Partner Program: Revenue share earned from an invited user's Premium subscription.`,
                            sender_item_id: senderItemId,
                        },
                    ],
                }),
            }
        );

        if (!payoutResponse.ok) {
            const details = await payoutResponse.text();

            log.unknown.error(
                new Error(
                    `PayPal payout failed (${payoutResponse.status}): ${details}`
                )
            ).save();

            throw new AdvancedError({
                code: 502,
                message: "Unable to payout via PayPal",
            });
        }

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
