import { AdvancedError } from "kage-library";
import { ValidSessionType } from "../../../_common/types/validSession.type.js";
import { i18n } from "../instances.js";

/**
 * Asserts that the current session must be logged in to proceed
 * 
 * @example
 * assertAccount(req.session);
 */
type AuthenticatedSession<T> = T & { userId: string };

export function assertAccount<T extends ValidSessionType>(
    session: T
): asserts session is AuthenticatedSession<T> {
    if (!session?.userId || typeof session.userId !== "string") {
        throw new AdvancedError({
            code: 403,
            message: i18n.t("responses.noAccount")
        });
    }
}
