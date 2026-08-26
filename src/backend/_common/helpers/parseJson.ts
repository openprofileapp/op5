export const parseJson = (value: unknown) => {
    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }
    
    return value;
};
