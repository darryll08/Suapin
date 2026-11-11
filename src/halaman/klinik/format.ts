export const usia = (bulan: number) => Math.floor(bulan / 12) + " th " + bulan % 12 + " bln"
export const pesan = (galat: unknown) => galat instanceof Error ? galat.message : "Terjadi kesalahan. Coba lagi."
