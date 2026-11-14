import type { Keluaran } from "../../../bersama/kontrak/api"
import { cariMakanan } from "../../../bersama/konten/makanan"

type Sesi = Keluaran<"pasienDetail">["sesi"][number]
const alasan: Record<Sesi["alasan_selesai"], string> = {
  waktu_habis: "Waktu habis", terlalu_lama_menolak: "Menolak terlalu lama",
  stop: "Selesai", stop_darurat: "Stop darurat",
}

// Format sesuai UI UX Guidelines 14.3: "Sen, 9 Nov", "07.00", "18 mnt".
const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
export function tanggalPendek(iso: string) {
  const [t, b, h] = iso.split("-").map(Number)
  if (!t || !b || !h) return iso
  return HARI[new Date(Date.UTC(t, b - 1, h)).getUTCDay()] + ", " + h + " " + BULAN[b - 1]
}
const jam = (j: string) => j.replace(":", ".")
const menu = (id: string) => id === "umum" ? "Menu lain" : cariMakanan(id).id === id ? cariMakanan(id).nama : id
const durasi = (detik: number) => Math.round(detik / 60) + " mnt"

export function TabelSesi({ sesi, lengkap = false }: {
  sesi: (Omit<Sesi, "alasan_selesai"> & Partial<Pick<Sesi, "alasan_selesai">>)[]
  lengkap?: boolean
}) {
  if (!sesi.length) return <p>Belum ada sesi dalam periode ini.</p>
  return <>
    {/* Laptop: tabel. HP (≤ 700 px, lihat klinik.css): daftar kartu supaya semua kolom terlihat tanpa geser. */}
    <div className="suapin-tabel" tabIndex={0} role="region" aria-label="Tabel sesi makan">
      <table>
        <thead><tr>
          {["Tanggal", "Jam", "Menu"].map((judul) => <th key={judul} scope="col">{judul}</th>)}
          {["Diterima", "Ditolak", "Ngemut", "Durasi"].map((judul) => <th key={judul} scope="col" className="suapin-angka">{judul}</th>)}
          {lengkap && <th scope="col">Alasan selesai</th>}
        </tr></thead>
        <tbody>{sesi.map((row, i) => <tr key={row.tanggal + row.jam + i}>
          <td>{tanggalPendek(row.tanggal)}</td><td>{jam(row.jam)}</td><td>{menu(row.menu)}</td>
          <td className="suapin-angka">{row.diterima}</td><td className="suapin-angka">{row.ditolak}</td>
          <td className="suapin-angka">{row.ngemut}</td><td className="suapin-angka">{durasi(row.durasi)}</td>
          {lengkap && <td>{row.alasan_selesai && alasan[row.alasan_selesai]}</td>}
        </tr>)}</tbody>
      </table>
    </div>
    <ul className="suapin-sesi-hp" aria-label="Daftar sesi makan">
      {sesi.map((row, i) => <li key={row.tanggal + row.jam + i}>
        <strong>{tanggalPendek(row.tanggal)} · {jam(row.jam)} · {menu(row.menu)}</strong>
        <span>{row.diterima} diterima · {row.ditolak} ditolak · {row.ngemut} ngemut · {durasi(row.durasi)}</span>
        {lengkap && row.alasan_selesai && <span>{alasan[row.alasan_selesai]}</span>}
      </li>)}
    </ul>
  </>
}
