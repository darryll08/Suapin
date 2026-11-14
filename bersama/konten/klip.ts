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
  // 14 Nov: babak tambahan pemanasan (pemanasan.tsx) supaya intro tidak sepi.
  "intip_makanan",
  "cium_wangi",
  "berani_coba",
]);
export type IdKlip = z.infer<typeof IdKlip>;

export type Sapaan = "mbak" | "bu" | "oma" | "ayah";

// 12 Nov (malam): naskah dipilih Satya dari draf variasi (draf-klip/variasi-naskah.md di folder dokumen).
// Kalimat pertama = utama, sisanya variasi yang dipilih acak. Tanpa "pintar/habis/gagal" (UI UX 14.4).
// Klip `mbak_gigit_duluan` dan `tos_mbak` sengaja tanpa sapaan, jadi cocok untuk Mbak, Bu, Oma, atau Ayah.
// `nanti_lagi` (anak menolak) tetap datar tanpa pujian atau bujukan; dibuat dengan suara stabil (scripts/buat-klip.ts).
export const KLIP: Record<IdKlip, { kalimat: string; variasi: string[]; sapaan?: Sapaan }> = {
  sapa_awal: { kalimat: "Hai, hai! Siap makan bareng?", variasi: ["Halo, teman makanku!"] },
  kenalan_makanan: { kalimat: "Wah, ini makanan kita hari ini!", variasi: ["Taraaa! Coba tebak, ini apa?", "Psst… aku bawa sesuatu. Lihat, deh!"] },
  ajak_makan_bareng: { kalimat: "Sekarang kita makan bareng, yuk!", variasi: ["Ayo makan bareng aku!", "Siap? Kita mulai petualangan makan!"] },
  karakter_enak: { kalimat: "Hmm, enak banget!", variasi: ["Mmm… enaknya!", "Wah, rasanya enak, lho."] },
  giliranmu: { kalimat: "Sekarang giliranmu!", variasi: ["Ayo, kamu juga!", "Giliran kamu! Aaa…"] },
  mbak_gigit_duluan: { kalimat: "Yuk, semuanya ikut gigit!", variasi: ["Ayo, kita gigit bareng!", "Siapa mau gigit duluan? Ayo!"] },
  hore: { kalimat: "Yeay, hebat!", variasi: ["Mantap!", "Hore! Kamu mau coba!"] },
  tos_mbak: { kalimat: "Tos dulu yuk!", variasi: ["Tos dulu, dong!", "Tos, yuk! Hebat!"] },
  masih_ngunyah: { kalimat: "Nyam, nyam. Santai aja yaa.", variasi: [] },
  nanti_lagi: { kalimat: "Oke, nanti lagi.", variasi: ["Oke. Aku gigit dulu."] },
  waktunya_selesai: { kalimat: "Waktunya selesai. Makasih udah makan bareng aku!", variasi: ["Udahan dulu, ya. Makasih, teman makanku!"] },
  intip_makanan: { kalimat: "Lihat dari dekat, yuk! Wah, lucu bentuknya.", variasi: ["Coba lihat, apa warnanya?", "Hihi, makanannya melambai ke kamu!"] },
  cium_wangi: { kalimat: "Coba cium… hmm, wanginya!", variasi: ["Sniff, sniff… wangi, ya?", "Dengar, deh. Nyam, nyam, nyam!"] },
  berani_coba: { kalimat: "Aku udah coba. Seru, lho!", variasi: ["Gigitan kecil aja, kayak aku tadi!", "Wah, aku mau lagi! Kamu juga?"] },
  penutup: { kalimat: "Yeay, kamu dapat stiker!", variasi: ["Ini stiker buat kamu. Yeay!", "Taraaa! Stiker baru buat kamu!"] },
};
