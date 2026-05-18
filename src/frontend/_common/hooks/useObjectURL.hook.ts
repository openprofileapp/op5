import { useEffect, useState } from "react";

export function useObjectURL(file: File | null) {
    const [url, setUrl] = useState<string>("");

    useEffect(() => {
        if (!file) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUrl("");
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    return url;
}