import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // PWA (B4.1, diisi B). API tidak di-cache; model + WASM MediaPipe ikut precache supaya sesi jalan offline.
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Suapin",
        short_name: "Suapin",
        description: "Teman makan untuk balita yang sulit makan.",
        lang: "id",
        display: "standalone",
        start_url: "/",
        background_color: "#FAF6EE",
        theme_color: "#4B2E5A",
        icons: [
          { src: "/ikon/ikon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/ikon/ikon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/ikon/ikon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,webp,svg,png,mp3,task,wasm,json}"],
        // K19: file WASM MediaPipe ±14,6 MB; di bawah batas ini build PWA gagal.
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [],
      },
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
