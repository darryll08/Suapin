// Pemilik: B (Satya). Daftar id dikunci di I0 (jobdesk 2.6): boleh ditambah, tidak boleh dihapus.
// Diisi awal oleh A karena `bersama/kontrak/sesi.ts` membutuhkan `IdKlip`. Semua kalimat berstatus DRAF
// sampai ditinjau dokter anak atau ahli gizi. File MP3: public/klip/<id>.mp3, variasi <id>__2.mp3.
import { z } from "zod";

export const IdKlip = z.enum([
  "sapa_awal",
  "kenalan_makanan",
  "ajak_makan_bareng",
  "karakter_enak",
  "giliranmu",
  "mbak_gigit_duluan",
  "hore",
  "tos_mbak",
  "masih_ngunyah",
  "nanti_lagi",
  "waktunya_selesai",
  "penutup",
]);
export type IdKlip = z.infer<typeof IdKlip>;

export type Sapaan = "mbak" | "bu" | "oma" | "ayah";

export const KLIP: Record<IdKlip, { kalimat: string; variasi: string[]; sapaan?: Sapaan }> = {
  sapa_awal: { kalimat: "Halo! Lihat aku dulu ya!", variasi: [] },
  kenalan_makanan: { kalimat: "Ini brokoli. Wanginya segar!", variasi: [] },
  ajak_makan_bareng: { kalimat: "Nanti kita makan bareng ya!", variasi: [] },
  karakter_enak: { kalimat: "Hmm, enak!", variasi: [] },
  giliranmu: { kalimat: "Sekarang giliranmu!", variasi: [] },
  mbak_gigit_duluan: { kalimat: "Mbak, gigit duluan ya, biar dia lihat!", variasi: [], sapaan: "mbak" },
  hore: { kalimat: "Hore, hebat!", variasi: [] },
  tos_mbak: { kalimat: "Tos dulu sama Mbak!", variasi: [], sapaan: "mbak" },
  masih_ngunyah: { kalimat: "Kita tunggu ya, masih ngunyah.", variasi: [] },
  nanti_lagi: { kalimat: "Nanti lagi ya.", variasi: [] },
  waktunya_selesai: { kalimat: "Waktunya selesai. Terima kasih sudah makan bareng!", variasi: [] },
  penutup: { kalimat: "Kamu dapat stiker!", variasi: [] },
};
