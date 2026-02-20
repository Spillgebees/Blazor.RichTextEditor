import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    build: {
      lib: {
        entry: resolve(import.meta.dirname!, "src/index.ts"),
        formats: ["es"],
        fileName: () => "Spillgebees.Blazor.RichTextEditor.lib.module.js",
      },
      outDir: resolve(import.meta.dirname!, "../Spillgebees.Blazor.RichTextEditor/wwwroot"),
      emptyOutDir: true,
      sourcemap: !isProduction,
      minify: isProduction,
      target: "es2022",
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.names?.some((name) => name.endsWith(".css"))) {
              return "Spillgebees.Blazor.RichTextEditor.lib.module.css";
            }
            return "[name][extname]";
          },
        },
      },
    },
  };
});
