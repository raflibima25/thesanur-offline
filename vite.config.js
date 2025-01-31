import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@radix-ui/react-select": path.resolve(__dirname, "node_modules/@radix-ui/react-select"),
        },
    },
});
