import { useState, type FormEvent } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { GalatApi, panggil } from "../../lib/panggil"
import { pesan } from "./tata-letak"

export function MasukKlinik() {
  const [param] = useSearchParams()
  const navigate = useNavigate()
  const [sibuk, setSibuk] = useState(false)
  const [galat, setGalat] = useState("")
  const [terlihat, setTerlihat] = useState(false)
  async function masuk(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setSibuk(true)
    setGalat("")
    try {
      await panggil("dokterMasuk", { body: { email: String(data.get("email")), kata_sandi: String(data.get("sandi")) } })
      const kembali = param.get("kembali") ?? ""
      void navigate(/^\/r\/[A-Za-z0-9_-]{43}$/.test(kembali) ? kembali : "/klinik/pasien", { replace: true })
    } catch (error) {
      setGalat(error instanceof GalatApi && error.status === 401 ? "Email atau kata sandi salah." : pesan(error))
    } finally { setSibuk(false) }
  }
  return <main className="suapin-klinik suapin-masuk">
    <section className="suapin-kartu">
      <p className="suapin-merek">Suapin</p>
      <h1>Masuk untuk klinik</h1>
      <form onSubmit={(e) => void masuk(e)}>
        <label>Email<input name="email" type="email" autoComplete="username" required /></label>
        <label>Kata sandi<input name="sandi" type={terlihat ? "text" : "password"} autoComplete="current-password" required /></label>
        <button type="button" onClick={() => setTerlihat(!terlihat)}>{terlihat ? "Sembunyikan" : "Tampilkan"} kata sandi</button>
        {galat && <p role="alert">{galat}</p>}
        <button className="suapin-utama" disabled={sibuk}>{sibuk ? "Memeriksa…" : "Masuk"}</button>
      </form>
      <p><small>Akun demo lomba.</small></p>
    </section>
  </main>
}
