import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    sourcemap: true,
    target: "es6",
    lib: {
      entry: {
        array: "./src/array.ts",
        core: "./src/index.ts",
        option: "./src/option.ts",
        parser: "./src/parser.ts",
        result: "./src/result.ts",
      },
      formats: ["cjs", "es"],
    },
  },
  plugins: [dts()],
  test: {
    setupFiles: ["test/test-setup.ts"],
  },
});
