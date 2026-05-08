import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        react(), 
        tailwindcss()
    ],

    root: "src-tauri/src/frontend",

    build: {
        outDir: "../../../dist/src-tauri/src/frontend",
        emptyOutDir: true,
        rollupOptions: {
            output: {
                entryFileNames: "assets/[hash].js",
                chunkFileNames: "assets/[hash].js",
                assetFileNames: "assets/[hash][extname]"
            }
        }
    },

    server: {
        port: 10520,
        strictPort: true
    }
});