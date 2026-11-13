import { describe, expect, it } from "vitest";
import type { Sinyal } from "../../bersama/kontrak/sinyal.ts";
import { AMBANG_AWAL } from "../../src/mesin/ambang.ts";
import { kunyahAwal, langkahKunyah } from "../../src/mesin/kunyah.ts";
import { buatRekaman } from "./buat-rekaman-contoh.ts";

const FPS = 20;
const GETAR_DIAM = 0.0017; // ±0,003 derau seragam

/** Jalankan deret rahang; kembalikan waktu (ms) pertama kali aktif dan selesai, serta aktif di akhir. */
function jalankan(rahang: (detik: number) => number, durasiDetik: number, benih = 7, pitch?: (detik: number) => number) {
  let acak = benih;
  const derau = () => (((acak = (acak * 1103515245 + 12345) % 2 ** 31) / 2 ** 31) * 2 - 1) * 0.003;
  let k = kunyahAwal();
  let aktifPertama: number | null = null, selesaiPertama: number | null = null, aktif = false;
  for (let i = 0; i < durasiDetik * FPS; i++) {
    const t = (i * 1000) / FPS;
    const s: Sinyal = { t, mulut: 0, rahang: rahang(t / 1000) + derau(), yaw: 0, nangis: false, terlihat: true, ...(pitch ? { pitch: pitch(t / 1000) } : {}) };
    const h = langkahKunyah(k, s, GETAR_DIAM, AMBANG_AWAL);
    k = h.k;
    aktif = h.aktif;
    if (h.aktif && aktifPertama === null) aktifPertama = t;
    if (h.selesai && selesaiPertama === null) selesaiPertama = t;
  }
  return { aktifPertama, selesaiPertama, aktif };
}

const sinus = (hz: number, amp = 0.04) => (d: number) => amp * Math.sin(2 * Math.PI * hz * d);

describe("penghitung kunyahan", () => {
  it("angguk: rahang bergerak bersama pitch ±10° tidak terbaca kunyah", () => {
    const h = jalankan(sinus(1.5), 6, 7, (d) => 10 * Math.sin(2 * Math.PI * 1.5 * d));
    expect(h.aktifPertama).toBeNull();
  });

  it("kunyah dengan kepala diam (pitch ±0,5°) tetap aktif", () => {
    const h = jalankan(sinus(1.5), 6, 7, (d) => 12 + 0.5 * Math.sin(2 * Math.PI * 0.3 * d));
    expect(h.aktif).toBe(true);
  });

  it("kunyah 1,5 Hz amplitudo 0,04 di atas derau 0,003 aktif dalam ≤ 3 detik", () => {
    for (const benih of [1, 7, 99]) {
      const h = jalankan(sinus(1.5), 6, benih);
      expect(h.aktifPertama).not.toBeNull();
      expect(h.aktifPertama!).toBeLessThanOrEqual(3000);
      expect(h.aktif).toBe(true);
    }
  });

  it("derau saja tidak pernah aktif", () => {
    expect(jalankan(() => 0, 20).aktifPertama).toBeNull();
  });

  it("angguk lambat 0,3 Hz tidak aktif", () => {
    expect(jalankan(sinus(0.3, 0.08), 20).aktifPertama).toBeNull();
  });

  it("gerak terlalu cepat 4 Hz (bicara) tidak aktif", () => {
    expect(jalankan(sinus(4), 10).aktifPertama).toBeNull();
  });

  it("selesai setelah 4 detik tanpa siklus", () => {
    const h = jalankan((d) => (d < 5 ? sinus(1.5)(d) : 0), 12);
    expect(h.aktifPertama).not.toBeNull();
    expect(h.selesaiPertama).not.toBeNull();
    expect(h.selesaiPertama!).toBeGreaterThanOrEqual(5000 + 4000 - 700);
    expect(h.selesaiPertama!).toBeLessThanOrEqual(5000 + 4000 + 200);
    expect(h.aktif).toBe(false);
  });

  it("rekaman contoh: kunyah aktif di ketiga jeda kunyah dan tidak saat diam di awal", () => {
    const sinyal = buatRekaman().sinyal;
    let k = kunyahAwal();
    const aktifPada: number[] = [];
    for (const s of sinyal) {
      const h = langkahKunyah(k, s, GETAR_DIAM, AMBANG_AWAL);
      k = h.k;
      if (h.aktif) aktifPada.push(s.t);
    }
    for (const [awal, akhir] of [[3600, 8600], [11100, 16100], [23600, 28600]]) {
      expect(aktifPada.some((t) => t >= awal && t <= akhir)).toBe(true);
    }
    expect(aktifPada.some((t) => t < 3600)).toBe(false);
  });

  it("wajah hilang tidak membuat siklus palsu", () => {
    let k = kunyahAwal();
    for (let i = 0; i < 100; i++) {
      const s: Sinyal = { t: i * 50, mulut: 0, rahang: i % 2 ? 0.1 : -0.1, yaw: 0, nangis: false, terlihat: false };
      k = langkahKunyah(k, s, GETAR_DIAM, AMBANG_AWAL).k;
    }
    expect(k.siklus).toHaveLength(0);
  });
});
