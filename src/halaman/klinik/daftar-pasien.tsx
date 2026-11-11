import { Link, Navigate } from "react-router"
import { GalatApi, usePanggil } from "../../lib/panggil"
import { usia } from "./format"

export function DaftarPasien() {
  const { data, galat, memuat, ulang } = usePanggil("pasienDaftar")
  if (galat instanceof GalatApi && galat.status === 401) return <Navigate to="/klinik/masuk" replace />
  const pasien = [...(data?.pasien ?? [])].sort((a, b) =>
    Number(b.siap_naik_tahap || b.saran_turun_tahap) - Number(a.siap_naik_tahap || a.saran_turun_tahap) ||
    a.panggilan.localeCompare(b.panggilan, "id"))
  return <>
    <h1>Pasien</h1>
    {memuat && <p role="status">Memuat daftar pasien…</p>}
    {galat && <p role="alert">{galat.message} <button type="button" onClick={ulang}>Coba lagi</button></p>}
    {data && !pasien.length && <p className="suapin-kartu">Belum ada pasien. Buka link laporan yang dibagikan keluarga, lalu tekan Jadikan pasien saya.</p>}
    {!!pasien.length && <ul className="suapin-pasien">
      <li className="suapin-kolom" aria-hidden="true">
        {["Panggilan", "Usia", "Tahap", "Sesi 7 hari", "Diterima", "Ditolak", "Aturan dan status"].map((teks) => <span key={teks}>{teks}</span>)}
      </li>
      {pasien.map((p) => <li key={p.id}><Link className="suapin-kolom suapin-kartu" to={"/klinik/pasien/" + p.id}>
        <strong>{p.panggilan}</strong><span>{usia(p.usia_bulan)}</span><span>Tahap {p.tahap}</span>
        <span>{p.sesi_7_hari} sesi</span><span>{p.diterima_7_hari} diterima</span><span>{p.ditolak_7_hari} ditolak</span>
        <span>{p.source_aturan === "dokter" ? "Dokter" : "Default"}
          {p.siap_naik_tahap && <small className="suapin-pil">Siap naik tahap</small>}
          {p.saran_turun_tahap && <small className="suapin-pil suapin-peringatan">Saran turun tahap</small>}
        </span>
      </Link></li>)}
    </ul>}
  </>
}
