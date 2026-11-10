// Pemilik: A (Darryl). Membuat bersama/kontrak/contoh/rekaman-sinyal.json (A0.3).
// Jalankan: npx tsx uji/mesin/buat-rekaman-contoh.ts
// Rekaman buatan 30 detik di 20 fps untuk menggerakkan karakter tanpa kamera (B) dan untuk tes engine (A).
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { RekamanSinyal, Sinyal } from "../../bersama/kontrak/sinyal.ts";

const FPS = 20;
const DURASI_DETIK = 30;
const BUKA_MAKS = 0.6;
const KUNYAH_HZ = 1.5;
const KUNYAH_AMPLITUDO = 0.04;
const DERAU = 0.003;

// Suapan: mulut naik 0 -> 0,6 selama 0,5 s, tahan 0,8 s, turun ke 0 selama 0,3 s, lalu kunyah 5 s.
const SUAPAN_MULAI = [2, 9.5, 22];
const NAIK = 0.5, TAHAN = 0.8, TURUN = 0.3, KUNYAH = 5;
const HILANG = [16.5, 18.5]; // terlihat = false
const MENOLEH = [19, 21]; // yaw -35 derajat: menjauhi sisi pengasuh (menolak)

export const CATATAN = [
  "Rekaman buatan (bukan wajah asli), 30 detik, 20 fps, 600 sampel. Nilai sudah dikurangi baseline dan dihaluskan.",
  "3 suapan diterima mulai detik 2; 9,5; 22: mulut 0 -> 0,6 dalam 0,5 s, tahan 0,8 s, turun ke 0 dalam 0,3 s,",
  "lalu jeda kunyah 5 s (rahang sinus 1,5 Hz, amplitudo 0,04).",
  "Wajah tidak terlihat detik 16,5-18,5. Menolak: yaw -35 derajat (menjauhi pengasuh) detik 19-21.",
  "Derau rahang ±0,003 dari pembangkit acak berbenih, jadi file selalu sama.",
].join(" ");

function mulutPada(d: number): number {
  for (const m of SUAPAN_MULAI) {
    const x = d - m;
    if (x < 0 || x >= NAIK + TAHAN + TURUN) continue;
    if (x < NAIK) return (x / NAIK) * BUKA_MAKS;
    if (x < NAIK + TAHAN) return BUKA_MAKS;
    return (1 - (x - NAIK - TAHAN) / TURUN) * BUKA_MAKS;
  }
  return 0;
}

function kunyahPada(d: number): number {
  for (const m of SUAPAN_MULAI) {
    const x = d - (m + NAIK + TAHAN + TURUN);
    if (x >= 0 && x < KUNYAH) return KUNYAH_AMPLITUDO * Math.sin(2 * Math.PI * KUNYAH_HZ * x);
  }
  return 0;
}

const dalam = (d: number, [a, b]: number[]) => d >= a && d < b;
// `|| 0` membuang -0, yang hilang saat ditulis ke JSON lalu membuat file tidak sama dengan pembuatnya.
const bulat = (n: number) => Math.round(n * 10000) / 10000 || 0;

export function buatRekaman(): RekamanSinyal {
  let benih = 42;
  const acak = () => ((benih = (benih * 1103515245 + 12345) % 2 ** 31) / 2 ** 31) * 2 - 1;
  const sinyal: Sinyal[] = [];
  for (let i = 0; i < FPS * DURASI_DETIK; i++) {
    const d = i / FPS;
    const terlihat = !dalam(d, HILANG);
    sinyal.push({
      t: Math.round(d * 1000),
      mulut: terlihat ? bulat(mulutPada(d)) : 0,
      rahang: terlihat ? bulat(kunyahPada(d) + acak() * DERAU) : 0,
      yaw: terlihat && dalam(d, MENOLEH) ? -35 : 0,
      nangis: false,
      terlihat,
    });
  }
  return { versi: 1, fps: FPS, catatan: CATATAN, sinyal };
}

export const JALUR_REKAMAN = fileURLToPath(new URL("../../bersama/kontrak/contoh/rekaman-sinyal.json", import.meta.url));

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  writeFileSync(JALUR_REKAMAN, JSON.stringify(buatRekaman()) + "\n");
  console.log("Tertulis:", JALUR_REKAMAN);
}
