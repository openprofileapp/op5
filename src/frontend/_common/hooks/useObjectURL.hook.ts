import { useEffect, useMemo } from "react";

export function useObjectURL(file: File | null | undefined) {
    const url = useMemo(() => {
        if (!file) return "";
        return URL.createObjectURL(file);
    }, [file]);

    useEffect(() => {
        if (!url) return;
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [url]);

    return url;
}
