export function formatCountOnly<T>(data: T, countOnly: boolean): T {
    if (!countOnly || !data || typeof data !== "object") {
        return data;
    }

    if ("items" in data && typeof (data as Record<string, unknown>).count === "number") {
        delete (data as Record<string, unknown>).items;
    }

    for (const value of Object.values(data)) {
        formatCountOnly(value, countOnly);
    }

    return data;
}
