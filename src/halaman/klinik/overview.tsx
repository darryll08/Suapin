// Overview akun klinik (/klinik): dokter → anak yang dipegang, jadwal kontrol, pasien tanpa dokter.
// Klinik hanya melihat ringkasan; data sesi rinci dan resep tetap di dashboard dokter.
import { useState } from "react"
import { Navigate } from "react-router"
import type { Keluaran } from "../../../bersama/kontrak/api"
import { Memuat, PesanGalat, Pil } from "../../komponen/dasar"
import { bento, tombolSegmen, wadahSegmen } from "../../gaya/gaya"
import { GalatApi, usePanggil } from "../../lib/panggil"
import { hariRelatif, jam, LABEL_JADWAL, tanggal, usia } from "./format"
import { Angka, Avatar, TataLetakPanel } from "./tata-letak"

type Overview = Keluaran<"klinikOverview">
type Dokter = Overview["dokter"][number]
const urutNama = (n: string) => n.replace(/^dr\.?\s*/i, "")

export function OverviewKlinik() {
  const { data, galat, memuat, ulang } = usePanggil("klinikOverview")
  const [tampil, setTampil] = useState<"dokter" | "jadwal">("dokter")
  if (galat instanceof GalatApi && galat.status === 401) return <Navigate to="/masuk?sebagai=klinik" replace />

  return <TataLetakPanel peran="klinik" nama={data?.klinik.nama} sub={data?.klinik.kota ?? undefined}>
    <div className="flex flex-col gap-1">
      <h1 className="font-judul text-judul font-bold">{data?.klinik.nama ?? "Klinik"}</h1>
      <p className="text-isi text-ungu-muda">Overview dokter, pasien yang dipegang, dan jadwal kontrol.</p>
    </div>
    {memuat && !data && <Memuat teks="Memuat overview…" />}
    {galat && <PesanGalat pesan={galat.message} ulangi={ulang} />}

    {data && <>
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Ringkasan klinik">
        <Angka label="Dokter" nilai={data.statistik.dokter} />
        <Angka label="Pasien aktif" nilai={data.statistik.pasien} ket={data.tanpa_dokter.length ? `${data.tanpa_dokter.length} belum punya dokter` : undefined} sorot={data.tanpa_dokter.length > 0} />
        <Angka label="Jadwal 7 hari" nilai={data.statistik.jadwal_7_hari} />
        <Angka label="Suapan diterima" nilai={data.statistik.persen_diterima_7_hari + "%"} ket={`${data.statistik.sesi_7_hari} sesi, 7 hari`} />
      </section>

      <div className={`${wadahSegmen} grid-cols-2 sm:max-w-sm`} role="tablist" aria-label="Tampilan">
        {(["dokter", "jadwal"] as const).map((t) => <button key={t} type="button" role="tab" aria-selected={tampil === t}
          onClick={() => setTampil(t)} className={tombolSegmen(tampil === t)}>{t === "dokter" ? "Dokter & pasien" : "Jadwal"}</button>)}
      </div>

      {tampil === "dokter" ? <div className="grid items-start gap-4 md:grid-cols-2" role="tabpanel">
        {[...data.dokter].sort((a, b) => urutNama(a.nama).localeCompare(urutNama(b.nama), "id")).map((d) => <KartuDokter key={d.id} d={d} />)}
        {!!data.tanpa_dokter.length && <section className={`${bento} flex flex-col gap-3 border-jagung bg-jagung-muda`}>
          <h2 className="font-judul text-subjudul font-bold">Belum punya dokter</h2>
          <p className="text-kecil text-jagung-tua">Pasien terdaftar di klinik, belum dipegang dokter mana pun.</p>
          <ul className="flex flex-wrap gap-2">
            {data.tanpa_dokter.map((p) => <li key={p.id} className="rounded-full bg-permukaan px-3 py-2 text-kecil font-semibold">{p.panggilan} · {usia(p.usia_bulan)}</li>)}
          </ul>
        </section>}
      </div> : <section className={`${bento} flex flex-col gap-2`} role="tabpanel" aria-label="Jadwal kontrol">
        {!data.jadwal.length && <p className="text-ungu-muda">Belum ada jadwal mendatang.</p>}
        <ol className="flex flex-col divide-y divide-garis/50">
          {data.jadwal.map((j, i) => {
            const hariBaru = i === 0 || tanggal(data.jadwal[i - 1]!.waktu) !== tanggal(j.waktu)
            return <li key={j.id} className="flex flex-col gap-1 py-3">
              {hariBaru && <span className="pt-1 text-kecil font-bold uppercase tracking-wide text-ungu-muda">{hariRelatif(j.waktu)}{hariRelatif(j.waktu) !== tanggal(j.waktu) ? " · " + tanggal(j.waktu) : ""}</span>}
              <div className="grid grid-cols-[4rem_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[4rem_minmax(0,1fr)_minmax(0,1fr)]">
                <span className="font-semibold tabular-nums">{jam(j.waktu)}</span>
                <span className="flex flex-col">
                  <span className="font-semibold">{j.panggilan}</span>
                  <span className="text-kecil text-ungu-muda">{LABEL_JADWAL[j.jenis]}{j.catatan ? " · " + j.catatan : ""}</span>
                </span>
                <span className="col-start-2 text-kecil text-ungu-muda sm:col-start-auto sm:text-isi">{j.dokter_nama}</span>
              </div>
            </li>
          })}
        </ol>
      </section>}
    </>}
  </TataLetakPanel>
}

function KartuDokter({ d }: { d: Dokter }) {
  return <section className={`${bento} flex flex-col gap-4`} aria-label={d.nama}>
    <div className="flex items-center gap-3">
      <Avatar nama={d.nama} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="flex flex-wrap items-center gap-2 text-isi font-bold">{d.nama}{!d.aktif && <Pil nada="jagung">Nonaktif</Pil>}</span>
        <span className="text-kecil text-ungu-muda">{d.spesialis ?? "Tenaga kesehatan"}</span>
      </div>
      <span className="text-right text-kecil text-ungu-muda tabular-nums">{d.pasien.length} anak<br />{d.sesi_7_hari} sesi/7 hr</span>
    </div>
    {!d.pasien.length ? <p className="text-kecil text-ungu-muda">Belum memegang pasien.</p> :
      <ul className="flex flex-col divide-y divide-garis/50">
        {d.pasien.map((p) => <li key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 py-2">
          <span className="font-semibold">{p.panggilan} <span className="font-normal text-ungu-muda">· {usia(p.usia_bulan)} · Tahap {p.tahap}</span></span>
          <span className="text-kecil text-ungu-muda tabular-nums">{p.sesi_7_hari} sesi</span>
          <span className="col-span-2 text-kecil text-ungu-muda">
            {p.jadwal_berikut ? `Kontrol ${hariRelatif(p.jadwal_berikut, true)}, ${jam(p.jadwal_berikut)}` : "Belum ada jadwal"}
          </span>
        </li>)}
      </ul>}
  </section>
}
