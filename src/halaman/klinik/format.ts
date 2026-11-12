import type { Keluaran } from "../../../bersama/kontrak/api"

export const usia = (bulan: number) => Math.floor(bulan / 12) + " th " + bulan % 12 + " bln"
export const pesan = (galat: unknown) => galat instanceof Error ? galat.message : "Terjadi kesalahan. Coba lagi."

export function labelRingkasan(sumber?: Keluaran<"ringkasanBuat">["sumber"]) {
  if (sumber === "template") return "Ringkasan otomatis dari data sesi"
  return sumber ? "Dibuat oleh AI dari data sesi" : "Ringkasan dari data sesi"
}

const WIB = { timeZone: "Asia/Jakarta" } as const
const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
const bagianWib = (iso: string) => {
  const d = new Date(Date.parse(iso) + 7 * 3600000)
  return { hari: d.getUTCDay(), tgl: d.getUTCDate(), bln: d.getUTCMonth(), jam: d.getUTCHours(), mnt: d.getUTCMinutes(),
    kunci: d.toISOString().slice(0, 10) }
}
/** Bagian tanggal WIB untuk lencana kalender: { hari: "Sen", tgl: "9", bln: "Nov" }. */
export function bagianTanggal(iso: string) {
  const b = bagianWib(iso)
  return { hari: HARI[b.hari]!, tgl: String(b.tgl), bln: BULAN[b.bln]! }
}
/** "Sen, 9 Nov" (UI UX 15: tanggal pendek). */
export function tanggal(iso: string) {
  const b = bagianWib(iso)
  return `${HARI[b.hari]}, ${b.tgl} ${BULAN[b.bln]}`
}
/** "07.00" */
export function jam(iso: string) {
  const b = bagianWib(iso)
  return String(b.jam).padStart(2, "0") + "." + String(b.mnt).padStart(2, "0")
}
/** "Hari ini", "Besok", "Kemarin", atau "Sen, 9 Nov". */
export function hariRelatif(iso: string, kecil = false) {
  const teks = hariRelatifBesar(iso)
  return kecil && !/^\w{3}, /.test(teks) ? teks.toLowerCase() : teks
}
function hariRelatifBesar(iso: string) {
  const kunci = bagianWib(iso).kunci
  const hariIni = bagianWib(new Date().toISOString()).kunci
  const selisih = Math.round((Date.parse(kunci) - Date.parse(hariIni)) / 86400000)
  if (selisih === 0) return "Hari ini"
  if (selisih === 1) return "Besok"
  if (selisih === -1) return "Kemarin"
  if (selisih < -1 && selisih > -7) return -selisih + " hari lalu"
  return tanggal(iso)
}
export const LABEL_JADWAL = { konsultasi_awal: "Konsultasi awal", kontrol: "Kontrol", evaluasi_tahap: "Evaluasi tahap" } as const
export const LABEL_STATUS = { terjadwal: "Terjadwal", selesai: "Selesai", batal: "Batal" } as const
export const persen = (a: number, b: number) => a + b ? Math.round(a / (a + b) * 100) : 0
export { WIB }
