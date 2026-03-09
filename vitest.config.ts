import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: [
        "src/modules/games/cognitive-engine.ts",
        "src/modules/aba/engine.ts",
        "src/modules/behavioral/engine.ts",
      ],
      thresholds: {
        "src/modules/games/cognitive-engine.ts": {
          lines: 70,
          functions: 70,
          branches: 60,
        },
        "src/modules/aba/engine.ts": {
          lines: 70,
          functions: 70,
          branches: 60,
        },
        "src/modules/behavioral/engine.ts": {
          lines: 65,
          functions: 65,
          branches: 55,
        },
      },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
