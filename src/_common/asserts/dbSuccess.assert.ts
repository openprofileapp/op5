import { AdvancedError, QueryResult } from "kage-library";
import { i18n } from "../../backend/_common/instances.js";
import { assertNotNull } from "./notNull.assert.js";

/**
 * Asserts that a database fetch is successful.
 *
 * @example
 * assertDbSuccess(result);
 */
type SuccessfulQueryResult<T extends object> = Extract<QueryResult<T>, { success: true }>;

export function assertDbSuccess<T extends object>(
    result: QueryResult<T>
): asserts result is SuccessfulQueryResult<T> {
    assertNotNull(result);

    if (!result.success) {
        throw new AdvancedError({
            code: 500,
            message: i18n.t("responses.database"),
            details: result.error
        });
    }
}
