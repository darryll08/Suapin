// Pemilik: B (Satya). String kelas bersama (UI UX Guidelines 4–7). Tanpa merah.

const fokus =
  "outline-none focus-visible:ring-4 focus-visible:ring-jagung focus-visible:ring-offset-2 focus-visible:ring-offset-latar";

const dasarTombol =
  `inline-flex items-center justify-center gap-2 rounded-tombol px-5 font-judul text-tombol font-bold ` +
  `transition-[transform,background-color] duration-150 ease-standar active:scale-[0.98] ` +
  `disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${fokus}`;

/** Aksi utama: ungu, tinggi ≥ 56 px, lebar penuh di HP. */
export const tombolUtama = `${dasarTombol} min-h-14 w-full sm:w-auto bg-ungu text-permukaan hover:bg-ungu-muda`;

/** Aksi kedua: garis ungu di atas permukaan. */
export const tombolKedua = `${dasarTombol} min-h-14 w-full sm:w-auto border-2 border-ungu bg-permukaan text-ungu hover:bg-ungu-tint`;

/** Aksi teks: tetap ≥ 48 px supaya mudah disentuh. */
export const tombolTeks = `${dasarTombol} min-h-12 px-3 text-ungu underline-offset-4 hover:underline`;

export const isian =
  `block min-h-12 w-full rounded-isian border-2 border-garis bg-permukaan px-4 text-isi text-ungu ` +
  `placeholder:text-ungu-muda focus:border-ungu ${fokus} aria-invalid:border-jagung`;

export const kartu = "rounded-kartu border border-garis/60 bg-permukaan p-5 shadow-kartu";

/** Kartu bento: radius besar, tanpa garis, bayangan lembut. */
export const bento = "rounded-bento bg-permukaan p-5 shadow-kartu";

/** Tombol ikon bulat 48 px (kepala halaman). */
export const tombolIkon =
  `inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-permukaan text-ungu shadow-kartu hover:bg-ungu-tint ${fokus}`;

export const pil = "inline-flex min-h-8 items-center rounded-full px-3 text-kecil font-semibold";

export const nadaPil = {
  ungu: "bg-ungu-tint text-ungu",
  jagung: "bg-jagung-muda text-jagung-tua",
  netral: "border border-garis text-ungu-muda",
} as const;

/** Halaman keluarga: maks 560 px, terpusat. */
export const wadahKeluarga = "mx-auto w-full max-w-[560px] px-4 pb-10";

/** Teks peringatan/galat: jagung tua (5,23:1 di atas nasi). */
export const teksPeringatan = "text-jagung-tua";
