import path from "node:path";
import { defineConfig } from "vitest/config";

const TEST_DB_URL =
  "postgresql://agentstore:agentstore@localhost:5432/agentstore_test";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globalSetup: "tests/global-setup.ts",
    // Money-path tests share one Postgres database.
    fileParallelism: false,
    testTimeout: 30_000,
    env: {
      DATABASE_URL: TEST_DB_URL,
      DIRECT_URL: TEST_DB_URL,
    },
  },
});
