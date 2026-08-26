import { AdvancedError, QueryResult } from "kage-library";
import { i18n } from "../../backend/_common/instances.js";
import { assertNotNull } from "./notNull.assert.js";

/**
 * Asserts that a database fetch is successful.
 *
 * @example
 * assertDbSuccess(result);
 * assertDbSuccess([characterResult, userResult]);
 */
type SuccessfulQueryResult<T extends object = Record<string, unknown>> = Extract<QueryResult<T>, { success: true }>;

export function assertDbSuccess<T extends object>(
    results: QueryResult<T> | QueryResult<T>[]
): asserts results is (QueryResult<T> extends unknown ? SuccessfulQueryResult<T> : never) {
    const list = Array.isArray(results) ? results : [results];
    
    list.forEach((item) => {
        assertNotNull(item);

        if (!item.success) {
            throw new AdvancedError({
                code: 500,
                message: i18n.t("responses.database"),
                details: item.error
            });
        }
    });
}
