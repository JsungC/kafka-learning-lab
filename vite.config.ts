import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@astryxdesign/theme-stone/fonts.css": new URL(
        "./src/styles/astryx-system-font.css",
        import.meta.url,
      ).pathname,
      "@astryxdesign/theme-neutral/fonts.css": new URL(
        "./src/styles/astryx-system-font.css",
        import.meta.url,
      ).pathname,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/@astryxdesign/core/dist/Selector/"))
            return "astryx-selector";
        },
      },
    },
  },
  base: "/kafka-learning-lab/",
});
