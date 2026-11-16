import { AdvancedError } from "kage-library";

import { automod } from "../instances.js";

/**
 * Asserts that the incoming text doesn't break automod filters.
 *
 * @example
 * await assertAutomodFilters("text");
 */
export function assertAutomodFilters(
    text: string,
    author: string,
    location: string
) {
    const response = automod.test(text, 
        { author, location }
    )

    if (response.blocked) {
        throw new AdvancedError({
            code: 512, // 1100
            message: `Alice blocked the following: "${response.matches[0].match.raw}"`,
            details: response
        })
    }
}
