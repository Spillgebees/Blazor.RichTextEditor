import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
    css: false,
    coverage: {
      provider: "v8",
    },
  },
});
