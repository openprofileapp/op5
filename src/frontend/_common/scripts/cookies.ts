import { URL } from "kage-library/client";

export const cookie = {
    set(name: string, value: string, maxAge = 2147483647): void {
        const parts = [
            `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
            "Path=/",
            `Max-Age=${maxAge}`,
            "SameSite=Lax",
        ];

        const url = new URL(`https://${window.config.domains.main}`);

        parts.push(`Domain=${url.domain}`);

        if (window.location.protocol === "https:") {
            parts.push("Secure");
        }

        document.cookie = parts.join("; ");
    },

    get(name: string): string | null {
        const prefix = `${encodeURIComponent(name)}=`;

        const item = document.cookie
            .split("; ")
            .find(entry => entry.startsWith(prefix));

        return item
            ? decodeURIComponent(item.slice(prefix.length))
            : null;
    },

    has(name: string): boolean {
        return this.get(name) !== null;
    },

    remove(name: string): void {
        this.set(name, "", 0);
    },
};
