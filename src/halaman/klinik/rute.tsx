import { Navigate, useParams, type RouteObject } from "react-router"
import { LaporanBagikan } from "../r/laporan"
import { DaftarPasien } from "./daftar-pasien"
import { OverviewKlinik } from "./overview"
import { Pasien } from "./pasien"

// Alamat lama dokter (/klinik/pasien/...) dialihkan ke /dokter supaya link lama tetap jalan.
function AlihPasien() {
  const { id = "" } = useParams()
  return <Navigate to={"/dokter/pasien/" + id} replace />
}

export const rutKlinik: RouteObject[] = [
  { path: "/klinik/masuk", element: <Navigate to="/masuk" replace /> },
  { path: "/klinik", element: <OverviewKlinik /> },
  { path: "/klinik/pasien", element: <Navigate to="/dokter" replace /> },
  { path: "/klinik/pasien/:id", element: <AlihPasien /> },
  { path: "/dokter", element: <DaftarPasien /> },
  { path: "/dokter/pasien/:id", element: <Pasien /> },
  { path: "/r/:token", element: <LaporanBagikan /> },
]
