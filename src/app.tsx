// Pemilik: B (Satya). Router (B0.2): rute keluarga jobdesk 2.7 + rute klinik (C) dan dev (A) dari file pemiliknya.
// Rute klinik/dev baru cukup ditambah di file masing-masing, tanpa mengubah file ini.
import { createBrowserRouter, RouterProvider } from "react-router";
import { rutDev } from "./dev/rute.tsx";
import { rutKlinik } from "./halaman/klinik/rute.tsx";
import { ButuhKeluarga } from "./halaman/keluarga/tata-letak.tsx";


const router = createBrowserRouter([
  { path: "/", lazy: async () => ({ Component: (await import("./halaman/keluarga/landing.tsx")).Landing }) },
  { path: "/mulai", lazy: async () => ({ Component: (await import("./halaman/keluarga/mulai.tsx")).Mulai }) },
  { path: "/masuk", lazy: async () => ({ Component: (await import("./halaman/keluarga/masuk.tsx")).Masuk }) },
  { path: "/contoh-gaya", lazy: async () => ({ Component: (await import("./halaman/keluarga/contoh-gaya.tsx")).ContohGaya }) },
  {
    element: <ButuhKeluarga />,
    children: [
      { path: "/mulai/skrining", lazy: async () => ({ Component: (await import("./halaman/keluarga/skrining.tsx")).Skrining }) },
      { path: "/beranda", lazy: async () => ({ Component: (await import("./halaman/keluarga/beranda.tsx")).Beranda }) },
      { path: "/sesi", lazy: async () => ({ Component: (await import("./halaman/keluarga/sesi/halaman-sesi.tsx")).HalamanSesiMakan }) },
      { path: "/sesi/catatan", lazy: async () => ({ Component: (await import("./halaman/keluarga/sesi/catatan.tsx")).Catatan }) },
      { path: "/laporan", lazy: async () => ({ Component: (await import("./halaman/keluarga/laporan.tsx")).Laporan }) },
      { path: "/langganan", lazy: async () => ({ Component: (await import("./halaman/keluarga/langganan.tsx")).Langganan }) },
    ],
  },
  ...rutKlinik,
  ...rutDev,
  { path: "*", lazy: async () => ({ Component: (await import("./halaman/keluarga/landing.tsx")).TidakAda }) },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
