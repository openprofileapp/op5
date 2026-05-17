/**
 * Validates a slug based on type rules.
 *
 * @param slug - The string to validate
 * @param type - Optional type modifier ("profile" or default)
 * @returns true if valid, false otherwise
 */
export default function validateSlug(slug: string, type?: string): boolean {
    if (!slug) return false;

    const regex = /^[a-z0-9_.-]+$/;

    if (type === "profile") {
        return (
            slug.length >= 1 &&
            slug.length <= 24 &&
            regex.test(slug)
        );
    } else {
        return (
            slug.length >= 3 &&
            slug.length <= 24 &&
            regex.test(slug)
        );
    }
}