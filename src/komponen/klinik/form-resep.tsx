import { useState, type FormEvent, type KeyboardEvent } from "react"
import type { Keluaran } from "../../../bersama/kontrak/api"
import { AturanSchema, type Aturan } from "../../../bersama/kontrak/aturan"
import { panggil } from "../../lib/panggil"
import { pesan } from "../../halaman/klinik/tata-letak"

type Hasil = Keluaran<"aturanParse">
const kolom = [
  { id: "max_minutes", label: "Lama makan maksimal", satuan: "menit", min: 10, max: 30 },
  { id: "end_after_refusal_minutes", label: "Akhiri setelah menolak terus", satuan: "menit", min: 5, max: 15 },
  { id: "stage", label: "Tahap", satuan: "", min: 1, max: 4 },
  { id: "advance_rule.sessions", label: "Naik tahap setelah", satuan: "sesi berturut-turut", min: 1, max: 7 },
  { id: "advance_rule.min_accepted_bites", label: "Dengan minimal", satuan: "suapan diterima per sesi", min: 1, max: 15 },
  { id: "ngemut_hint", label: "Saran saat ngemut", satuan: "Maks. 100 karakter", min: 0, max: 100 },
] as const
type Id = (typeof kolom)[number]["id"]

function datar(aturan: Hasil["aturan"]): Record<Id, string> {
  return {
    max_minutes: String(aturan.max_minutes ?? ""),
    end_after_refusal_minutes: String(aturan.end_after_refusal_minutes ?? ""),
    stage: String(aturan.stage ?? ""),
    "advance_rule.sessions": String(aturan.advance_rule?.sessions ?? ""),
    "advance_rule.min_accepted_bites": String(aturan.advance_rule?.min_accepted_bites ?? ""),
    ngemut_hint: aturan.ngemut_hint ?? "",
  }
}

export function FormResep({ id, aktif, selesai }: { id: string; aktif: Aturan; selesai: () => void }) {
  const [teks, setTeks] = useState("")
  const [nilai, setNilai] = useState<Record<Id, string> | null>(null)
  const [hasil, setHasil] = useState<Hasil | null>(null)
  const [sibuk, setSibuk] = useState(false)
  const [galat, setGalat] = useState("")
  const sekarang = datar(aktif)
  const valid = nilai && AturanSchema.safeParse({
    max_minutes: Number(nilai.max_minutes), end_after_refusal_minutes: Number(nilai.end_after_refusal_minutes),
    stage: Number(nilai.stage), advance_rule: {
      sessions: Number(nilai["advance_rule.sessions"]), min_accepted_bites: Number(nilai["advance_rule.min_accepted_bites"]),
    }, ngemut_hint: nilai.ngemut_hint,
  })
  const belumDiisi = hasil?.kolom_bermasalah.length ?? 0
  async function ubah() {
    if (!teks.trim() || sibuk) return
    setSibuk(true)
    setGalat("")
    try {
      const balasan = await panggil("aturanParse", { body: { teks } })
      setHasil(balasan)
      setNilai(datar(balasan.aturan))
    } catch (error) {
      setGalat(pesan(error))
      setHasil(null)
      setNilai(sekarang)
    } finally { setSibuk(false) }
  }
  function pintasan(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      void ubah()
    }
  }
  async function konfirmasi(e: FormEvent) {
    e.preventDefault()
    if (!valid || !valid.success || sibuk || belumDiisi) return
    setSibuk(true)
    setGalat("")
    try {
      await panggil("aturanKonfirmasi", { body: { child_id: id, aturan: valid.data, source_text: teks } })
      setTeks("")
      setNilai(null)
      setHasil(null)
      selesai()
    } catch (error) { setGalat(pesan(error)) }
    finally { setSibuk(false) }
  }
  function isi(idKolom: Id, value: string) {
    setNilai((lama) => lama ? { ...lama, [idKolom]: value } : null)
    setHasil((lama) => lama ? { ...lama, kolom_bermasalah: lama.kolom_bermasalah.filter((x) => x.kolom !== idKolom) } : null)
  }
  return <section className="suapin-kartu" aria-labelledby="judul-resep">
    <h2 id="judul-resep">Resep</h2>
    {galat && <p role="alert">{galat}</p>}
    {!nilai ? <>
      <label>Tulis aturan makan seperti biasa Anda menulis di catatan
        <textarea maxLength={1000} rows={5} value={teks} readOnly={sibuk}
          onChange={(e) => setTeks(e.target.value)} onKeyDown={pintasan} />
      </label>
      <p><small>{teks.length}/1000</small></p>
      <div className="suapin-aksi">
        <button type="button" className="suapin-utama" disabled={sibuk || !teks.trim()} onClick={() => void ubah()}>
          {sibuk ? "Membaca aturan…" : "Ubah jadi aturan"}
        </button>
        <button type="button" disabled={sibuk} onClick={() => { setGalat(""); setHasil(null); setNilai(sekarang) }}>Isi manual</button>
      </div>
    </> : <form onSubmit={(e) => void konfirmasi(e)}>
      {hasil && (hasil.sumber === "gagal"
        ? <p className="suapin-peringatan" role="status">AI tidak tersedia, isi manual.</p>
        : <p className="suapin-pil">{hasil.sumber === "cache" ? "AI (tersimpan)" : "AI"} · Diubah oleh AI, periksa sebelum konfirmasi.</p>)}
      <div className="suapin-resep">
        <div><h3>Teks Anda</h3><p className="suapin-teks-asli">{teks || "Diisi manual."}</p></div>
        <div><h3>Aturan untuk aplikasi</h3>
          {kolom.map((k) => {
            const masalah = hasil?.kolom_bermasalah.find((x) => x.kolom === k.id)
            const fieldId = "resep-" + k.id
            const props = { value: nilai[k.id], "aria-invalid": Boolean(masalah),
              "aria-describedby": fieldId + "-bantuan", id: fieldId, disabled: sibuk }
            return <div className="suapin-kolom-resep" key={k.id}>
              <label htmlFor={fieldId}>{k.label}</label>
              {k.id === "ngemut_hint" ? <input {...props} maxLength={100} onChange={(e) => isi(k.id, e.target.value)} /> :
                k.id === "stage" ? <select {...props} required onChange={(e) => isi(k.id, e.target.value)}>
                  <option value="">Pilih tahap</option>
                  {["Karakter memandu", "Pengasuh jadi contoh", "Layar hitam", "Tanpa layar"].map((nama, i) =>
                    <option key={nama} value={i + 1}>{i + 1} · {nama}</option>)}
                </select> : <input {...props} required type="number" min={k.min} max={k.max}
                  onChange={(e) => isi(k.id, e.target.value)} />}
              <small id={fieldId + "-bantuan"}>{k.id === "ngemut_hint" ? k.satuan : k.min + "–" + k.max + " " + k.satuan}
                {masalah && <span className="suapin-peringatan"> · {masalah.alasan}</span>}</small>
              {masalah && <button type="button" disabled={sibuk} onClick={() => isi(k.id, sekarang[k.id])}>Pakai nilai sekarang</button>}
            </div>
          })}
        </div>
      </div>
      {!!hasil?.tidak_dipetakan.length && <p>Bagian ini tidak dipakai sistem: {hasil.tidak_dipetakan.join(", ")}</p>}
      <div className="suapin-aksi">
        <button className="suapin-utama" disabled={sibuk || !(valid && valid.success) || belumDiisi > 0}>
          {sibuk ? "Menyimpan…" : "Konfirmasi aturan"}</button>
        <button type="button" disabled={sibuk} onClick={() => { setNilai(null); setGalat("") }}>Ubah teks</button>
        {belumDiisi > 0 && <small>Lengkapi {belumDiisi} kolom bertanda.</small>}
      </div>
    </form>}
  </section>
}
