import { useState, type ReactNode } from "react"
import { Link, useNavigate } from "react-router"
import { panggil } from "../../lib/panggil"
import { pesan } from "./format"
import "./klinik.css"

export function TataLetakKlinik({ dokter, children }: { dokter?: string; children: ReactNode }) {
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
      <div className="suapin-aksi">
        {dokter && <span>{dokter}</span>}
        <button type="button" disabled={sibuk} onClick={() => void keluar()}>Keluar</button>
      </div>
    </header>
    {galat && <p role="alert">{galat}</p>}
    {children}
  </main>
}
