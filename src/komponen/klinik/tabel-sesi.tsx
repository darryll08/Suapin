import type { Keluaran } from "../../../bersama/kontrak/api"

type Sesi = Keluaran<"pasienDetail">["sesi"][number]
const alasan: Record<Sesi["alasan_selesai"], string> = {
  waktu_habis: "Waktu habis", terlalu_lama_menolak: "Menolak terlalu lama",
  stop: "Dihentikan", stop_darurat: "Stop darurat",
}
export function TabelSesi({ sesi, lengkap = false }: {
  sesi: (Omit<Sesi, "alasan_selesai"> & Partial<Pick<Sesi, "alasan_selesai">>)[]
  lengkap?: boolean
}) {
  if (!sesi.length) return <p>Belum ada sesi dalam periode ini.</p>
  return <div className="suapin-tabel" tabIndex={0} role="region" aria-label="Tabel sesi makan">
    <table>
      <thead><tr>{["Tanggal", "Jam", "Menu", "Diterima", "Ditolak", "Ngemut", "Durasi",
        ...(lengkap ? ["Alasan selesai"] : [])].map((judul) => <th key={judul} scope="col">{judul}</th>)}</tr></thead>
      <tbody>{sesi.map((row, i) => <tr key={row.tanggal + row.jam + i}>
        <td>{row.tanggal}</td><td>{row.jam}</td><td>{row.menu}</td>
        <td>{row.diterima}</td><td>{row.ditolak}</td><td>{row.ngemut}</td>
        <td>{Math.floor(row.durasi / 60)} m {row.durasi % 60} d</td>
        {lengkap && <td>{row.alasan_selesai && alasan[row.alasan_selesai]}</td>}
      </tr>)}</tbody>
    </table>
  </div>
}
