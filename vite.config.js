/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import config from "./src/config.js";

/** Injects the app title from config into index.html at build time */
function htmlTitlePlugin() {
  return {
    name: "html-title-inject",
    transformIndexHtml(html) {
      return html.replace(
        /<title>.*?<\/title>/,
        `<title>${config.app.logo} ${config.app.name} — History Explorer</title>`
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), htmlTitlePlugin()],
  assetsInclude: ["**/*.md"],
  define: {
    "global.Buffer": "globalThis.Buffer",
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setup.js",
    include: ["src/**/*.{test,spec}.{js,jsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
