import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Manifest dan sisa konfigurasi PWA diisi B di kartu B4.1.
    VitePWA({
      registerType: "autoUpdate",
      // K19: file WASM MediaPipe ±14,6 MB; di bawah batas ini build PWA gagal.
      workbox: { maximumFileSizeToCacheInBytes: 15 * 1024 * 1024 },
    }),
  ],
  resolve: {
    alias: { "@bersama": fileURLToPath(new URL("./bersama", import.meta.url)) },
  },
  server: {
    proxy: { "/api": "http://127.0.0.1:8787" },
  },
  test: {
    include: ["uji/**/*.test.ts"],
  },
});
