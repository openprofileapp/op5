import { Request } from "express";

import { AdvancedError } from "kage-library";
import isTokenOrSecretAuthorized from "../helpers/isTokenOrSecretAuthorized.js";
import { i18n } from "../instances.js";

/**
 * Asserts that the request carries a valid bearer token or secret.
 *
 * @example
 * await assertBearer(req);
 */
export async function assertBearer(req: Request): Promise<void> {
    if (!await isTokenOrSecretAuthorized(req)) {
        throw new AdvancedError({
            code: 401,
            message: i18n.t("responses.unauthorized")
        })
    }
}
