// Dashboard dokter (/dokter): semua anak yang dipegang dokter ini + jadwal terdekat.
// Klik kartu anak membuka overview anak (/dokter/pasien/:id).
import { useState } from "react"
import { Link, Navigate } from "react-router"
import type { Keluaran } from "../../../bersama/kontrak/api"
import { Memuat, PesanGalat, Pil } from "../../komponen/dasar"
import { bento, tombolSegmen, wadahSegmen } from "../../gaya/gaya"
import { GalatApi, usePanggil } from "../../lib/panggil"
import { hariRelatif, jam, LABEL_JADWAL, persen, usia } from "./format"
import { Angka, Avatar, BilahTerima, TataLetakPanel } from "./tata-letak"

type Pasien = Keluaran<"pasienDaftar">["pasien"][number]
type Saring = "semua" | "perhatian" | "jadwal"
const perluPerhatian = (p: Pasien) => p.siap_naik_tahap || p.saran_turun_tahap

export function DaftarPasien() {
  const { data, galat, memuat, ulang } = usePanggil("pasienDaftar")
  const [saring, setSaring] = useState<Saring>("semua")
  if (galat instanceof GalatApi && galat.status === 401) return <Navigate to="/masuk" replace />

  const semua = [...(data?.pasien ?? [])].sort((a, b) =>
    Number(perluPerhatian(b)) - Number(perluPerhatian(a)) || a.panggilan.localeCompare(b.panggilan, "id"))
  const sepekan = Date.now() + 7 * 86400000
  const pasien = semua.filter((p) => saring === "semua" ||
    (saring === "perhatian" ? perluPerhatian(p) : !!p.jadwal_berikut && Date.parse(p.jadwal_berikut.waktu) < sepekan))
  const total = semua.reduce((t, p) => ({ masuk: t.masuk + p.diterima_7_hari, tolak: t.tolak + p.ditolak_7_hari,
    sesi: t.sesi + p.sesi_7_hari }), { masuk: 0, tolak: 0, sesi: 0 })
  const jumlahPerhatian = semua.filter(perluPerhatian).length

  return <TataLetakPanel peran="dokter" nama={data?.dokter_nama} sub={data?.klinik_nama}>
    <div className="flex flex-col gap-1">
      <h1 className="font-judul text-judul font-bold">{data?.dokter_nama ? "Halo, " + data.dokter_nama : "Pasien saya"}</h1>
      <p className="text-isi text-ungu-muda">{data?.spesialis ? data.spesialis + " · " : ""}{data?.klinik_nama ?? "Memuat…"}</p>
    </div>

    {memuat && !data && <Memuat teks="Memuat pasien…" />}
    {galat && <PesanGalat pesan={galat.message} ulangi={ulang} />}

    {data && <>
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Ringkasan 7 hari">
        <Angka label="Anak dipegang" nilai={semua.length} />
        <Angka label="Sesi 7 hari" nilai={total.sesi} />
        <Angka label="Suapan diterima" nilai={persen(total.masuk, total.tolak) + "%"} ket="rata-rata 7 hari" />
        <Angka label="Perlu ditinjau" nilai={jumlahPerhatian} ket="naik/turun tahap" sorot={jumlahPerhatian > 0} />
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <section className="flex flex-col gap-4" aria-labelledby="judul-pasien">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="judul-pasien" className="font-judul text-subjudul font-bold">Anak yang saya pegang</h2>
            <div className={`${wadahSegmen} grid-cols-3`} role="group" aria-label="Saring pasien">
              {([["semua", "Semua"], ["perhatian", "Perlu ditinjau"], ["jadwal", "Kontrol 7 hari"]] as const).map(([k, l]) =>
                <button key={k} type="button" aria-pressed={saring === k} onClick={() => setSaring(k)}
                  className={tombolSegmen(saring === k) + " text-kecil"}>{l}</button>)}
            </div>
          </div>
          {!semua.length && <p className={bento}>Belum ada pasien. Buka link laporan yang dibagikan keluarga, lalu tekan <strong>Jadikan pasien saya</strong>.</p>}
          {!!semua.length && !pasien.length && <p className={`${bento} text-ungu-muda`}>Tidak ada anak untuk saringan ini.</p>}
          <ul className="grid gap-3 sm:grid-cols-2">
            {pasien.map((p) => <li key={p.id}><KartuPasien p={p} /></li>)}
          </ul>
        </section>

        <section className={`${bento} flex flex-col gap-3`} aria-labelledby="judul-jadwal">
          <h2 id="judul-jadwal" className="font-judul text-subjudul font-bold">Jadwal terdekat</h2>
          {!data.jadwal.length && <p className="text-ungu-muda">Belum ada jadwal kontrol.</p>}
          <ol className="flex flex-col divide-y divide-garis/50">
            {data.jadwal.slice(0, 8).map((j) => <li key={j.id}>
              <Link to={"/dokter/pasien/" + j.child_id} className="flex min-h-14 items-center gap-3 rounded-kartu py-3 outline-none hover:bg-latar focus-visible:ring-4 focus-visible:ring-jagung">
                <span className="flex w-20 shrink-0 flex-col">
                  <span className="text-kecil font-semibold">{hariRelatif(j.waktu)}</span>
                  <span className="text-kecil text-ungu-muda tabular-nums">{jam(j.waktu)}</span>
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="font-semibold">{j.panggilan}</span>
                  <span className="text-kecil text-ungu-muda">{LABEL_JADWAL[j.jenis]}</span>
                </span>
              </Link>
            </li>)}
          </ol>
        </section>
      </div>
    </>}
  </TataLetakPanel>
}

function KartuPasien({ p }: { p: Pasien }) {
  return <Link to={"/dokter/pasien/" + p.id}
    className={`${bento} group flex h-full flex-col gap-4 transition-[transform,box-shadow,background-color] duration-200 ease-standar hover:-translate-y-0.5 hover:shadow-kartu active:scale-[0.99] motion-reduce:transform-none outline-none focus-visible:ring-4 focus-visible:ring-jagung`}>
    <div className="flex items-center gap-3">
      <Avatar nama={p.panggilan} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-isi font-bold">{p.panggilan}</span>
        <span className="text-kecil text-ungu-muda">{usia(p.usia_bulan)} · Tahap {p.tahap}</span>
      </div>
      <span aria-hidden="true" className="text-subjudul text-ungu-muda transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none">›</span>
    </div>
    <BilahTerima diterima={p.diterima_7_hari} ditolak={p.ditolak_7_hari} />
    <div className="flex flex-wrap gap-2">
      {p.siap_naik_tahap && <Pil>Siap naik tahap</Pil>}
      {p.saran_turun_tahap && <Pil nada="jagung">Saran turun tahap</Pil>}
      <Pil nada="netral">{p.sesi_7_hari} sesi 7 hari</Pil>
      {p.source_aturan === "dokter" && <Pil nada="netral">Aturan dokter</Pil>}
    </div>
    <p className="mt-auto text-kecil text-ungu-muda">
      {p.jadwal_berikut ? `${LABEL_JADWAL[p.jadwal_berikut.jenis]} ${hariRelatif(p.jadwal_berikut.waktu, true)}, ${jam(p.jadwal_berikut.waktu)}`
        : "Belum ada jadwal kontrol"}
      {p.sesi_terakhir && ` · sesi terakhir ${hariRelatif(p.sesi_terakhir, true)}`}
    </p>
  </Link>
}
