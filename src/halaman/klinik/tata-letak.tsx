// Tata letak panel dokter (/dokter) dan akun klinik (/klinik). Gaya bento sama dengan halaman keluarga,
// lebar dashboard max-w-5xl (UI UX 2.1). Keluar menghapus cookie peran lalu kembali ke /masuk.
import { useState, type ReactNode } from "react"
import { Link, useNavigate } from "react-router"
import { Pil, Tombol } from "../../komponen/dasar"
import { bento } from "../../gaya/gaya"
import { panggil } from "../../lib/panggil"
import { Logo } from "../keluarga/tata-letak"
import { pesan } from "./format"
import "./klinik.css"

export function TataLetakPanel({ peran, nama, sub, children }: {
  peran: "dokter" | "klinik"; nama?: string; sub?: string; children: ReactNode
}) {
  const navigate = useNavigate()
  const [sibuk, setSibuk] = useState(false)
  const [galat, setGalat] = useState("")
  async function keluar() {
    setSibuk(true)
    try {
      await panggil(peran === "dokter" ? "dokterKeluar" : "klinikKeluar")
      void navigate("/masuk" + (peran === "klinik" ? "?sebagai=klinik" : ""), { replace: true })
    } catch (error) { setGalat(pesan(error)) }
    finally { setSibuk(false) }
  }
  return <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-12">
    <header className="flex flex-wrap items-center justify-between gap-3 pt-3">
      <div className="flex items-center gap-3">
        <Logo ke={peran === "dokter" ? "/dokter" : "/klinik"} />
        <Pil nada={peran === "dokter" ? "ungu" : "jagung"}>{peran === "dokter" ? "Dokter" : "Klinik"}</Pil>
      </div>
      <div className="flex min-w-0 items-center gap-3">
        {nama && <span className="hidden min-w-0 flex-col text-right sm:flex">
          <span className="truncate text-isi font-semibold">{nama}</span>
          {sub && <span className="truncate text-kecil text-ungu-muda">{sub}</span>}
        </span>}
        <Tombol varian="kedua" memuat={sibuk} onClick={() => void keluar()} className="min-h-12 sm:w-auto">Keluar</Tombol>
      </div>
    </header>
    {galat && <p role="alert" className="text-jagung-tua">{galat}</p>}
    {children}
  </main>
}

/** Angka ringkas di atas dashboard. */
export function Angka({ label, nilai, ket, sorot = false }: { label: string; nilai: ReactNode; ket?: string; sorot?: boolean }) {
  return <div className={`${bento} flex flex-col gap-1 ${sorot ? "border-jagung bg-jagung-muda" : ""}`}>
    <span className="text-kecil font-semibold text-ungu-muda">{label}</span>
    <span className="font-judul text-tampilan font-bold tabular-nums">{nilai}</span>
    {ket && <span className="text-kecil text-ungu-muda">{ket}</span>}
  </div>
}

/** Bilah persentase diterima vs ditolak (tanpa merah: ungu = diterima, kerupuk = ditolak). */
export function BilahTerima({ diterima, ditolak }: { diterima: number; ditolak: number }) {
  const total = diterima + ditolak
  const p = total ? Math.round(diterima / total * 100) : 0
  return <div className="flex flex-col gap-1">
    <div className="flex h-2.5 overflow-hidden rounded-full bg-garis/40" role="img"
      aria-label={total ? `${p} persen suapan diterima` : "Belum ada suapan"}>
      <div className="h-full rounded-full bg-ungu" style={{ width: p + "%" }} />
    </div>
    <span className="text-kecil text-ungu-muda tabular-nums">{total ? `${p}% diterima · ${diterima}/${total} suapan` : "Belum ada suapan"}</span>
  </div>
}

export function Avatar({ nama, besar = false }: { nama: string; besar?: boolean }) {
  return <span aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center rounded-full bg-ungu-tint font-judul font-bold text-ungu ${besar ? "size-16 text-judul" : "size-11 text-isi"}`}>
    {nama.replace(/^(dr\.?\s*)/i, "").charAt(0).toUpperCase()}
  </span>
}

export function TautanKembali({ ke, children }: { ke: string; children: ReactNode }) {
  return <Link to={ke} className="-ml-1 inline-flex min-h-12 items-center gap-1 self-start rounded-tombol px-2 font-semibold text-ungu underline-offset-4 hover:underline hover:decoration-jagung hover:decoration-2 outline-none focus-visible:ring-4 focus-visible:ring-jagung">
    <span aria-hidden="true">‹</span> {children}
  </Link>
}
