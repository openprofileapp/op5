export function parseTags(tags: string | string[] | undefined): string[] {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === "string") {
        try {
            const parsed = JSON.parse(tags);
            if (Array.isArray(parsed)) return parsed;
        } catch {
            return tags.split(",").map((t) => t.trim()).filter(Boolean);
        }
    }
    return [];
}
