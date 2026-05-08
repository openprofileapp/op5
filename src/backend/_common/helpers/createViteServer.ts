import { createServer, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

interface ViteOptions {
    isProduction: boolean;
    host: string;
    port: number;
    ssl: object;
    root: string;
}

export default async function createViteServer(
    { isProduction, host, port, ssl, root }: ViteOptions
): Promise<ViteDevServer | null> {
    if (isProduction) return null;

    const server = await createServer({
        plugins: [
            react(), 
            tailwindcss()
        ],
        root,
        server: {
            fs: {
                allow: [""]
            },
            middlewareMode: true,
            allowedHosts: [host],
            https: ssl,
            hmr: {
                port
            }
        },
        logLevel: "error",
        appType: "custom"
    });

    return server;
}