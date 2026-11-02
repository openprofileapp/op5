export const pluralize = (value: string): string => {
    const trimmed = value.trim();

    if (!trimmed) return value;

    if (/(s|x|z|ch|sh)$/i.test(trimmed)) {
        if (/ss$/i.test(trimmed)) {
            return `${trimmed}es`;
        }

        return trimmed.endsWith("s")
            ? trimmed
            : `${trimmed}es`;
    }

    if (/[^aeiou]y$/i.test(trimmed)) {
        return `${trimmed.slice(0, -1)}ies`;
    }

    if (/(?:f|fe)$/i.test(trimmed)) {
        if (/(?:roof|chief|belief|chef)$/i.test(trimmed)) {
            return `${trimmed}s`;
        }

        return trimmed.replace(/fe?$/i, "ves");
    }

    return `${trimmed}s`;
};
