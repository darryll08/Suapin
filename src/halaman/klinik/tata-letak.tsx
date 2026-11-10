import { useState } from "react"
import { Link, Outlet, useNavigate } from "react-router"
import { panggil } from "../../lib/panggil"
import "./klinik.css"

export const usia = (bulan: number) => Math.floor(bulan / 12) + " th " + bulan % 12 + " bln"
export const pesan = (galat: unknown) => galat instanceof Error ? galat.message : "Terjadi kesalahan. Coba lagi."

export function TataLetakKlinik() {
  const navigate = useNavigate()
  const [sibuk, setSibuk] = useState(false)
  const [galat, setGalat] = useState("")
  async function keluar() {
    setSibuk(true)
    try {
      await panggil("dokterKeluar")
      void navigate("/klinik/masuk", { replace: true })
    } catch (error) { setGalat(pesan(error)) }
    finally { setSibuk(false) }
  }
  return <main className="suapin-klinik">
    <header className="suapin-baris">
      <Link to="/klinik/pasien" className="suapin-merek">Suapin klinik</Link>
      <button type="button" disabled={sibuk} onClick={() => void keluar()}>Keluar</button>
    </header>
    {galat && <p role="alert">{galat}</p>}
    <Outlet />
  </main>
}
