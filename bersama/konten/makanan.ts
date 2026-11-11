// Pemilik: B (Satya). Daftar makanan sesi (jobdesk 2.6). MVP: brokoli + umum.
// Gambar: tiga tahap gigitan (utuh, digigit 1, digigit 2), kanvas sama 512×512.
// Keputusan aset 11 Nov: SVG flat (lihat docs/aset.md), jadi path memakai .svg, bukan .webp.

export type Makanan = { id: string; nama: string; gambar: [string, string, string] };

const gambar = (id: string): [string, string, string] => [
  `/aset/makanan/${id}_0.svg`,
  `/aset/makanan/${id}_1.svg`,
  `/aset/makanan/${id}_2.svg`,
];

export const MAKANAN: Makanan[] = [
  { id: "brokoli", nama: "Brokoli", gambar: gambar("brokoli") },
  { id: "umum", nama: "Lainnya", gambar: gambar("umum") },
];

export function cariMakanan(id: string): Makanan {
  return MAKANAN.find((m) => m.id === id) ?? MAKANAN[MAKANAN.length - 1];
}

/** Stiker harian, dipilih berurutan per hari. */
export const STIKER = ["/aset/stiker/jagung.svg", "/aset/stiker/nasi.svg", "/aset/stiker/ubi.svg"];
