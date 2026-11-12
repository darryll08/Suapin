// Pemilik: B (Satya). Daftar makanan sesi (jobdesk 2.6). 12 Nov: 30 makanan + "Lainnya", dikelompokkan.
// Gambar: lima tahap (utuh, lalu 4 gigitan), kanvas sama 512×512. Bekas gigitan = mask lingkaran.
// Keputusan aset 11 Nov: SVG flat (lihat docs/aset.md), jadi path memakai .svg, bukan .webp.

export const JUMLAH_TAHAP_MAKANAN = 5;
export type TahapMakanan = 0 | 1 | 2 | 3 | 4;
export type KelompokMakanan = "karbo" | "hewani" | "nabati" | "sayur" | "buah" | "lain";
export type Makanan = { id: string; nama: string; kelompok: KelompokMakanan; gambar: string[] };

export const NAMA_KELOMPOK: Record<KelompokMakanan, string> = {
  karbo: "Nasi dan karbohidrat", hewani: "Lauk hewani", nabati: "Lauk nabati", sayur: "Sayur", buah: "Buah", lain: "Lainnya",
};

const gambar = (id: string) => Array.from({ length: JUMLAH_TAHAP_MAKANAN }, (_, t) => `/aset/makanan/${id}_${t}.svg`);
const m = (id: string, nama: string, kelompok: KelompokMakanan): Makanan => ({ id, nama, kelompok, gambar: gambar(id) });

/** "umum" harus tetap terakhir: dipakai sebagai cadangan di `cariMakanan`. */
export const MAKANAN: Makanan[] = [
  m("nasi", "Nasi", "karbo"), m("kentang", "Kentang", "karbo"), m("ubi", "Ubi ungu", "karbo"),
  m("jagung", "Jagung", "karbo"), m("roti", "Roti", "karbo"), m("mi", "Mi", "karbo"),
  m("telur_rebus", "Telur rebus", "hewani"), m("telur_dadar", "Telur dadar", "hewani"), m("ayam", "Ayam", "hewani"),
  m("ikan", "Ikan", "hewani"), m("bakso", "Bakso", "hewani"),
  m("tahu", "Tahu", "nabati"), m("tempe", "Tempe", "nabati"),
  m("brokoli", "Brokoli", "sayur"), m("wortel", "Wortel", "sayur"), m("buncis", "Buncis", "sayur"),
  m("labu", "Labu kuning", "sayur"), m("bayam", "Bayam", "sayur"), m("kembang_kol", "Kembang kol", "sayur"),
  m("pakcoy", "Pakcoy", "sayur"), m("timun", "Timun", "sayur"), m("tomat", "Tomat", "sayur"),
  m("pisang", "Pisang", "buah"), m("pepaya", "Pepaya", "buah"), m("apel", "Apel", "buah"), m("semangka", "Semangka", "buah"),
  m("jeruk", "Jeruk", "buah"), m("mangga", "Mangga", "buah"), m("alpukat", "Alpukat", "buah"), m("melon", "Melon", "buah"),
  m("umum", "Lainnya", "lain"),
];

export function cariMakanan(id: string): Makanan {
  return MAKANAN.find((m) => m.id === id) ?? MAKANAN[MAKANAN.length - 1];
}

/** Stiker harian, dipilih berurutan per hari. */
export const STIKER = ["/aset/stiker/jagung.svg", "/aset/stiker/nasi.svg", "/aset/stiker/ubi.svg"];
