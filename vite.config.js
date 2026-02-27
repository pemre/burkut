/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.md"],
  define: {
    "global.Buffer": ["buffer", "Buffer"],
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
