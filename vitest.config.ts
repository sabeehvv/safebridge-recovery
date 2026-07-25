import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url))
    }
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: [
        "app/api/analyse-situation/route.ts",
        "lib/local-storage.ts",
        "lib/safety-engine.ts"
      ],
      thresholds: {
        statements: 98,
        branches: 98,
        functions: 98,
        lines: 98
      }
    }
  }
});
