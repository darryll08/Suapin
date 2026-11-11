import type { Keluaran } from "../../../bersama/kontrak/api"

export const usia = (bulan: number) => Math.floor(bulan / 12) + " th " + bulan % 12 + " bln"
export const pesan = (galat: unknown) => galat instanceof Error ? galat.message : "Terjadi kesalahan. Coba lagi."

export function labelRingkasan(sumber?: Keluaran<"ringkasanBuat">["sumber"]) {
  if (sumber === "template") return "Ringkasan otomatis dari data sesi"
  return sumber ? "Dibuat oleh AI dari data sesi" : "Ringkasan dari data sesi"
}
