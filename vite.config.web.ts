import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
    plugins: [
        react(),
        tailwindcss()
    ],

    root: "src/frontend",

    build: {
        outDir: "../../dist/src/frontend",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: "src/frontend/main.html",
                support: "src/frontend/support.html"
            },
            output: {
                entryFileNames: "assets/[hash].js",
                chunkFileNames: "assets/[hash].js",
                assetFileNames: "assets/[hash][extname]"
            }
        }
    }
});