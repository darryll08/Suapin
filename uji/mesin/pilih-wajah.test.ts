import { describe, expect, it } from "vitest";
import { kotakDari, lacakWajah, perbaruiAcuan, pilihDiTitik, pilihSaatKalibrasi, type Kotak } from "../../src/deteksi/pilih-wajah.ts";

const kotak = (cx: number, cy: number, sisi: number): Kotak =>
  kotakDari([{ x: cx - sisi / 2, y: cy - sisi / 2 }, { x: cx + sisi / 2, y: cy + sisi / 2 }]);

describe("pilih wajah anak", () => {
  it("kotakDari menghitung batas, pusat, dan luas", () => {
    const k = kotakDari([{ x: 0.2, y: 0.3 }, { x: 0.4, y: 0.6 }, { x: 0.3, y: 0.4 }]);
    expect(k).toMatchObject({ x0: 0.2, y0: 0.3, x1: 0.4, y1: 0.6 });
    expect(k.cx).toBeCloseTo(0.3);
    expect(k.luas).toBeCloseTo(0.06);
  });

  it("kalibrasi memilih wajah besar di tengah, bukan pengasuh kecil di pinggir", () => {
    expect(pilihSaatKalibrasi([kotak(0.85, 0.4, 0.2), kotak(0.5, 0.5, 0.3)])).toBe(1);
    expect(pilihSaatKalibrasi([])).toBe(-1);
  });

  it("ketukan memilih wajah yang kotaknya memuat titik", () => {
    const daftar = [kotak(0.3, 0.5, 0.2), kotak(0.7, 0.5, 0.2)];
    expect(pilihDiTitik(daftar, 0.72, 0.45)).toBe(1);
    expect(pilihDiTitik(daftar, 0.5, 0.1)).toBe(-1);
  });

  it("wajah anak tetap terpilih saat wajah pengasuh masuk dan bergerak di sebelahnya", () => {
    let acuan = perbaruiAcuan(null, kotak(0.5, 0.5, 0.3));
    for (let i = 0; i < 40; i++) {
      const anak = kotak(0.5 + i * 0.002, 0.5, 0.3); // anak bergeser pelan
      const pengasuh = kotak(0.9 - i * 0.004, 0.45, 0.32); // pengasuh mendekat dari kanan
      const daftar = i % 2 ? [pengasuh, anak] : [anak, pengasuh];
      const pilih = lacakWajah(acuan, daftar);
      expect(daftar[pilih]).toBe(anak);
      acuan = perbaruiAcuan(acuan, daftar[pilih]);
    }
  });

  it("wajah yang ukurannya jauh berbeda tidak dianggap anak", () => {
    const acuan = perbaruiAcuan(null, kotak(0.5, 0.5, 0.3));
    expect(lacakWajah(acuan, [kotak(0.5, 0.5, 0.1)])).toBe(-1);
  });
});
