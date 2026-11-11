import { Navigate, type RouteObject } from "react-router"
import { LaporanBagikan } from "../r/laporan"
import { DaftarPasien } from "./daftar-pasien"
import { MasukKlinik } from "./masuk"
import { Pasien } from "./pasien"

export const rutKlinik: RouteObject[] = [
  { path: "/klinik/masuk", element: <MasukKlinik /> },
  { path: "/klinik", children: [
    { index: true, element: <Navigate to="/klinik/pasien" replace /> },
    { path: "pasien", element: <DaftarPasien /> },
    { path: "pasien/:id", element: <Pasien /> },
  ] },
  { path: "/r/:token", element: <LaporanBagikan /> },
]
