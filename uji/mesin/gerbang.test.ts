import { describe, expect, it } from "vitest";
import type { Sinyal } from "../../bersama/kontrak/sinyal.ts";
import { nilaiPercobaan, statistikLamaBuka } from "../../src/dev/gerbang.ts";
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
});
