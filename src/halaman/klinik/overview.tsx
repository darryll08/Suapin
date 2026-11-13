// Overview akun klinik (/klinik): kartu profil klinik + angka ringkas, lalu dokter → anak yang dipegang,
// jadwal kontrol per hari, dan pasien tanpa dokter. Klinik hanya melihat ringkasan; data sesi rinci
// dan resep tetap di dashboard dokter.
import { useState } from "react"
import { Navigate } from "react-router"
import type { Keluaran } from "../../../bersama/kontrak/api"
import { Memuat, PesanGalat, Pil } from "../../komponen/dasar"
import { GalatApi, usePanggil } from "../../lib/panggil"
import { bagianTanggal, hariRelatif, jam, LABEL_JADWAL, usia } from "./format"
import { Angka, Avatar, chip, Ikon, KartuProfil, LencanaTanggal, panel, TataLetakPanel, ubin } from "./tata-letak"
import { keMasuk } from "../../lib/arah.ts"

type Overview = Keluaran<"klinikOverview">
type Dokter = Overview["dokter"][number]
const urutNama = (n: string) => n.replace(/^dr\.?\s*/i, "")

export function OverviewKlinik() {
  const { data, galat, memuat, ulang } = usePanggil("klinikOverview")
  const [tampil, setTampil] = useState<"dokter" | "jadwal">("dokter")
  if (galat instanceof GalatApi && galat.status === 401) return <Navigate to={keMasuk(location.pathname + location.search)} replace />

  return <TataLetakPanel peran="klinik" nama={data?.klinik.nama} sub={data?.klinik.kota ?? undefined}>
    {memuat && !data && <Memuat teks="Memuat overview…" />}
    {galat && <PesanGalat pesan={galat.message} ulangi={ulang} />}

    {data && <>
      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <KartuProfil nama={data.klinik.nama} sub={data.klinik.kota ?? "Klinik mitra Suapin"}
          kiri={{ nilai: data.statistik.persen_diterima_7_hari + "%", label: "diterima, 7 hari" }}
          kanan={{ nilai: data.statistik.sesi_7_hari, label: "sesi, 7 hari" }} />
        <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-4">
          <Angka ikon="stetoskop" label="Dokter" nilai={data.statistik.dokter} />
          <Angka ikon="anak" label="Pasien" nilai={data.statistik.pasien}
            ket={data.tanpa_dokter.length ? `${data.tanpa_dokter.length} tanpa dokter` : undefined} sorot={data.tanpa_dokter.length > 0} />
          <Angka ikon="kalender" label="Jadwal 7 hari" nilai={data.statistik.jadwal_7_hari} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Tampilan">
        {(["dokter", "jadwal"] as const).map((t) => <button key={t} type="button" role="tab" aria-selected={tampil === t}
          onClick={() => setTampil(t)} className={chip(tampil === t)}>{t === "dokter" ? "Dokter dan pasien" : "Jadwal kontrol"}</button>)}
      </div>

      {tampil === "dokter" ? <div className="grid items-start gap-4 md:grid-cols-2" role="tabpanel">
        {[...data.dokter].sort((a, b) => urutNama(a.nama).localeCompare(urutNama(b.nama), "id")).map((d) => <KartuDokter key={d.id} d={d} />)}
        {!!data.tanpa_dokter.length && <section className="flex flex-col gap-3 rounded-bento border border-jagung bg-jagung-muda p-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-permukaan text-jagung-tua" aria-hidden="true"><Ikon nama="bendera" className="size-5" /></span>
            <div>
              <h2 className="font-judul text-subjudul font-bold">Belum Punya Dokter</h2>
              <p className="text-kecil text-jagung-tua">Terdaftar di klinik, belum dipegang dokter mana pun.</p>
            </div>
          </div>
          <ul className="flex flex-wrap gap-2">
            {data.tanpa_dokter.map((p) => <li key={p.id} className="inline-flex items-center gap-2 rounded-full bg-permukaan py-1 pr-3 pl-1 text-kecil font-semibold">
              <Avatar nama={p.panggilan} kecil />{p.panggilan} · {usia(p.usia_bulan)}</li>)}
          </ul>
        </section>}
      </div> : <JadwalPerHari jadwal={data.jadwal} />}
    </>}
  </TataLetakPanel>
}

function KartuDokter({ d }: { d: Dokter }) {
  return <section className={`${panel} flex flex-col gap-4`} aria-label={d.nama}>
    <div className="flex items-center gap-3">
      <Avatar nama={d.nama} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="flex flex-wrap items-center gap-2 font-bold">{d.nama}{!d.aktif && <Pil nada="jagung">Nonaktif</Pil>}</span>
        <span className="truncate text-kecil text-ungu-muda">{d.spesialis ?? "Tenaga kesehatan"}</span>
      </div>
      <span className="flex shrink-0 gap-1.5">
        <span className="flex flex-col items-center rounded-isian bg-latar px-3 py-1.5 leading-tight"><span className="font-judul text-subjudul font-bold tabular-nums">{d.pasien.length}</span><span className="text-mini text-ungu-muda">anak</span></span>
        <span className="flex flex-col items-center rounded-isian bg-latar px-3 py-1.5 leading-tight"><span className="font-judul text-subjudul font-bold tabular-nums">{d.sesi_7_hari}</span><span className="text-mini text-ungu-muda">sesi/7 hr</span></span>
      </span>
    </div>
    {!d.pasien.length ? <p className={`${ubin} text-kecil text-ungu-muda`}>Belum memegang pasien.</p> :
      <ul className={`${ubin} flex flex-col divide-y divide-garis/50 py-1`}>
        {d.pasien.map((p) => <li key={p.id} className="flex items-center gap-3 py-2.5">
          <Avatar nama={p.panggilan} kecil />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="font-semibold">{p.panggilan} <span className="font-normal text-kecil text-ungu-muda">· {usia(p.usia_bulan)} · Tahap {p.tahap}</span></span>
            <span className="text-kecil text-ungu-muda">
              {p.jadwal_berikut ? `Kontrol ${hariRelatif(p.jadwal_berikut, true)}, ${jam(p.jadwal_berikut)}` : "Belum ada jadwal"}
            </span>
          </span>
          <span className="shrink-0 text-kecil font-bold tabular-nums">{p.sesi_7_hari} sesi</span>
        </li>)}
      </ul>}
  </section>
}

/** Jadwal dikelompokkan per hari: lencana tanggal di kiri, janji temu di kanan. */
function JadwalPerHari({ jadwal }: { jadwal: Overview["jadwal"] }) {
  const perHari = new Map<string, Overview["jadwal"]>()
  for (const j of jadwal) {
    const t = bagianTanggal(j.waktu)
    const k = t.tgl + " " + t.bln
    perHari.set(k, [...(perHari.get(k) ?? []), j])
  }
  if (!jadwal.length) return <p className={`${panel} text-ungu-muda`} role="tabpanel">Belum ada jadwal mendatang.</p>
  return <section className={`${panel} flex flex-col gap-3`} role="tabpanel" aria-label="Jadwal kontrol">
    {[...perHari.values()].map((isi, i) => {
      const t = bagianTanggal(isi[0]!.waktu)
      return <div key={isi[0]!.id} className="flex gap-3">
        <LencanaTanggal hari={t.hari} tanggal={t.tgl} aktif={i === 0} />
        <ul className={`${ubin} flex flex-1 flex-col divide-y divide-garis/50 py-1`}>
          <li className="pb-1 text-kecil font-semibold text-ungu-muda">{hariRelatif(isi[0]!.waktu)}{hariRelatif(isi[0]!.waktu).includes(",") ? "" : `, ${t.tgl} ${t.bln}`}</li>
          {isi.map((j) => <li key={j.id} className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-start gap-2 py-2 sm:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,0.8fr)]">
            <span className="font-bold tabular-nums">{jam(j.waktu)}</span>
            <span className="flex min-w-0 flex-col">
              <span className="font-semibold">{j.panggilan}</span>
              <span className="text-kecil text-ungu-muda">{LABEL_JADWAL[j.jenis]}{j.catatan ? " · " + j.catatan : ""}</span>
            </span>
            <span className="col-start-2 text-kecil text-ungu-muda sm:col-start-auto sm:text-right">{j.dokter_nama}</span>
          </li>)}
        </ul>
      </div>
    })}
  </section>
}
