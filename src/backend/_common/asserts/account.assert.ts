import { AdvancedError } from "kage-library";
import { ValidSessionType } from "../../../_common/types/validSession.type.js";
import { i18n } from "../instances.js";

/**
 * Asserts that the current session must be logged in to proceed
 * 
 * @example
 * assertAccount(req.session);
 */
export function assertAccount(session: ValidSessionType): void {
    if (!session?.userId) {
        throw new AdvancedError({
            code: 403,
            message: i18n.t("responses.noAccount")
        })
    }
}
