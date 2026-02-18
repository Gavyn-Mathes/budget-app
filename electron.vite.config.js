// electron.vite.config.js
import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { builtinModules } from "node:module";

export default defineConfig({
  main: {
    entry: "src/main/main.ts",
  },

  preload: {
    input: "src/preload/index.ts",
    vite: {
      ssr: {
        noExternal: ["zod"],
      },
      build: {
        rollupOptions: {
          output: {
            format: "cjs",
            inlineDynamicImports: true,
          },
          external: [
            "electron",
            ...builtinModules,
            ...builtinModules.map((m) => `node:${m}`),
          ],
        },
      },
    },
  },

  renderer: {
    plugins: [react()],
    base: "./",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src/renderer/src"),
      },
    },
  },
});
