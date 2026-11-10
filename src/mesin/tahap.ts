// Pemilik: A (Darryl). A2.4: saklar program lepas layar (dokumen produk II.7, PRD F-24).

export type SaklarTahap = {
  /** nyala = loop penuh; giliran_saja = karakter hanya tampil saat giliran; hitam = layar hitam, suara jalan;
   *  catat_saja = tidak ada sesi, pengasuh memimpin lalu mencatat. */
  layar: "nyala" | "giliran_saja" | "hitam" | "catat_saja";
  karakterMenggigit: boolean;
  /** kadang = setiap putaran ke-3 di tahap 1. */
  ajakPengasuhGigit: "kadang" | "selalu" | "tidak";
  suara: boolean;
};

const SAKLAR: Record<1 | 2 | 3 | 4, SaklarTahap> = {
  1: { layar: "nyala", karakterMenggigit: true, ajakPengasuhGigit: "kadang", suara: true },
  2: { layar: "giliran_saja", karakterMenggigit: false, ajakPengasuhGigit: "selalu", suara: true },
  3: { layar: "hitam", karakterMenggigit: false, ajakPengasuhGigit: "selalu", suara: true },
  4: { layar: "catat_saja", karakterMenggigit: false, ajakPengasuhGigit: "tidak", suara: false },
};

/** Tahap di luar 1–4 dibatasi ke rentang itu. */
export function saklarTahap(tahap: number): SaklarTahap {
  return SAKLAR[Math.min(4, Math.max(1, Math.round(tahap))) as 1 | 2 | 3 | 4];
}
