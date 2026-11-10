import { useState } from "react"
import { Link, Navigate, useParams } from "react-router"
import { FormResep } from "../../komponen/klinik/form-resep"
import { TabelSesi } from "../../komponen/klinik/tabel-sesi"
import { GalatApi, panggil, usePanggil } from "../../lib/panggil"
import { pesan, usia } from "./tata-letak"

export function Pasien() {
  const { id = "" } = useParams()
  return <DetailPasien key={id} id={id} />
}

function DetailPasien({ id }: { id: string }) {
  const { data, galat, memuat, ulang } = usePanggil("pasienDetail", { params: { id } })
  const [aksi, setAksi] = useState<"ringkasan" | "tahap" | null>(null)
  const [galatAksi, setGalatAksi] = useState("")
  const [sukses, setSukses] = useState("")
  if (galat instanceof GalatApi && galat.status === 401) return <Navigate to="/klinik/masuk" replace />
  if (!data) return memuat ? <p role="status">Memuat pasien…</p> :
    <p role="alert">{galat?.message} <button type="button" onClick={ulang}>Coba lagi</button></p>

  const aktif = data.aturan_aktif.aturan
  async function jalankan(jenis: NonNullable<typeof aksi>) {
    setAksi(jenis)
    setGalatAksi("")
    setSukses("")
    try {
      if (jenis === "ringkasan") {
        await panggil("ringkasanBuat", { params: { childId: id } })
      } else {
        await panggil("aturanKonfirmasi", { body: {
          child_id: id, aturan: { ...aktif, stage: aktif.stage + 1 }, source_text: "Tahap dinaikkan oleh dokter.",
        } })
        setSukses("Aturan baru berlaku di sesi berikutnya.")
      }
      ulang()
    } catch (error) { setGalatAksi(pesan(error)) }
    finally { setAksi(null) }
  }
  return <>
    <Link to="/klinik/pasien">Kembali ke pasien</Link>
    <div className="suapin-baris">
      <div><h1>{data.child.panggilan}</h1><p>{usia(data.child.usia_bulan)} · Tahap {data.child.stage}</p></div>
      {data.siap_naik_tahap && aktif.stage < 4 && <button type="button" disabled={!!aksi} onClick={() => void jalankan("tahap")}>
        Naikkan ke tahap {aktif.stage + 1}</button>}
      {data.saran_turun_tahap && <p className="suapin-pil suapin-peringatan">Saran turun tahap</p>}
    </div>
    {sukses && <p className="suapin-kartu" role="status">{sukses}</p>}
    {galatAksi && <p role="alert">{galatAksi}</p>}
    <FormResep id={id} aktif={aktif} selesai={() => { setSukses("Aturan baru berlaku di sesi berikutnya."); ulang() }} />
    <section className="suapin-kartu">
      <h2>Ringkasan dokter minggu ini</h2>
      {data.ringkasan_dokter ? <><small className="suapin-pil">Dibuat oleh AI dari data sesi</small><p>{data.ringkasan_dokter}</p></> :
        <button type="button" disabled={!!aksi} onClick={() => void jalankan("ringkasan")}>
          {aksi === "ringkasan" ? "Membuat ringkasan…" : "Buat ringkasan"}</button>}
    </section>
    <section className="suapin-kartu">
      <h2>Progres 28 hari</h2>
      <p>Ngemut dikonfirmasi: {data.ngemut_dikonfirmasi}</p>
      {data.paparan.length > 0 && <ul>{data.paparan.map((p) => <li key={p.makanan}>{p.makanan} dicoba {p.jumlah}/{p.target}</li>)}</ul>}
      <TabelSesi sesi={data.sesi} lengkap />
    </section>
    <section className="suapin-kartu"><h2>Riwayat aturan</h2>
      {data.riwayat_aturan.length === 0 && <p>Belum ada perubahan aturan.</p>}
      {data.riwayat_aturan.map((row, i) => <details key={row.confirmed_at + i}>
        <summary>{new Date(row.confirmed_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} · {row.source === "dokter" ? "Dokter" : "Default"}</summary>
        <p>{row.source_text || "Aturan program default"}</p>
      </details>)}
    </section>
    <p><small>Yang diukur adalah perilaku menerima suapan. Porsi berasal dari catatan pengasuh.</small></p>
  </>
}
