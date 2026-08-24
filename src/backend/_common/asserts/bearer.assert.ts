import { Request } from "express";

import { AdvancedError } from "kage-library";
import isTokenOrSecretAuthorized from "../helpers/isTokenOrSecretAuthorized.js";

export async function assertBearer(req: Request): Promise<void> {
    if (!await isTokenOrSecretAuthorized(req)) {
        throw new AdvancedError({
            code: 401,
            message: "Unauthorized"
        })
    }
}
