import { describe, expect, it } from "vitest";
import type { Sinyal } from "../../bersama/kontrak/sinyal.ts";
import { cocok, nilaiPercobaan, nilaiSuap, statistikLamaBuka } from "../../src/dev/gerbang.ts";
import { AMBANG_AWAL } from "../../src/mesin/ambang.ts";
import { buatRekaman } from "./buat-rekaman-contoh.ts";

describe("alat gerbang", () => {
  it("menilai suapan pertama rekaman contoh: buka ±1,2 detik, mulut maks 0,6", () => {
    const h = nilaiPercobaan(buatRekaman().sinyal, 2000, 0.3);
    expect(h.lamaBukaDetik).toBeGreaterThan(1);
    expect(h.lamaBukaDetik).toBeLessThan(1.4);
    expect(h.mulutMaks).toBeCloseTo(0.6);
    expect(h.yawMin).toBe(0);
  });

  it("mencatat menoleh menjauh dan waktu wajah hilang", () => {
    const h = nilaiPercobaan(buatRekaman().sinyal, 18000, 0.3);
    expect(h.yawMin).toBe(-35);
    expect(h.hilangDetik).toBeGreaterThan(0.4);
  });

  it("wajah hilang memutus rentang buka", () => {
    const s = (t: number, mulut: number, terlihat = true): Sinyal => ({ t, mulut, rahang: 0, yaw: 0, nangis: false, terlihat });
    const sinyal = [s(0, 0.5), s(500, 0.5), s(600, 0, false), s(700, 0.5), s(900, 0.5), s(1000, 0)];
    expect(nilaiPercobaan(sinyal, 0, 0.3).lamaBukaDetik).toBeCloseTo(0.5);
  });

  it("statistik lama buka dan usulan batas = p90 + 1 dibulatkan ke atas 0,5", () => {
    const st = statistikLamaBuka([0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6, 0])!;
    expect(st.n).toBe(10);
    expect(st.min).toBe(0.8);
    expect(st.p90).toBe(2.4);
    expect(st.usulanBatas).toBe(3.5);
    expect(statistikLamaBuka([0, 0])).toBeNull();
  });

  it("nilaiSuap memutar ulang ke engine: buka-tutup diterima, menoleh menjauh ditolak, buka lama tidak pasti", () => {
    const deret = (f: (d: number) => Partial<Sinyal>): Sinyal[] =>
      Array.from({ length: 400 }, (_, i) => ({ t: i * 50, mulut: 0, rahang: 0, yaw: 0, nangis: false, terlihat: true, ...f(i * 0.05) }));
    const tSuap = 10_000;
    const bukaTutup = nilaiSuap(deret((d) => ({ mulut: d >= 10.3 && d < 11.3 ? 0.6 : 0 })), tSuap, AMBANG_AWAL);
    expect(bukaTutup.hasil).toBe("diterima");
    expect(cocok("diterima", bukaTutup)).toBe(true);
    const menoleh = nilaiSuap(deret((d) => ({ yaw: d >= 10.2 && d < 12 ? -35 : 0 })), tSuap, AMBANG_AWAL);
    expect(menoleh.hasil).toBe("ditolak");
    expect(cocok("bukan_ditolak", menoleh)).toBe(false);
    const lama = nilaiSuap(deret((d) => ({ mulut: d >= 10.2 && d < 16.5 ? 0.6 : 0 })), tSuap, AMBANG_AWAL);
    expect(lama.hasil).toBe("tidak_pasti");
    expect(cocok("bukan_diterima", lama)).toBe(true);
  });
});
