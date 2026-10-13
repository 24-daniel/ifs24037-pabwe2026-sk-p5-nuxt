import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import process from "process";

// Konfigurasi Vitest (jsdom + coverage v8, threshold 100%).
// Juga dipakai skrip `dev:vite` / `build:vite` (entry: index.html -> src/main.ts).
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.APP_PORT || env.PORT) || 3000;

  return {
    plugins: [vue(), tailwindcss()],
    server: { port },
    preview: { port },
    define: {
      DELCOM_BASEURL: JSON.stringify(
        env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1",
      ),
    },
    test: {
      globals: true,
      environment: "jsdom",
      css: false,
      setupFiles: "./src/setupTests.ts",
      include: ["src/**/*.test.ts"],
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: ["src/**/*.{js,ts,vue}"],
        exclude: [
          "src/main.ts",
          "src/router.options.ts",
          "src/setupTests.ts",
          "src/test-utils.ts",
          "src/**/*.d.ts",
          "**/*.test.{js,ts,jsx,tsx}",
          "node_modules/**",
          ".docs/**",
        ],
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  };
});
