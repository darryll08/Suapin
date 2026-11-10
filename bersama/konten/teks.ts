// Pemilik: B (Satya). Daftar id dikunci di I0 (jobdesk 2.6): boleh ditambah, tidak boleh dihapus.
// Diisi awal oleh A karena `bersama/kontrak/sesi.ts` membutuhkan `IdTeks`. Teks ini untuk pengasuh,
// tampil di strip bawah layar sesi tanpa suara. Berstatus DRAF sampai ditinjau.
import { z } from "zod";

export const IdTeks = z.enum([
  "jangan_dibujuk",
  "tadi_masuk",
  "ngemut",
  "masih_ngunyah_tunggu",
  "tawarkan_suapan_kecil",
  "akhiri_tidak_apa",
  "waktu_habis",
  "wajah_tidak_terlihat",
  "saran_ngemut",
]);
export type IdTeks = z.infer<typeof IdTeks>;

export const TEKS: Record<IdTeks, { isi: string; tanya: boolean }> = {
  jangan_dibujuk: { isi: "Jangan dibujuk. Tawarkan lagi sebentar lagi.", tanya: false },
  tadi_masuk: { isi: "Tadi masuk? Ya / Tidak", tanya: true },
  ngemut: { isi: "Sepertinya ngemut? Ya / Tidak", tanya: true },
  masih_ngunyah_tunggu: { isi: "Masih ngunyah, tunggu.", tanya: false },
  tawarkan_suapan_kecil: { isi: "Tawarkan suapan kecil.", tanya: false },
  akhiri_tidak_apa: { isi: "Sudah lama menolak. Akhiri makan, tidak apa-apa.", tanya: false },
  waktu_habis: { isi: "Waktu habis. Akhiri dengan senang.", tanya: false },
  wajah_tidak_terlihat: { isi: "Wajah tidak terlihat. Geser HP atau tambah cahaya.", tanya: false },
  // Isi diambil dari `aturan.ngemut_hint` saat sesi berjalan.
  saran_ngemut: { isi: "", tanya: false },
};
