/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    coverage: {
      exclude: ["styled-system/**"],
      thresholds: {
        statements: 30,
        branches: 50,
        functions: 30,
        lines: 30,
      },
      reporter: ["lcov"],
    },
  },
  build: {
    lib: {
      entry: "./src/index.ts",
      name: "UiPublishTest",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
    },
  },
});
