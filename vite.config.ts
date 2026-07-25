import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 5000,
    host: true,
    allowedHosts: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "wouter"],
          "ui-vendor": ["@radix-ui/react-dialog", "@radix-ui/react-select", "@radix-ui/react-tooltip"],
          "chart-vendor": ["recharts"],
          "db-vendor": ["@supabase/supabase-js"],
        },
      },
    },
  },
});
