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
        return config.isProduction 
            ? process.env["INTEGRATION_DISCORD_PUBLIC_KEY"]
            : process.env["INTEGRATION_DISCORD_DEV_PUBLIC_KEY"]
    }

    if (key === "INTEGRATION_DISCORD_CLIENT_ID") {
        return config.isProduction 
            ? process.env["INTEGRATION_DISCORD_CLIENT_ID"]
            : process.env["INTEGRATION_DISCORD_DEV_CLIENT_ID"]
    }

    if (key === "INTEGRATION_DISCORD_CLIENT_SECRET") {
        return config.isProduction 
            ? process.env["INTEGRATION_DISCORD_CLIENT_SECRET"]
            : process.env["INTEGRATION_DISCORD_DEV_CLIENT_SECRET"]
    }

    if (key === "INTEGRATION_DISCORD_BOT_TOKEN") {
        return config.isProduction 
            ? process.env["INTEGRATION_DISCORD_BOT_TOKEN"]
            : process.env["INTEGRATION_DISCORD_DEV_BOT_TOKEN"]
    }
    
    assertNotNull(key);

    return value;
}
