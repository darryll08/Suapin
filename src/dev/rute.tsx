// Pemilik: A (Darryl). Rute /dev/kamera, /dev/sinyal, /dev/sesi, /dev/ambang ditambah di sini.
// Dimuat lazy supaya MediaPipe tidak ikut bundle halaman keluarga.
import type { RouteObject } from "react-router";

export const rutDev: RouteObject[] = [
  { path: "/dev/ambang", lazy: async () => ({ Component: (await import("./halaman-ambang.tsx")).HalamanAmbang }) },
  { path: "/dev/kamera", lazy: async () => ({ Component: (await import("./halaman-kamera.tsx")).HalamanKamera }) },
  { path: "/dev/sesi", lazy: async () => ({ Component: (await import("./halaman-sesi.tsx")).HalamanSesi }) },
  { path: "/dev/sinyal", lazy: async () => ({ Component: (await import("./halaman-sinyal.tsx")).HalamanSinyal }) },
];
