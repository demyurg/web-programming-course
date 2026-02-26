import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["**/*.unit.test.ts", "**/*.feature.test.ts"],
    passWithNoTests: true,
    fileParallelism: false,
    setupFiles: ["tests/setup/test-db.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
    },
  },
});
