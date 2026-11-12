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

// 12 Nov: kalimat dibuat lebih natural untuk balita (yuk, nyam, yeay) dan diberi variasi supaya tidak diulang persis.
// Klip `mbak_gigit_duluan` dan `tos_mbak` sengaja tanpa sapaan, jadi cocok untuk Mbak, Bu, Oma, atau Ayah.
// `nanti_lagi` sengaja satu kalimat datar tanpa variasi (penolakan tidak dijadikan hadiah).
export const KLIP: Record<IdKlip, { kalimat: string; variasi: string[]; sapaan?: Sapaan }> = {
  sapa_awal: { kalimat: "Hai! Lihat aku, yuk!", variasi: ["Halo! Aku di sini, lho!"] },
  kenalan_makanan: { kalimat: "Wah, ini makanan kita hari ini!", variasi: [] },
  ajak_makan_bareng: { kalimat: "Yuk, nanti kita makan sama-sama!", variasi: [] },
  karakter_enak: { kalimat: "Nyam, nyam… enak!", variasi: ["Hmm, enak banget!", "Nyam! Lembut, lho."] },
  giliranmu: { kalimat: "Sekarang giliranmu!", variasi: ["Ayo, kamu juga!", "Giliranmu, yuk!"] },
  mbak_gigit_duluan: { kalimat: "Yuk, semuanya ikut gigit!", variasi: ["Ayo, kita gigit bareng!"] },
  hore: { kalimat: "Yeay, hebat!", variasi: ["Wah, pintar!", "Mantap!"] },
  tos_mbak: { kalimat: "Tos dulu, yuk!", variasi: ["Ayo, tos!"] },
  masih_ngunyah: { kalimat: "Kunyah dulu, ya. Nyam, nyam.", variasi: ["Pelan-pelan aja, ya."] },
  nanti_lagi: { kalimat: "Oke. Nanti lagi.", variasi: [] },
  waktunya_selesai: { kalimat: "Udah selesai. Makasih udah makan bareng aku!", variasi: [] },
  penutup: { kalimat: "Yeay, kamu dapat stiker!", variasi: ["Lihat, ada stiker buat kamu!"] },
};
