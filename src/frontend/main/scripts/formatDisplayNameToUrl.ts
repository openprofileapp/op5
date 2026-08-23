export function formatDisplayNameToUrl(displayName: string): string {
    return displayName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9._]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
