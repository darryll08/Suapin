// Overview satu anak untuk dokter (/dokter/pasien/:id), gaya "kartu pasien":
// kepala dengan tombol kembali bulat → info anak → angka utama → progres + grafik pil 14 hari →
// ringkasan, resep, riwayat sesi; kolom kanan: jadwal dan "map pasien" (aturan, paparan, skrining, riwayat).
import { useState, type ReactNode } from "react"
import { Navigate, useParams } from "react-router"
import { cariMakanan } from "../../../bersama/konten/makanan"
import type { Keluaran } from "../../../bersama/kontrak/api"
import { GrafikPil, RiwayatTahap, TrackerTahap, type BatangPil } from "../../komponen/beranda"
import { FormResep } from "../../komponen/klinik/form-resep"
import { TabelSesi } from "../../komponen/klinik/tabel-sesi"
import { Memuat, PesanGalat, Pil, Tombol } from "../../komponen/dasar"
import { GalatApi, panggil, usePanggil } from "../../lib/panggil"
import { bagianTanggal, hariRelatif, jam, LABEL_JADWAL, LABEL_STATUS, labelRingkasan, persen, pesan, tanggal, usia } from "./format"
import { Angka, Avatar, BilahTerima, Ikon, KepalaDetail, LencanaTanggal, panel, TataLetakPanel, ubin, type NamaIkon } from "./tata-letak"
import { keMasuk } from "../../lib/arah.ts"

type Detail = Keluaran<"pasienDetail">
const NAMA_TAHAP = ["Karakter memandu", "Pengasuh jadi contoh", "Layar hitam", "Tanpa layar"]
const SAPAAN = { mbak: "Mbak", bu: "Bu", oma: "Oma", ayah: "Ayah" } as const

export function Pasien() {
  const { id = "" } = useParams()
  return <DetailPasien key={id} id={id} />
}

function DetailPasien({ id }: { id: string }) {
  const { data, galat, memuat, ulang } = usePanggil("pasienDetail", { params: { id } })
  const [aksi, setAksi] = useState<"ringkasan" | "tahap" | null>(null)
  const [galatAksi, setGalatAksi] = useState("")
  const [sukses, setSukses] = useState("")
  if (galat instanceof GalatApi && galat.status === 401) return <Navigate to={keMasuk(location.pathname + location.search)} replace />
  if (!data) return <TataLetakPanel peran="dokter">
    <KepalaDetail kembali="/dokter" labelKembali="Kembali ke semua pasien" judul="Kartu Pasien" />
    {memuat ? <Memuat teks="Memuat pasien…" /> : <PesanGalat pesan={galat instanceof GalatApi && galat.status === 404
      ? "Pasien tidak ditemukan atau bukan pasien Anda." : galat?.message ?? "Gagal memuat"} ulangi={ulang} />}
  </TataLetakPanel>

  const aktif = data.aturan_aktif.aturan
  async function jalankan(jenis: NonNullable<typeof aksi>) {
    setAksi(jenis); setGalatAksi(""); setSukses("")
    try {
      if (jenis === "ringkasan") await panggil("ringkasanBuat", { params: { childId: id } })
      else {
        await panggil("aturanKonfirmasi", { body: {
          child_id: id, aturan: { ...aktif, stage: aktif.stage + 1 }, source_text: "Tahap dinaikkan oleh dokter.",
        } })
        setSukses("Aturan baru berlaku di sesi berikutnya.")
      }
      ulang()
    } catch (error) { setGalatAksi(pesan(error)) }
    finally { setAksi(null) }
  }
  const tujuh = data.sesi.filter((s) => Date.parse(s.tanggal) >= Date.now() - 7 * 86400000)
  const masuk7 = tujuh.reduce((n, s) => n + s.diterima, 0)
  const tolak7 = tujuh.reduce((n, s) => n + s.ditolak, 0)
  const mendatang = data.jadwal.filter((j) => j.status === "terjadwal" && Date.parse(j.waktu) >= Date.now() - 86400000)
    .sort((a, b) => a.waktu.localeCompare(b.waktu))
  const lewat = data.jadwal.filter((j) => !mendatang.includes(j))

  return <TataLetakPanel peran="dokter" nama={data.dokter_nama}>
    <KepalaDetail kembali="/dokter" labelKembali="Kembali ke semua pasien" judul="Kartu Pasien" />

    <section className={`${panel} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`} aria-label="Informasi anak">
      <div className="flex min-w-0 items-center gap-4">
        <Avatar nama={data.child.panggilan} besar />
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 className="font-judul text-judul leading-tight font-bold">{data.child.panggilan}</h2>
          <p className="text-kecil text-ungu-muda">{usia(data.child.usia_bulan)} · Pengasuh {SAPAAN[data.pengasuh.sapaan]} {data.pengasuh.nama.replace(/^(Mbak|Bu|Oma|Ayah)\s+/i, "")}</p>
          <div className="flex flex-wrap gap-1.5">
            <Pil>Tahap {data.child.stage} · {NAMA_TAHAP[data.child.stage - 1]}</Pil>
            {data.siap_naik_tahap && <Pil>Siap naik tahap</Pil>}
            {data.saran_turun_tahap && <Pil nada="jagung">Saran turun tahap</Pil>}
          </div>
        </div>
      </div>
      {data.siap_naik_tahap && aktif.stage < 4 &&
        <Tombol memuat={aksi === "tahap"} disabled={!!aksi} onClick={() => void jalankan("tahap")}>Naikkan ke tahap {aktif.stage + 1}</Tombol>}
    </section>
    <section className={`${panel} grid gap-4 sm:grid-cols-2`} aria-label="Perjalanan tahap">
      <TrackerTahap tahap={data.child.stage} progres={data.progres_tahap} />
      <RiwayatTahap tahap={data.child.stage} riwayat={data.riwayat_tahap} />
    </section>
    {sukses && <p className={`${panel} border-ungu bg-ungu-tint font-semibold`} role="status">{sukses}</p>}
    {galatAksi && <PesanGalat pesan={galatAksi} />}

    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Angka utama">
      <Angka ikon="sesi" label="Sesi 28 hari" nilai={data.sesi.length} />
      <Angka ikon="cek" label="Diterima 7 hari" nilai={persen(masuk7, tolak7) + "%"} ket={`${masuk7} dari ${masuk7 + tolak7} suapan`} />
      <Angka ikon="daun" label="Ngemut dikonfirmasi" nilai={data.ngemut_dikonfirmasi} ket="28 hari" />
      <Angka ikon="kalender" label="Kontrol berikutnya" nilai={mendatang[0] ? hariRelatif(mendatang[0].waktu) : "–"}
        ket={mendatang[0] ? `${jam(mendatang[0].waktu)} · ${LABEL_JADWAL[mendatang[0].jenis]}` : "belum dijadwalkan"} />
    </section>

    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-4">
        <section className={`${panel} flex flex-col gap-4`} aria-labelledby="judul-tren">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="judul-tren" className="font-judul text-subjudul font-bold">Suapan Diterima</h2>
              <p className="text-kecil text-ungu-muda">7 hari terakhir</p>
            </div>
            <span className="font-judul text-tampilan leading-none font-bold tabular-nums">{persen(masuk7, tolak7)}%</span>
          </div>
          <BilahTerima diterima={masuk7} ditolak={tolak7} />
          <div className={ubin}><Tren sesi={data.sesi} /></div>
        </section>

        <section className={`${panel} flex flex-col gap-3`}>
          <h2 className="font-judul text-subjudul font-bold">Ringkasan Minggu Ini</h2>
          {data.ringkasan_dokter ? <>
            <span className="self-start"><Pil nada="netral">{labelRingkasan(data.ringkasan_sumber)}</Pil></span>
            <p className={`${ubin} text-isi`}>{data.ringkasan_dokter}</p>
          </> : <>
            <p className="text-ungu-muda">Belum ada ringkasan untuk minggu ini.</p>
            <Tombol varian="kedua" memuat={aksi === "ringkasan"} disabled={!!aksi} onClick={() => void jalankan("ringkasan")} className="self-start">Buat ringkasan</Tombol>
          </>}
        </section>
        <div className="suapin-klinik flex flex-col gap-4">
          <FormResep id={id} aktif={aktif} selesai={() => { setSukses("Aturan baru berlaku di sesi berikutnya."); ulang() }} />
          <section className="suapin-kartu">
            <h2>Riwayat Sesi 28 Hari</h2>
            <TabelSesi sesi={data.sesi} lengkap />
          </section>
        </div>
      </div>

      <aside className="flex min-w-0 flex-col gap-4">
        <section className={`${panel} flex flex-col gap-3`} aria-labelledby="judul-jadwal-anak">
          <div className="flex items-center justify-between gap-2">
            <h2 id="judul-jadwal-anak" className="font-judul text-subjudul font-bold">Jadwal</h2>
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-ungu-tint text-ungu" aria-hidden="true"><Ikon nama="kalender" className="size-5" /></span>
          </div>
          {!data.jadwal.length && <p className="text-ungu-muda">Belum ada jadwal.</p>}
          <ol className="flex flex-col gap-2">
            {[...mendatang, ...lewat].map((j, i) => {
              const t = bagianTanggal(j.waktu)
              return <li key={j.id} className="flex items-center gap-3">
                <LencanaTanggal hari={t.hari} tanggal={t.tgl} aktif={i === 0 && j.status === "terjadwal"} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex flex-wrap items-center gap-x-2 font-semibold">{LABEL_JADWAL[j.jenis]}
                    <span className="text-kecil font-normal text-ungu-muda">{t.bln} · {jam(j.waktu)}</span></span>
                  <span className="text-kecil text-ungu-muda">{LABEL_STATUS[j.status]}{j.catatan ? " · " + j.catatan : ""}</span>
                </span>
              </li>
            })}
          </ol>
        </section>

        <section className={`${panel} flex flex-col gap-2`} aria-labelledby="judul-map">
          <h2 id="judul-map" className="pb-1 font-judul text-subjudul font-bold">Map Pasien</h2>
          <Map ikon="aturan" judul="Aturan Aktif" ket={data.aturan_aktif.source === "dokter" ? "Dari dokter" : "Default program"} buka>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-kecil">
              <dt className="text-ungu-muda">Lama sesi</dt><dd>maks {aktif.max_minutes} menit</dd>
              <dt className="text-ungu-muda">Naik tahap</dt><dd>min {aktif.advance_rule.first_stage_sessions} sesi (tahap 1) / {aktif.advance_rule.sessions} sesi (tahap 2–3), {aktif.advance_rule.streak} sesi berturut ≥ {aktif.advance_rule.percent}%</dd>
              <dt className="text-ungu-muda">Akhiri bila</dt><dd>menolak {aktif.end_after_refusal_minutes} menit</dd>
              <dt className="text-ungu-muda">Saat ngemut</dt><dd>{aktif.ngemut_hint}</dd>
            </dl>
          </Map>
          <Map ikon="daun" judul="Paparan Makanan" ket={`${data.paparan.length} makanan baru`}>
            {!data.paparan.length && <p className="text-kecil text-ungu-muda">Belum ada makanan baru yang dicoba.</p>}
            {data.paparan.map((p) => <div key={p.makanan} className="flex flex-col gap-1">
              <span className="flex justify-between text-kecil"><span>{cariMakanan(p.makanan).nama}</span><span className="tabular-nums">{p.jumlah}/{p.target}</span></span>
              <div className="arsir h-2.5 overflow-hidden rounded-full border border-ungu-muda/60"><div className="h-full rounded-full bg-ungu" style={{ width: Math.min(100, p.jumlah / p.target * 100) + "%" }} /></div>
            </div>)}
          </Map>
          {data.skrining_terakhir && <Map ikon="perisai" judul="Skrining" ket={data.skrining_terakhir.ada_tanda_bahaya ? "Ada tanda bahaya" : "Tidak ada tanda bahaya"}>
            <p className="text-kecil text-ungu-muda">Terakhir diisi {tanggal(data.skrining_terakhir.tanggal)}</p>
          </Map>}
          <Map ikon="map" judul="Riwayat Aturan" ket={`${data.riwayat_aturan.length} perubahan`}>
            <ol className="flex flex-col gap-2">
              {data.riwayat_aturan.map((r, i) => <li key={r.confirmed_at + i} className="flex flex-col">
                <span className="text-kecil font-semibold">{tanggal(r.confirmed_at)} · {r.source === "dokter" ? "Dokter" : "Default"}</span>
                <span className="text-kecil text-ungu-muda">{r.source_text || "Aturan program default"}</span>
              </li>)}
            </ol>
          </Map>
        </section>
      </aside>
    </div>
    <p className="text-kecil text-ungu-muda">Yang diukur adalah perilaku menerima suapan. Porsi berasal dari catatan pengasuh.</p>
  </TataLetakPanel>
}

/** Baris map yang bisa dibuka: ikon dalam lingkaran, judul + keterangan, panah. */
function Map({ ikon, judul, ket, buka = false, children }: { ikon: NamaIkon; judul: string; ket: string; buka?: boolean; children: ReactNode }) {
  return <details open={buka} className="group/map rounded-kartu bg-latar">
    <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-kartu p-2 pr-3 outline-none focus-visible:ring-4 focus-visible:ring-jagung [&::-webkit-details-marker]:hidden">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-permukaan text-ungu" aria-hidden="true"><Ikon nama={ikon} className="size-5" /></span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-semibold">{judul}</span>
        <span className="truncate text-kecil text-ungu-muda">{ket}</span>
      </span>
      <span aria-hidden="true" className="text-ungu-muda transition-transform group-open/map:rotate-90"><Ikon nama="panah" className="size-4" /></span>
    </summary>
    <div className="flex flex-col gap-2 px-4 pt-1 pb-4">{children}</div>
  </details>
}

/** Grafik pil 14 hari (komponen sama dengan beranda/laporan keluarga). */
function Tren({ sesi }: { sesi: Detail["sesi"] }) {
  const hariIni = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10)
  const batang: BatangPil[] = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() + 7 * 3600000 - (13 - i) * 86400000).toISOString().slice(0, 10)
    const isi = sesi.filter((s) => s.tanggal === d)
    return { label: String(Number(d.slice(8, 10))), diterima: isi.reduce((n, s) => n + s.diterima, 0),
      ditolak: isi.reduce((n, s) => n + s.ditolak, 0), ada: isi.length > 0, sorot: d === hariIni }
  })
  return <GrafikPil batang={batang} judul="Suapan per Hari, 14 Hari Terakhir" tinggi={150} />
}
