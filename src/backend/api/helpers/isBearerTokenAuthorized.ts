import { WebClient } from "kage-library";

import { config } from "../../../../app.config.js";
import getEnv from "../../../_common/helpers/getEnv.js";

/**
 * Validates a Bearer token from an Authorization header against the API secret or user and bot tokens.
 *
 * @param authHeader The Authorization header value (e.g. "Bearer abc123").
 * @returns `true` if the header contains a valid Bearer token; otherwise `false`.
 */
export default async function isBearerTokenAuthorized(authHeader?: string): Promise<boolean> {
    if (
        !authHeader?.startsWith("ApiSecret ") &&
        !authHeader?.startsWith("Bearer ")
    ) {
        return false;
    }

    const token = authHeader.split(" ")[1];

    if (authHeader?.startsWith("ApiSecret ")) {
        return token === getEnv("API_SECRET");
    };

    if (authHeader?.startsWith("Bearer ")) {
        const wc = new WebClient({
            crawler: config.crawler,
            useSecureSSL: config.isProduction
        });

        // API call returns true or false
        return await wc.callAPI(
            `https://${config.domains.auth}/tokens/access`,
            { 
                auth: `ApiSecret ${getEnv("API_SECRET")}`,
                body: { token }
            }
        );
    };

    return false;
}