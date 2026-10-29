import { config } from "../../../../app.config.js";
import getEnv from "../../../_common/helpers/getEnv.js";

// IMPORTANT; NEVER CALL THIS UNLESS YOU NEED TO CREATE A DUMMY
// PRODUCT ON PAYPAL'S API. THIS IS NOT A PRODUCTION HELPER.
export async function createSandboxPayPalPlan(): Promise<{
    productId: string;
    planId: string;
}> {
    if (config.isProduction) {
        throw new Error(
            "THIS IS NOT A PRODUCTION HELPER"
        );
    };

    const clientId = getEnv("INTEGRATION_PAYPAL_CLIENT") as string;
    const clientSecret = getEnv("INTEGRATION_PAYPAL_SECRET") as string;

    const credentials = Buffer.from(
        `${clientId}:${clientSecret}`
    ).toString("base64");

    const tokenResponse = await fetch(
        "https://api-m.sandbox.paypal.com/v1/oauth2/token",
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
        throw new Error(
            `PayPal authentication failed: ${await tokenResponse.text()}`
        );
    }

    const { access_token: accessToken } = await tokenResponse.json() as {
        access_token: string;
    };

    const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
    };

    const productResponse = await fetch(
        "https://api-m.sandbox.paypal.com/v1/catalogs/products",
        {
            method: "POST",
            headers,
            body: JSON.stringify({
                name: "OpenProfile Premium",
                description: "OpenProfile Premium subscription",
                type: "SERVICE",
                category: "SOFTWARE"
            }),
        }
    );

    if (!productResponse.ok) {
        throw new Error(
            `PayPal product creation failed: ${await productResponse.text()}`
        );
    }

    const product = await productResponse.json() as {
        id: string;
    };

    const planResponse = await fetch(
        "https://api-m.sandbox.paypal.com/v1/billing/plans",
        {
            method: "POST",
            headers,
            body: JSON.stringify({
                product_id: product.id,
                name: "OpenProfile Premium",
                description: "Support the development of OpenProfile",
                billing_cycles: [
                    {
                        frequency: {
                            interval_unit: "MONTH",
                            interval_count: 1
                        },
                        tenure_type: "REGULAR",
                        sequence: 1,
                        total_cycles: 0,
                        pricing_scheme: {
                            fixed_price: {
                                value: "4.99",
                                currency_code: "USD"
                            }
                        }
                    }
                ],
                payment_preferences: {
                    auto_bill_outstanding: true,
                    setup_fee_failure_action: "CONTINUE",
                    payment_failure_threshold: 3
                },
                taxes: {
                    percentage: "6",
                    inclusive: false
                }
            })
        }
    );

    if (!planResponse.ok) {
        throw new Error(
            `PayPal plan creation failed: ${await planResponse.text()}`
        );
    }

    const plan = await planResponse.json() as {
        id: string;
        status: string;
    };

    if (plan.status !== "ACTIVE") {
        const activateResponse = await fetch(
            `https://api-m.sandbox.paypal.com/v1/billing/plans/${plan.id}/activate`,
            {
                method: "POST",
                headers,
                body: JSON.stringify({}),
            }
        );

        if (!activateResponse.ok) {
            throw new Error(
                `PayPal plan activation failed: ${await activateResponse.text()}`
            );
        }
    }

    console.log("PayPal product ID:", product.id);
    console.log("PayPal plan ID:", plan.id);

    return {
        productId: product.id,
        planId: plan.id,
    };
}
