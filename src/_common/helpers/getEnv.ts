import dotenv from "dotenv";
import path from "path";
import fs from "fs";

import { config } from "../../../app.config.js";
import { assertNotNull } from "../asserts/notNull.assert.js";

dotenv.config();

/**
 * Get the value of an environment variable
 */
export default function getEnv(key: string) {
    const value = process.env[key];

    if (key === "SSL") {
        return {
            cert: fs.readFileSync(
                path.join(config.folders.root, value as string, ".crt")
            ),
            key: fs.readFileSync(
                path.join(config.folders.root, value as string, ".key")
            )
        }
    }

    if (key === "INTEGRATION_DISCORD_PUBLIC_KEY") {
        return !config.isNightly 
            ? process.env["INTEGRATION_DISCORD_PUBLIC_KEY"]
            : process.env["INTEGRATION_DISCORD_NIGHTLY_PUBLIC_KEY"]
    }

    if (key === "INTEGRATION_DISCORD_CLIENT_ID") {
        return !config.isNightly 
            ? process.env["INTEGRATION_DISCORD_CLIENT_ID"]
            : process.env["INTEGRATION_DISCORD_NIGHTLY_CLIENT_ID"]
    }

    if (key === "INTEGRATION_DISCORD_CLIENT_SECRET") {
        return !config.isNightly 
            ? process.env["INTEGRATION_DISCORD_CLIENT_SECRET"]
            : process.env["INTEGRATION_DISCORD_NIGHTLY_CLIENT_SECRET"]
    }

    if (key === "INTEGRATION_DISCORD_BOT_TOKEN") {
        return !config.isNightly 
            ? process.env["INTEGRATION_DISCORD_BOT_TOKEN"]
            : process.env["INTEGRATION_DISCORD_NIGHTLY_BOT_TOKEN"]
    }

    if (key === "INTEGRATION_PAYPAL_CLIENT") {
        return config.isProduction 
            ? process.env["INTEGRATION_PAYPAL_CLIENT"]
            : process.env["INTEGRATION_PAYPAL_SANDBOX_CLIENT"]
    }

    if (key === "INTEGRATION_PAYPAL_SECRET") {
        return config.isProduction 
            ? process.env["INTEGRATION_PAYPAL_SECRET"]
            : process.env["INTEGRATION_PAYPAL_SANDBOX_SECRET"]
    }

    if (key === "INTEGRATION_PAYPAL_WEBHOOK_ID") {
        if (config.isNightly) {
            return config.isProduction
                ? process.env["INTEGRATION_PAYPAL_NIGHTLY_WEBHOOK_ID"]
                : process.env["INTEGRATION_PAYPAL_NIGHTLY_SANDBOX_WEBHOOK_ID"];
        }

        return config.isProduction
            ? process.env["INTEGRATION_PAYPAL_WEBHOOK_ID"]
            : process.env["INTEGRATION_PAYPAL_SANDBOX_WEBHOOK_ID"];
    }

    if (key === "INTEGRATION_PAYPAL_PLAN_ID") {
        return config.isProduction 
            ? process.env["INTEGRATION_PAYPAL_PLAN_ID"]
            : process.env["INTEGRATION_PAYPAL_SANDBOX_PLAN_ID"]
    }
    
    assertNotNull(key);

    return value;
}
