import { Request } from 'express';

import { config } from "../../../../app.config.js";
import getEnv from "../../../_common/helpers/getEnv.js";
import { wc } from '../instances.js';

/**
 * Validates a token or secret from an Authorization header or cookie against the API secret or user and bot tokens.
 *
 * @param req The express request object.
 * @returns `true` if the header or cookie contains a valid token or secret; otherwise `false`.
 */
export default async function isTokenOrSecretAuthorized(req: Request): Promise<boolean> {
    let token: string | undefined;

    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("ApiSecret ")) {
        return authHeader.split(" ")[1] === getEnv("API_SECRET");
    }

    if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    } else {
        token = req.cookies?.accessToken;
    }

    if (!token) {
        return false;
    }

    // API call returns true or false
    // DEVELOPER NEEDED: This is invalid and doesn't exist. Fix it with a db check on that API
    return await wc.callAPI(
        `https://${config.domains.auth}/tokens/access`,
        {
            method: "POST",
            auth: `ApiSecret ${getEnv("API_SECRET")}`,
            body: { token },
        }
    );
}
