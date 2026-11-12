// Dashboard dokter (/dokter): kartu profil gelap + angka ringkas + jadwal terdekat, lalu daftar anak
// yang dipegang dokter ini. Klik baris anak membuka overview anak (/dokter/pasien/:id).
import { useState } from "react"
import { Link, Navigate } from "react-router"
import type { Keluaran } from "../../../bersama/kontrak/api"
import { Memuat, PesanGalat, Pil } from "../../komponen/dasar"
import { GalatApi, usePanggil } from "../../lib/panggil"
import { bagianTanggal, hariRelatif, jam, LABEL_JADWAL, persen, usia } from "./format"
import { Angka, Avatar, BilahTerima, chip, Ikon, KartuProfil, LencanaTanggal, PanahBulat, panel, TataLetakPanel } from "./tata-letak"

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
    {memuat && !data && <Memuat teks="Memuat pasien…" />}
    {galat && <PesanGalat pesan={galat.message} ulangi={ulang} />}

    {data && <>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <KartuProfil nama={data.dokter_nama ?? "Dokter"}
            sub={[data.spesialis, data.klinik_nama].filter(Boolean).join(" · ")}
            kiri={{ nilai: persen(total.masuk, total.tolak) + "%", label: "diterima, 7 hari" }}
            kanan={{ nilai: total.sesi, label: "sesi, 7 hari" }} />
          <div className="grid grid-cols-2 gap-4">
            <Angka ikon="anak" label="Anak dipegang" nilai={semua.length} />
            <Angka ikon="bendera" label="Perlu ditinjau" nilai={jumlahPerhatian} ket="naik/turun tahap" sorot={jumlahPerhatian > 0} />
          </div>
        </div>

        <section className={`${panel} flex flex-col gap-3 lg:h-full`} aria-labelledby="judul-jadwal">
          <div className="flex items-center justify-between gap-2">
            <h2 id="judul-jadwal" className="font-judul text-subjudul font-bold">Jadwal terdekat</h2>
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-ungu-tint text-ungu" aria-hidden="true"><Ikon nama="kalender" className="size-5" /></span>
          </div>
          {!data.jadwal.length && <p className="text-ungu-muda">Belum ada jadwal kontrol.</p>}
          <ol className="flex flex-col gap-2">
            {data.jadwal.slice(0, 6).map((j, i) => {
              const t = bagianTanggal(j.waktu)
              return <li key={j.id}>
                <Link to={"/dokter/pasien/" + j.child_id} className="group flex items-center gap-3 rounded-[20px] p-1.5 pr-3 outline-none hover:bg-latar focus-visible:ring-4 focus-visible:ring-jagung">
                  <LencanaTanggal hari={t.hari} tanggal={t.tgl} aktif={i === 0} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-semibold">{j.panggilan}</span>
                    <span className="truncate text-kecil text-ungu-muda">{LABEL_JADWAL[j.jenis]} · {hariRelatif(j.waktu)}</span>
                  </span>
                  <span className="text-kecil font-bold tabular-nums">{jam(j.waktu)}</span>
                </Link>
              </li>
            })}
          </ol>
        </section>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="judul-pasien">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="judul-pasien" className="font-judul text-subjudul font-bold">Anak yang saya pegang</h2>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Saring pasien">
            {([["semua", "Semua"], ["perhatian", "Perlu ditinjau"], ["jadwal", "Kontrol"]] as const).map(([k, l]) =>
              <button key={k} type="button" aria-pressed={saring === k} onClick={() => setSaring(k)} className={chip(saring === k)}>{l}</button>)}
          </div>
        </div>
        {!semua.length && <p className={panel}>Belum ada pasien. Buka link laporan yang dibagikan keluarga, lalu tekan <strong>Jadikan pasien saya</strong>.</p>}
        {!!semua.length && !pasien.length && <p className={`${panel} text-ungu-muda`}>Tidak ada anak untuk saringan ini.</p>}
        <ul className="grid gap-3 md:grid-cols-2">
          {pasien.map((p) => <li key={p.id}><BarisPasien p={p} /></li>)}
        </ul>
      </section>
    </>}
  </TataLetakPanel>
}

function BarisPasien({ p }: { p: Pasien }) {
  const pr = persen(p.diterima_7_hari, p.ditolak_7_hari)
  return <Link to={"/dokter/pasien/" + p.id}
    className={`${panel} group flex h-full items-center gap-3 p-3 pr-3 transition-[background-color,transform] duration-200 hover:bg-ungu-tint/40 active:scale-[0.99] motion-reduce:transform-none outline-none focus-visible:ring-4 focus-visible:ring-jagung`}>
    <Avatar nama={p.panggilan} />
    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-bold">{p.panggilan}</span>
        <span className="text-kecil text-ungu-muda">{usia(p.usia_bulan)} · Tahap {p.tahap}</span>
      </span>
      <span className="flex items-center gap-2">
        <span className="w-full max-w-36"><BilahTerima diterima={p.diterima_7_hari} ditolak={p.ditolak_7_hari} tanpaTeks /></span>
        <span className="text-kecil font-bold tabular-nums">{p.diterima_7_hari + p.ditolak_7_hari ? pr + "%" : "–"}</span>
      </span>
      <span className="flex flex-wrap items-center gap-1.5 text-kecil text-ungu-muda">
        {p.siap_naik_tahap && <Pil>Siap naik tahap</Pil>}
        {p.saran_turun_tahap && <Pil nada="jagung">Saran turun tahap</Pil>}
        {p.jadwal_berikut ? <span>{LABEL_JADWAL[p.jadwal_berikut.jenis]} {hariRelatif(p.jadwal_berikut.waktu, true)}, {jam(p.jadwal_berikut.waktu)}</span>
          : <span>{p.sesi_7_hari} sesi, 7 hari</span>}
      </span>
    </span>
    <PanahBulat />
  </Link>
}
