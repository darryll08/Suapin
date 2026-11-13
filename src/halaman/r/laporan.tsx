// Laporan yang dibagikan keluarga (/r/:token). Dokter yang sudah masuk bisa menekan "Jadikan pasien saya".
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { TabelSesi } from "../../komponen/klinik/tabel-sesi"
import { Memuat, PesanGalat, Pil, Tombol } from "../../komponen/dasar"
import { bento, tombolKedua } from "../../gaya/gaya"
import { GalatApi, panggil, usePanggil } from "../../lib/panggil"
import { Logo } from "../keluarga/tata-letak"
import { labelRingkasan, pesan, usia } from "../klinik/format"
import { Avatar, BilahTerima } from "../klinik/tata-letak"
import "../klinik/klinik.css"

export function LaporanBagikan() {
  const { token = "" } = useParams()
  const { data, galat, memuat } = usePanggil("laporanToken", { params: { token } })
  const navigate = useNavigate()
  const [sibuk, setSibuk] = useState(false)
  const [galatAksi, setGalatAksi] = useState("")
  async function klaim() {
    setSibuk(true)
    setGalatAksi("")
    try {
      const hasil = await panggil("pasienKlaim", { params: { token } })
      void navigate("/dokter/pasien/" + hasil.child_id)
    } catch (error) { setGalatAksi(pesan(error)) }
    finally { setSibuk(false) }
  }
  const masuk = data?.sesi.reduce((n, s) => n + s.diterima, 0) ?? 0
  const tolak = data?.sesi.reduce((n, s) => n + s.ditolak, 0) ?? 0
  return <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-12">
    <header className="pt-3"><Logo ke="/" /></header>
    <div className="flex flex-col gap-1">
      <h1 className="font-judul text-judul font-bold">Laporan Makan dari Keluarga</h1>
      <p className="text-isi text-ungu-muda">Dibagikan lewat Suapin. Tanpa video, hanya hasil tiap suapan.</p>
    </div>
    {memuat && <Memuat teks="Memuat laporan…" />}
    {galat && <PesanGalat pesan={galat instanceof GalatApi && galat.status === 404
      ? "Link tidak berlaku. Minta keluarga membagikan link baru." : galat.message} />}
    {data && <>
      <section className={`${bento} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="flex items-center gap-4">
          <Avatar nama={data.child.panggilan} besar />
          <div className="flex flex-col gap-1">
            <h2 className="font-judul text-subjudul font-bold">{data.child.panggilan}</h2>
            <p className="text-ungu-muda">{usia(data.child.usia_bulan)} · Tahap {data.tahap}</p>
          </div>
        </div>
        {data.pasien_saya === undefined
          ? <Link className={tombolKedua} to={"/masuk?kembali=" + encodeURIComponent("/r/" + token)}>Masuk sebagai Dokter</Link>
          : data.pasien_saya ? <div className="flex flex-col items-start gap-2 sm:items-end"><Pil>Pasien Anda</Pil>
            <Tombol varian="kedua" memuat={sibuk} onClick={() => void klaim()}>Buka di dashboard</Tombol></div>
          : data.sudah_pasien_klinik ? <p className="text-jagung-tua">Anak ini sudah ditangani dokter lain.</p>
          : <Tombol memuat={sibuk} onClick={() => void klaim()}>Jadikan pasien saya</Tombol>}
      </section>
      {galatAksi && <PesanGalat pesan={galatAksi} />}
      <section className={`${bento} flex flex-col gap-2`}>
        <h2 className="font-judul text-subjudul font-bold">14 Hari Terakhir</h2>
        <BilahTerima diterima={masuk} ditolak={tolak} />
      </section>
      {data.ringkasan_dokter && <section className={`${bento} flex flex-col gap-2`}>
        <h2 className="font-judul text-subjudul font-bold">Ringkasan untuk Dokter</h2>
        <Pil nada="netral">{labelRingkasan(data.ringkasan_sumber)}</Pil>
        <p>{data.ringkasan_dokter}</p>
      </section>}
      <section className="suapin-klinik suapin-kartu"><h2>Sesi 14 Hari Terakhir</h2><TabelSesi sesi={data.sesi} /></section>
    </>}
  </main>
}
