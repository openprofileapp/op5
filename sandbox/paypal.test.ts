import getEnv from "../src/_common/helpers/getEnv.js";

const SUBSCRIPTION_ID = "I-TAW6X1DAX3SL";

const GIFT_MESSAGE =
  "You've received a gift from AvatarKage! Your subscription will automatically continue in 30 days.";

const PAYPAL_BASE_URL =
  getEnv("PAYPAL_ENV") === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

interface PayPalSubscription {
  id: string;
  status: string;
}

async function getAccessToken(): Promise<string> {
  const clientId = getEnv("INTEGRATION_PAYPAL_CLIENT");
  const clientSecret = getEnv("INTEGRATION_PAYPAL_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing INTEGRATION_PAYPAL_CLIENT or INTEGRATION_PAYPAL_SECRET."
    );
  }

  const credentials = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(
      `PayPal authentication failed: ${response.status} ${await response.text()}`
    );
  }

  const data = (await response.json()) as { access_token: string };

  return data.access_token;
}

async function getSubscription(
  accessToken: string
): Promise<PayPalSubscription> {
  const response = await fetch(
    `${PAYPAL_BASE_URL}/v1/billing/subscriptions/${SUBSCRIPTION_ID}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to retrieve subscription: ${response.status} ${await response.text()}`
    );
  }

  return (await response.json()) as PayPalSubscription;
}

async function suspendSubscription(): Promise<void> {
  console.log("Authenticating with PayPal...");

  const accessToken = await getAccessToken();

  console.log("Authentication successful.");
  console.log("Checking subscription status...");

  const subscription = await getSubscription(accessToken);

  console.log("Subscription ID:", subscription.id);
  console.log("Current status:", subscription.status);

  if (subscription.status === "SUSPENDED") {
    console.log("Subscription is already suspended. No changes made.");
    return;
  }

  if (subscription.status !== "ACTIVE") {
    throw new Error(
      `Cannot suspend subscription with status ${subscription.status}.`
    );
  }

  console.log("Suspending subscription...");

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v1/billing/subscriptions/${SUBSCRIPTION_ID}/suspend`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: `${GIFT_MESSAGE}`,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `PayPal suspension failed: ${response.status} ${await response.text()}`
    );
  }

  console.log("Suspension request accepted by PayPal.");

  const updatedSubscription = await getSubscription(accessToken);

  console.log("Updated subscription status:", updatedSubscription.status);

  if (updatedSubscription.status !== "SUSPENDED") {
    throw new Error(
      `Suspension could not be confirmed. Current status: ${updatedSubscription.status}`
    );
  }

  console.log("Subscription successfully suspended.");
  console.log("No timer was started. Reactivate manually after 30 days.");
}

suspendSubscription().catch((error: unknown) => {
  console.error("Failed to suspend PayPal subscription:", error);
  process.exitCode = 1;
});
