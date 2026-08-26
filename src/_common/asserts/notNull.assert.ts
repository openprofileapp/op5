import { AdvancedError } from "kage-library";
import { i18n } from "../../backend/_common/instances.js";

/**
 * Asserts that a value or array of values is not null or undefined.
 *
 * @example
 * assertNotNull(id);
 * assertNotNull([id, name]);
 */
export function assertNotNull(targets: unknown | unknown[]): void {
    if (targets === null || targets === undefined) {
        throw new AdvancedError({
            code: 400,
            message: i18n.t("responses.malformedRequest")
        });
    }

    if (Array.isArray(targets)) {
        targets.forEach((item, index) => {
            if (item === null || item === undefined) {
                throw new AdvancedError({
                    code: 400,
                    message: i18n.t("responses.malformedRequest"),
                    details: index
                });
            }
        });
    }
}
