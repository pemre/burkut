/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { PluginOption } from "vite";
import config from "./src/config.ts";
import mdContent from "./vite-plugins/md-content.ts";

/** Injects the app title from config into index.html at build time */
function htmlTitlePlugin(): PluginOption {
  return {
    name: "html-title-inject",
    transformIndexHtml(html: string) {
      return html.replace(
        /<title>.*?<\/title>/,
        `<title>${config.app.logo} ${config.app.name} — History Explorer</title>`,
      );
    },
  };
}

export default defineConfig({
  base: process.env.GITHUB_PAGES ? "/burkut/" : "/",
  plugins: [react(), htmlTitlePlugin(), mdContent()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setup.ts",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});

