// Pemilik: A (Darryl). A1.2: memilih wajah anak bila ada dua wajah di kamera (pengasuh ikut masuk). Fungsi murni.
// Semua koordinat ternormalisasi 0..1 seperti keluaran FaceLandmarker (frame asli, tidak dicerminkan).

export type Titik = { x: number; y: number };
export type Kotak = { x0: number; y0: number; x1: number; y1: number; cx: number; cy: number; luas: number };
/** Acuan wajah anak yang dilacak antar-frame. */
export type Acuan = { cx: number; cy: number; luas: number };

export function kotakDari(landmark: Titik[]): Kotak {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const { x, y } of landmark) {
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  return { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, luas: (x1 - x0) * (y1 - y0) };
}

const JARAK_MAKS = Math.SQRT1_2; // jarak pusat frame ke sudut

/** Saat kalibrasi: wajah paling besar dan paling tengah. -1 bila tidak ada wajah. */
export function pilihSaatKalibrasi(kotak: Kotak[]): number {
  let terbaik = -1, skorTerbaik = -Infinity;
  kotak.forEach((k, i) => {
    const skor = k.luas * (1 - Math.hypot(k.cx - 0.5, k.cy - 0.5) / JARAK_MAKS);
    if (skor > skorTerbaik) { skorTerbaik = skor; terbaik = i; }
  });
  return terbaik;
}

/** Pengasuh mengetuk wajah di pratinjau. `x`,`y` sudah dibalik dari tampilan cermin. -1 bila tidak kena. */
export function pilihDiTitik(kotak: Kotak[], x: number, y: number): number {
  return kotak.findIndex((k) => x >= k.x0 && x <= k.x1 && y >= k.y0 && y <= k.y1);
}

/** Wajah yang pusatnya paling dekat dengan acuan dan ukurannya 0,5-2 kali acuan. -1 bila tidak ada. */
export function lacakWajah(acuan: Acuan, kotak: Kotak[]): number {
  let terbaik = -1, jarakTerbaik = Infinity;
  kotak.forEach((k, i) => {
    const rasio = k.luas / acuan.luas;
    if (rasio < 0.5 || rasio > 2) return;
    const jarak = Math.hypot(k.cx - acuan.cx, k.cy - acuan.cy);
    if (jarak < jarakTerbaik) { jarakTerbaik = jarak; terbaik = i; }
  });
  return terbaik;
}

/** Rata-rata bergerak 0,8 lama + 0,2 baru supaya acuan mengikuti anak yang bergeser pelan. */
export function perbaruiAcuan(acuan: Acuan | null, k: Kotak): Acuan {
  if (!acuan) return { cx: k.cx, cy: k.cy, luas: k.luas };
  return { cx: 0.8 * acuan.cx + 0.2 * k.cx, cy: 0.8 * acuan.cy + 0.2 * k.cy, luas: 0.8 * acuan.luas + 0.2 * k.luas };
}
