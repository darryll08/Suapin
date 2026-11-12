// Overview satu anak untuk dokter (/dokter/pasien/:id): ringkasan, tren 14 hari, jadwal, aturan, resep, riwayat sesi.
import { useState } from "react"
import { Navigate, useParams } from "react-router"
import { cariMakanan } from "../../../bersama/konten/makanan"
import type { Keluaran } from "../../../bersama/kontrak/api"
import { FormResep } from "../../komponen/klinik/form-resep"
import { TabelSesi } from "../../komponen/klinik/tabel-sesi"
import { Memuat, PesanGalat, Pil, Tombol } from "../../komponen/dasar"
import { bento } from "../../gaya/gaya"
import { GalatApi, panggil, usePanggil } from "../../lib/panggil"
import { hariRelatif, jam, LABEL_JADWAL, LABEL_STATUS, labelRingkasan, persen, pesan, tanggal, usia } from "./format"
import { Angka, Avatar, BilahTerima, TataLetakPanel, TautanKembali } from "./tata-letak"

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
  if (galat instanceof GalatApi && galat.status === 401) return <Navigate to="/masuk" replace />
  if (!data) return <TataLetakPanel peran="dokter">
    <TautanKembali ke="/dokter">Semua pasien</TautanKembali>
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
    <TautanKembali ke="/dokter">Semua pasien</TautanKembali>

    <section className={`${bento} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
      <div className="flex items-center gap-4">
        <Avatar nama={data.child.panggilan} besar />
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-judul text-judul font-bold">{data.child.panggilan}</h1>
          <p className="text-isi text-ungu-muda">{usia(data.child.usia_bulan)} · Pengasuh {SAPAAN[data.pengasuh.sapaan]} {data.pengasuh.nama.replace(/^(Mbak|Bu|Oma|Ayah)\s+/i, "")}</p>
          <div className="flex flex-wrap gap-2">
            <Pil>Tahap {data.child.stage} · {NAMA_TAHAP[data.child.stage - 1]}</Pil>
            {data.siap_naik_tahap && <Pil>Siap naik tahap</Pil>}
            {data.saran_turun_tahap && <Pil nada="jagung">Saran turun tahap</Pil>}
          </div>
        </div>
      </div>
      {data.siap_naik_tahap && aktif.stage < 4 &&
        <Tombol memuat={aksi === "tahap"} disabled={!!aksi} onClick={() => void jalankan("tahap")}>Naikkan ke tahap {aktif.stage + 1}</Tombol>}
    </section>
    {sukses && <p className={`${bento} border-ungu bg-ungu-tint font-semibold`} role="status">{sukses}</p>}
    {galatAksi && <PesanGalat pesan={galatAksi} />}

    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Angka utama">
      <Angka label="Sesi 28 hari" nilai={data.sesi.length} />
      <Angka label="Diterima 7 hari" nilai={persen(masuk7, tolak7) + "%"} ket={`${masuk7} dari ${masuk7 + tolak7} suapan`} />
      <Angka label="Ngemut dikonfirmasi" nilai={data.ngemut_dikonfirmasi} ket="28 hari" />
      <Angka label="Kontrol berikutnya" nilai={mendatang[0] ? hariRelatif(mendatang[0].waktu) : "—"}
        ket={mendatang[0] ? `${jam(mendatang[0].waktu)} · ${LABEL_JADWAL[mendatang[0].jenis]}` : "belum dijadwalkan"} />
    </section>

    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-6">
        <Tren sesi={data.sesi} />
        <section className={`${bento} flex flex-col gap-3`}>
          <h2 className="font-judul text-subjudul font-bold">Ringkasan minggu ini</h2>
          {data.ringkasan_dokter ? <>
            <Pil nada="netral">{labelRingkasan(data.ringkasan_sumber)}</Pil>
            <p className="text-isi">{data.ringkasan_dokter}</p>
          </> : <>
            <p className="text-ungu-muda">Belum ada ringkasan untuk minggu ini.</p>
            <Tombol varian="kedua" memuat={aksi === "ringkasan"} disabled={!!aksi} onClick={() => void jalankan("ringkasan")} className="self-start">Buat ringkasan</Tombol>
          </>}
        </section>
        <div className="suapin-klinik flex flex-col gap-6">
          <FormResep id={id} aktif={aktif} selesai={() => { setSukses("Aturan baru berlaku di sesi berikutnya."); ulang() }} />
          <section className="suapin-kartu">
            <h2>Riwayat sesi 28 hari</h2>
            <TabelSesi sesi={data.sesi} lengkap />
          </section>
        </div>
      </div>

      <aside className="flex min-w-0 flex-col gap-6">
        <section className={`${bento} flex flex-col gap-3`} aria-labelledby="judul-jadwal-anak">
          <h2 id="judul-jadwal-anak" className="font-judul text-subjudul font-bold">Jadwal</h2>
          {!data.jadwal.length && <p className="text-ungu-muda">Belum ada jadwal.</p>}
          <ol className="flex flex-col divide-y divide-garis/50">
            {[...mendatang, ...lewat].map((j) => <li key={j.id} className="flex flex-col gap-1 py-3">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{tanggal(j.waktu)}, {jam(j.waktu)}</span>
                <Pil nada={j.status === "terjadwal" ? "ungu" : j.status === "batal" ? "jagung" : "netral"}>{LABEL_STATUS[j.status]}</Pil>
              </span>
              <span className="text-kecil text-ungu-muda">{LABEL_JADWAL[j.jenis]}{j.catatan ? " · " + j.catatan : ""}</span>
            </li>)}
          </ol>
        </section>

        <section className={`${bento} flex flex-col gap-3`}>
          <h2 className="font-judul text-subjudul font-bold">Aturan aktif</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-isi">
            <dt className="text-ungu-muda">Sumber</dt><dd>{data.aturan_aktif.source === "dokter" ? "Dokter" : "Default program"}</dd>
            <dt className="text-ungu-muda">Lama sesi</dt><dd>maks {aktif.max_minutes} menit</dd>
            <dt className="text-ungu-muda">Naik tahap</dt><dd>{aktif.advance_rule.sessions} sesi × min {aktif.advance_rule.min_accepted_bites} suapan</dd>
            <dt className="text-ungu-muda">Akhiri bila</dt><dd>menolak {aktif.end_after_refusal_minutes} menit</dd>
            <dt className="text-ungu-muda">Saat ngemut</dt><dd>{aktif.ngemut_hint}</dd>
          </dl>
          {data.riwayat_aturan.length > 1 && <details className="text-isi">
            <summary className="min-h-12 cursor-pointer py-3 font-semibold">Riwayat aturan ({data.riwayat_aturan.length})</summary>
            <ol className="flex flex-col gap-2">
              {data.riwayat_aturan.map((r, i) => <li key={r.confirmed_at + i} className="rounded-kartu bg-latar p-3">
                <span className="text-kecil font-semibold">{tanggal(r.confirmed_at)} · {r.source === "dokter" ? "Dokter" : "Default"}</span>
                <p className="text-kecil text-ungu-muda">{r.source_text || "Aturan program default"}</p>
              </li>)}
            </ol>
          </details>}
        </section>

        <section className={`${bento} flex flex-col gap-3`}>
          <h2 className="font-judul text-subjudul font-bold">Paparan makanan</h2>
          {!data.paparan.length && <p className="text-ungu-muda">Belum ada makanan baru yang dicoba.</p>}
          {data.paparan.map((p) => <div key={p.makanan} className="flex flex-col gap-1">
            <span className="flex justify-between text-isi"><span>{cariMakanan(p.makanan).nama}</span><span className="tabular-nums">{p.jumlah}/{p.target}</span></span>
            <div className="h-2 overflow-hidden rounded-full bg-garis/40"><div className="h-full rounded-full bg-jagung" style={{ width: Math.min(100, p.jumlah / p.target * 100) + "%" }} /></div>
          </div>)}
          <p className="text-kecil text-ungu-muda">Target 10 kali paparan per makanan baru.</p>
        </section>

        {data.skrining_terakhir && <section className={`${bento} flex flex-col gap-2`}>
          <h2 className="font-judul text-subjudul font-bold">Skrining</h2>
          <p className="text-isi">{data.skrining_terakhir.ada_tanda_bahaya ? "Ada tanda bahaya yang perlu diperiksa." : "Tidak ada tanda bahaya."}</p>
          <p className="text-kecil text-ungu-muda">Terakhir diisi {tanggal(data.skrining_terakhir.tanggal)}</p>
        </section>}
      </aside>
    </div>
    <p className="text-kecil text-ungu-muda">Yang diukur adalah perilaku menerima suapan. Porsi berasal dari catatan pengasuh.</p>
  </TataLetakPanel>
}

/** Bilah harian 14 hari: tinggi = jumlah suapan, ungu = diterima, kerupuk = ditolak. Tanpa animasi. */
function Tren({ sesi }: { sesi: Detail["sesi"] }) {
  const hari = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() + 7 * 3600000 - (13 - i) * 86400000).toISOString().slice(0, 10)
    const isi = sesi.filter((s) => s.tanggal === d)
    return { d, masuk: isi.reduce((n, s) => n + s.diterima, 0), tolak: isi.reduce((n, s) => n + s.ditolak, 0) }
  })
  const maks = Math.max(1, ...hari.map((h) => h.masuk + h.tolak))
  const total = hari.reduce((t, h) => ({ masuk: t.masuk + h.masuk, tolak: t.tolak + h.tolak }), { masuk: 0, tolak: 0 })
  return <section className={`${bento} flex flex-col gap-4`} aria-labelledby="judul-tren">
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 id="judul-tren" className="font-judul text-subjudul font-bold">Suapan 14 hari</h2>
      <span className="flex gap-3 text-kecil text-ungu-muda">
        <span className="inline-flex items-center gap-1"><span className="size-3 rounded-sm bg-ungu" />Diterima</span>
        <span className="inline-flex items-center gap-1"><span className="size-3 rounded-sm bg-garis" />Ditolak</span>
      </span>
    </div>
    <ol className="grid h-40 grid-cols-14 items-end gap-1 sm:gap-2" aria-label="Jumlah suapan per hari">
      {hari.map((h) => <li key={h.d} className="flex h-full flex-col justify-end gap-px" title={`${tanggal(h.d + "T00:00:00+07:00")}: ${h.masuk} diterima, ${h.tolak} ditolak`}>
        <span className="sr-only">{tanggal(h.d + "T00:00:00+07:00")}: {h.masuk} diterima, {h.tolak} ditolak</span>
        <span className="rounded-t-sm bg-garis" style={{ height: h.tolak / maks * 100 + "%" }} />
        <span className={`bg-ungu ${h.tolak ? "" : "rounded-t-sm"}`} style={{ height: h.masuk / maks * 100 + "%" }} />
      </li>)}
    </ol>
    <div className="flex justify-between text-kecil text-ungu-muda" aria-hidden="true">
      <span>{tanggal(hari[0]!.d + "T00:00:00+07:00")}</span><span>Hari ini</span>
    </div>
    <BilahTerima diterima={total.masuk} ditolak={total.tolak} />
  </section>
}
