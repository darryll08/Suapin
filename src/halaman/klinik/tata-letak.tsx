// Tata letak dan komponen panel dokter (/dokter), klinik (/klinik), dan laporan bagikan (/r).
// Gaya (12 Nov): bento lembut satu warna ala aplikasi kesehatan, diterjemahkan ke palet Suapin.
// - kartu besar radius 28 + "ubin" nasi di dalam kartu (kartu-dalam-kartu, bukan bayangan)
// - tombol bulat: panah gelap (ungu) di ujung baris, tombol kembali bulat di kepala halaman detail
// - kartu profil gelap (ungu) dengan dua angka mengapit avatar
// - chip saring: aktif ungu penuh, lainnya garis tipis
// Tanpa merah, tanpa animasi terus-menerus. Lebar dashboard max-w-5xl (UI UX 2.1).
import { useState, type ReactNode } from "react"
import { Link, useNavigate } from "react-router"
import { Pil } from "../../komponen/dasar"
import { panggil } from "../../lib/panggil"
import { Logo } from "../keluarga/tata-letak"
import { pesan } from "./format"
import "./klinik.css"

/** Kartu utama dan ubin di dalam kartu. */
export const panel = "rounded-[28px] border border-garis/50 bg-permukaan p-5"
export const ubin = "rounded-[20px] bg-latar p-4"
const fokus = "outline-none focus-visible:ring-4 focus-visible:ring-jagung"

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
      void navigate("/masuk", { replace: true })
    } catch (error) { setGalat(pesan(error)) }
    finally { setSibuk(false) }
  }
  return <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 pb-12">
    <header className="flex items-center justify-between gap-3 pt-3">
      <div className="flex min-w-0 items-center gap-3">
        <Logo ke={peran === "dokter" ? "/dokter" : "/klinik"} />
        <Pil nada={peran === "dokter" ? "ungu" : "jagung"}>{peran === "dokter" ? "Dokter" : "Klinik"}</Pil>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        {nama && <span className="hidden min-w-0 items-center gap-2 rounded-full border border-garis/60 bg-permukaan py-1 pr-4 pl-1 sm:flex">
          <Avatar nama={nama} kecil />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-kecil font-bold">{nama}</span>
            {sub && <span className="truncate text-[12px] text-ungu-muda">{sub}</span>}
          </span>
        </span>}
        <button type="button" disabled={sibuk} onClick={() => void keluar()} title="Keluar"
          className={`inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full border border-garis/60 bg-permukaan px-4 text-kecil font-bold text-ungu transition-colors hover:bg-ungu-tint disabled:opacity-50 ${fokus}`}>
          <Ikon nama="keluar" className="size-4" />{sibuk ? "Keluar…" : "Keluar"}
        </button>
      </div>
    </header>
    {galat && <p role="alert" className="text-jagung-tua">{galat}</p>}
    {children}
  </main>
}

/** Kepala halaman detail: tombol kembali bulat di kiri, judul di tengah, aksi opsional di kanan. */
export function KepalaDetail({ kembali, labelKembali, judul, kanan }: { kembali: string; labelKembali: string; judul: string; kanan?: ReactNode }) {
  return <div className="grid grid-cols-[48px_minmax(0,1fr)_48px] items-center gap-2">
    <Link to={kembali} aria-label={labelKembali} title={labelKembali}
      className={`inline-flex size-12 items-center justify-center rounded-full bg-ungu text-permukaan transition-transform active:scale-95 ${fokus}`}>
      <Ikon nama="kembali" className="size-5" />
    </Link>
    <h1 className="truncate text-center font-judul text-subjudul font-bold">{judul}</h1>
    <span className="flex justify-end">{kanan}</span>
  </div>
}

/** Angka ringkas: ikon dalam lingkaran + label, angka besar, keterangan. */
export function Angka({ label, nilai, ket, ikon, sorot = false }: { label: string; nilai: ReactNode; ket?: string; ikon?: NamaIkon; sorot?: boolean }) {
  return <div className={`${panel} flex flex-col gap-3 ${sorot ? "border-jagung bg-jagung-muda" : ""}`}>
    <span className="flex items-center gap-2">
      {ikon && <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full ${sorot ? "bg-permukaan text-jagung-tua" : "bg-ungu-tint text-ungu"}`}><Ikon nama={ikon} className="size-[18px]" /></span>}
      <span className={`text-kecil font-semibold ${sorot ? "text-jagung-tua" : "text-ungu-muda"}`}>{label}</span>
    </span>
    <span className="font-judul text-tampilan leading-none font-bold tabular-nums">{nilai}</span>
    {ket && <span className="-mt-1 text-kecil text-ungu-muda">{ket}</span>}
  </div>
}

/** Kartu profil gelap: angka kiri, avatar di tengah, angka kanan, nama di bawah avatar. */
export function KartuProfil({ nama, sub, kiri, kanan }: {
  nama: string; sub?: string; kiri: { nilai: ReactNode; label: string }; kanan: { nilai: ReactNode; label: string }
}) {
  return <section className="flex flex-col justify-center rounded-[28px] bg-ungu p-5 text-permukaan sm:p-6" aria-label={`Profil ${nama}`}>
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
      <Sisi s={kiri} rata="items-start text-left" />
      <span aria-hidden="true" className="inline-flex size-20 items-center justify-center rounded-full bg-ungu-muda font-judul text-tampilan font-bold ring-4 ring-latar/15 sm:size-24">
        {inisial(nama)}
      </span>
      <Sisi s={kanan} rata="items-end text-right" />
    </div>
    <div className="pt-4 text-center">
      <p className="font-judul text-subjudul font-bold">{nama}</p>
      {sub && <p className="text-kecil text-latar/80">{sub}</p>}
    </div>
  </section>
}

function Sisi({ s, rata }: { s: { nilai: ReactNode; label: string }; rata: string }) {
  return <span className={`flex flex-col ${rata}`}>
    <span className="font-judul text-[clamp(1.75rem,6vw,2.5rem)] leading-none font-bold tabular-nums">{s.nilai}</span>
    <span className="pt-1 text-kecil text-latar/80">{s.label}</span>
  </span>
}

/** Bilah persentase diterima vs ditolak: ungu = diterima, arsir = ditolak (sama dengan grafik pil beranda). */
export function BilahTerima({ diterima, ditolak, tanpaTeks = false }: { diterima: number; ditolak: number; tanpaTeks?: boolean }) {
  const total = diterima + ditolak
  const p = total ? Math.round(diterima / total * 100) : 0
  return <div className="flex min-w-0 flex-col gap-1">
    <div className="arsir flex h-3 overflow-hidden rounded-full border border-ungu-muda/60" role="img"
      aria-label={total ? `${p} persen suapan diterima` : "Belum ada suapan"}>
      <div className="h-full rounded-full bg-ungu" style={{ width: p + "%" }} />
    </div>
    {!tanpaTeks && <span className="text-kecil text-ungu-muda tabular-nums">{total ? `${p}% diterima · ${diterima}/${total} suapan` : "Belum ada suapan"}</span>}
  </div>
}

const inisial = (nama: string) => nama.replace(/^(dr\.?\s*)/i, "").charAt(0).toUpperCase()

export function Avatar({ nama, besar = false, kecil = false }: { nama: string; besar?: boolean; kecil?: boolean }) {
  return <span aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center rounded-full bg-ungu-tint font-judul font-bold text-ungu ${besar ? "size-16 text-judul" : kecil ? "size-9 text-kecil" : "size-12 text-isi"}`}>
    {inisial(nama)}
  </span>
}

/** Tombol bulat gelap berpanah di ujung baris (bagian dari tautan baris, bukan tombol terpisah). */
export function PanahBulat() {
  return <span aria-hidden="true" className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-ungu text-permukaan transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none">
    <Ikon nama="panah" className="size-4" />
  </span>
}

/** Chip saring: aktif ungu penuh, lainnya garis tipis. */
export const chip = (aktif: boolean) =>
  `inline-flex min-h-11 items-center rounded-full px-4 text-kecil font-semibold transition-colors ${fokus} ` +
  (aktif ? "bg-ungu text-permukaan" : "border border-garis/70 bg-permukaan text-ungu hover:bg-ungu-tint")

/** Lencana tanggal ala kalender: hari kecil di atas, tanggal besar di bawah. */
export function LencanaTanggal({ hari, tanggal, aktif = false }: { hari: string; tanggal: string; aktif?: boolean }) {
  return <span className={`flex w-14 shrink-0 flex-col items-center justify-center self-start rounded-[16px] py-2 leading-tight ${aktif ? "bg-ungu text-permukaan" : "bg-latar text-ungu"}`}>
    <span className={`text-[12px] font-semibold uppercase ${aktif ? "text-latar/80" : "text-ungu-muda"}`}>{hari}</span>
    <span className="font-judul text-subjudul font-bold tabular-nums">{tanggal}</span>
  </span>
}

export function TautanKembali({ ke, children }: { ke: string; children: ReactNode }) {
  return <Link to={ke} className={`-ml-1 inline-flex min-h-12 items-center gap-1 self-start rounded-tombol px-2 font-semibold text-ungu underline-offset-4 hover:underline hover:decoration-jagung hover:decoration-2 ${fokus}`}>
    <span aria-hidden="true">‹</span> {children}
  </Link>
}

export type NamaIkon = "anak" | "sesi" | "cek" | "bendera" | "kalender" | "panah" | "kembali" | "map" | "daun" | "perisai" | "aturan" | "jam" | "stetoskop" | "keluar" | "grafik"
const PATH: Record<NamaIkon, ReactNode> = {
  anak: <><circle cx="9" cy="8" r="3.5" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" /><path d="M21 20a6 6 0 0 0-3.5-5.5" /></>,
  sesi: <><ellipse cx="12" cy="7.5" rx="3.6" ry="4.6" /><path d="M12 12.1V21" /></>,
  cek: <><circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.5 2.5 4.5-5" /></>,
  bendera: <><path d="M5 21V4" /><path d="M5 4h11l-2 4 2 4H5" /></>,
  kalender: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  panah: <path d="M9 6l6 6-6 6" />,
  kembali: <path d="M15 6l-6 6 6 6" />,
  map: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  daun: <><path d="M12 7c-3-3-8-1-8 4 0 5 4 9 8 9s8-4 8-9c0-5-5-7-8-4z" /><path d="M12 7c0-2 1-3 3-4" /></>,
  perisai: <><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" /><path d="M9 12l2 2 4-4" /></>,
  aturan: <><path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" /><circle cx="15" cy="6" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="17" cy="18" r="2" /></>,
  jam: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  stetoskop: <><path d="M6 3v5a4 4 0 0 0 8 0V3" /><path d="M10 12v3a5 5 0 0 0 10 0v-2" /><circle cx="20" cy="11" r="2" /></>,
  keluar: <><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" /><path d="M10 16l-4-4 4-4M6 12h10" /></>,
  grafik: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
}
export function Ikon({ nama, className = "size-5" }: { nama: NamaIkon; className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {PATH[nama]}
  </svg>
}
