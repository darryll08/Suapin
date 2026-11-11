import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { TabelSesi } from "../../komponen/klinik/tabel-sesi"
import { GalatApi, panggil, usePanggil } from "../../lib/panggil"
import { labelRingkasan, pesan, usia } from "../klinik/format"

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
      void navigate("/klinik/pasien/" + hasil.child_id)
    } catch (error) { setGalatAksi(pesan(error)) }
    finally { setSibuk(false) }
  }
  return <main className="suapin-klinik">
    <p className="suapin-merek">Suapin</p>
    <h1>Laporan makan dari keluarga</h1>
    {memuat && <p role="status">Memuat laporan…</p>}
    {galat && <p role="alert">{galat instanceof GalatApi && galat.status === 404
      ? "Link tidak berlaku. Minta keluarga membagikan link baru." : galat.message}</p>}
    {data && <>
      <section className="suapin-kartu suapin-baris">
        <div><h2>{data.child.panggilan}</h2><p>{usia(data.child.usia_bulan)} · Tahap {data.tahap}</p></div>
        {data.pasien_saya === undefined ? <Link className="suapin-tombol" to={"/klinik/masuk?kembali=" + encodeURIComponent("/r/" + token)}>
          Masuk sebagai dokter</Link> :
          data.pasien_saya ? <><small className="suapin-pil">Pasien Anda</small>
            <button type="button" disabled={sibuk} onClick={() => void klaim()}>Buka di dashboard</button></> :
            data.sudah_pasien_klinik ? <p>Anak ini sudah menjadi pasien klinik lain.</p> :
              <button type="button" className="suapin-utama" disabled={sibuk} onClick={() => void klaim()}>
                {sibuk ? "Menyimpan…" : "Jadikan pasien saya"}</button>}
      </section>
      {galatAksi && <p role="alert">{galatAksi}</p>}
      {data.ringkasan_dokter && <section className="suapin-kartu"><h2>Ringkasan dokter</h2>
        <small className="suapin-pil">{labelRingkasan(data.ringkasan_sumber)}</small><p>{data.ringkasan_dokter}</p></section>}
      <section className="suapin-kartu"><h2>Sesi 14 hari terakhir</h2><TabelSesi sesi={data.sesi} /></section>
    </>}
  </main>
}
