import { Request } from "express";

import { AdvancedError } from "kage-library";
import { i18n } from "../instances.js";
import getEnv from "../../../_common/helpers/getEnv.js";

/**
 * Asserts that the request carries a valid API secret.
 *
 * @example
 * await assertApiSecret(req);
 */
export async function assertApiSecret(req: Request): Promise<void> {
    const authHeader = req.headers.authorization;

    let isAuthorized = false;

    if (authHeader?.startsWith("ApiSecret ")) {
        isAuthorized = authHeader.split(" ")[1] === getEnv("API_SECRET");
    }

    if (!isAuthorized) {
        throw new AdvancedError({
            code: 401,
            message: i18n.t("responses.unauthorized")
        })
    }
}
