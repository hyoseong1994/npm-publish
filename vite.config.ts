/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { codecovVitePlugin } from "@codecov/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "test-bundle-esm",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
  test: {
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    coverage: {
      exclude: ["styled-system/**"],
      thresholds: {
        statements: 5,
        branches: 30,
        functions: 30,
        lines: 5,
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
