// Pemilik: B (Satya). Kerangka dari A0.1; router lengkap dibuat di kartu B0.2.
import { createBrowserRouter, RouterProvider } from "react-router";
import { rutDev } from "./dev/rute.tsx";
import { rutKlinik } from "./halaman/klinik/rute.tsx";

const router = createBrowserRouter([
  { path: "/", element: <p className="p-4 text-ungu">Suapin: kerangka repo. Halaman dibangun mulai I0.</p> },
  { path: "/contoh-gaya", lazy: async () => ({ Component: (await import("./halaman/keluarga/contoh-gaya.tsx")).ContohGaya }) },
  ...rutKlinik,
  ...rutDev,
]);

export default function App() {
  return <RouterProvider router={router} />;
}
