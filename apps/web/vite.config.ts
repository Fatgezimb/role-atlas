import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "./" : "/",
  build:
    process.env.GITHUB_PAGES === "true"
      ? {
          outDir: "../../docs",
          emptyOutDir: false
        }
      : undefined,
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    globals: true,
    css: true
  }
});
