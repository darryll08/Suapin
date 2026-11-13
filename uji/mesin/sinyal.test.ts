import { describe, expect, it } from "vitest";
import { SinyalSchema } from "../../bersama/kontrak/sinyal.ts";
import { buatBaseline } from "../../src/deteksi/baseline.ts";
import {
  TANDA_YAW_KANAN_ANAK, buatPengolahSinyal, haluskan, nangisMentah, rahangMentah, yawMentah, type WajahFrame,
} from "../../src/deteksi/sinyal.ts";
import { AMBANG_AWAL } from "../../src/mesin/ambang.ts";

/** 478 landmark nol, lalu dahi (10), hidung (1), dagu (152) diisi. */
function landmark(dahiY: number, hidungY: number, daguY: number) {
  const lm = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5 }));
  lm[10] = { x: 0.5, y: dahiY };
  lm[1] = { x: 0.5, y: hidungY };
  lm[152] = { x: 0.5, y: daguY };
  return lm;
}

/** Matriks kolom-mayor rotasi yaw `derajat` di sumbu Y. */
function matriksYaw(derajat: number) {
  const r = (derajat * Math.PI) / 180;
  return [Math.cos(r), 0, -Math.sin(r), 0, 0, 1, 0, 0, Math.sin(r), 0, Math.cos(r), 0, 0, 0, 0, 1];
}

const wajah = (jawOpen: number, yaw = 0, daguY = 0.7, lain: Record<string, number> = {}): WajahFrame => ({
  landmark: landmark(0.3, 0.5, daguY),
  kategori: Object.entries({ jawOpen, ...lain }).map(([categoryName, score]) => ({ categoryName, score })),
  matriks: matriksYaw(yaw),
});

const pengolah = (sisi: "kiri" | "kanan" = "kanan") =>
  buatPengolahSinyal({ sisiPengasuh: sisi, ukuranVideo: () => ({ lebar: 640, tinggi: 480 }), ambang: () => AMBANG_AWAL });

describe("rumus sinyal", () => {
  it("rahang = jarak dagu-hidung / jarak dahi-dagu", () => {
    expect(rahangMentah(landmark(0.3, 0.5, 0.7), 640, 480)).toBeCloseTo(0.2 / 0.4);
  });
  it("rahang tidak berubah saat kepala mengangguk (rotasi pitch 3D)", () => {
    // Hidung menonjol ke depan (z), jadi di 2D rasionya berubah saat angguk; di 3D tetap.
    const wajah = { dahi: [0, -0.2, 0], hidung: [0, 0, -0.08], dagu: [0, 0.2, 0] };
    const angguk = (derajat: number) => {
      const r = (derajat * Math.PI) / 180;
      const putar = ([x, y, z]: number[]) => ({ x: 0.5 + x, y: 0.5 + y * Math.cos(r) - z * Math.sin(r), z: y * Math.sin(r) + z * Math.cos(r) });
      const lm = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
      lm[10] = putar(wajah.dahi); lm[1] = putar(wajah.hidung); lm[152] = putar(wajah.dagu);
      return rahangMentah(lm, 640, 640);
    };
    expect(angguk(20)).toBeCloseTo(angguk(0), 6);
    expect(angguk(-20)).toBeCloseTo(angguk(0), 6);
  });
  it("yaw dari matriks transformasi", () => {
    expect(yawMentah(matriksYaw(30))).toBeCloseTo(30);
    expect(yawMentah(matriksYaw(-20))).toBeCloseTo(-20);
  });
  it("nangis = rata-rata empat blendshape mata dan alis", () => {
    const k = ["eyeSquintLeft", "eyeSquintRight", "browDownLeft", "browDownRight"].map((n) => ({ categoryName: n, score: 0.8 }));
    expect(nangisMentah(k)).toBeCloseTo(0.8);
  });
  it("penghalusan 0,4 baru + 0,6 lama", () => {
    expect(haluskan(1, null)).toBe(1);
    expect(haluskan(1, 0)).toBeCloseTo(0.4);
  });
});

describe("baseline bergulir", () => {
  it("persentil 20 dari 10 detik terakhir", () => {
    const b = buatBaseline();
    for (let i = 0; i < 10; i++) b.tambah(i * 100, i / 10);
    expect(b.nilai(9)).toBeCloseTo(0.1);
    b.tambah(20_000, 0.5); // sampel lama keluar jendela
    expect(b.nilai(9)).toBe(0.5);
  });
  it("tidak berubah saat boleh(false)", () => {
    const b = buatBaseline();
    b.tambah(0, 0.1);
    b.boleh(false);
    b.tambah(100, 0.9);
    expect(b.nilai(0)).toBe(0.1);
    expect(buatBaseline().nilai(0.33)).toBe(0.33);
  });
});

describe("pengolah sinyal", () => {
  it("mulut naik saat jawOpen naik di atas baseline, lalu keluaran lolos SinyalSchema", () => {
    const p = pengolah();
    let t = 0;
    for (; t < 3000; t += 50) p.olah(t, wajah(0.05));
    let s = p.olah(t, wajah(0.65));
    for (let i = 0; i < 10; i++) s = p.olah((t += 50), wajah(0.65));
    expect(s.mulut).toBeGreaterThan(0.5);
    expect(SinyalSchema.parse(s)).toEqual(s);
  });

  it("baseline tidak ikut naik saat menilai (boleh false), jadi mulut tetap terbaca terbuka", () => {
    const p = pengolah();
    let t = 0;
    for (; t < 3000; t += 50) p.olah(t, wajah(0.05));
    p.baselineBoleh(false);
    let s = p.olah(t, wajah(0.6));
    for (let i = 0; i < 200; i++) s = p.olah((t += 50), wajah(0.6));
    expect(s.mulut).toBeCloseTo(0.55, 2);
  });

  it("yaw positif = menoleh ke pengasuh, untuk pengasuh di kanan maupun kiri", () => {
    const keKananAnak = 30 * TANDA_YAW_KANAN_ANAK;
    expect(pengolah("kanan").olah(0, wajah(0, keKananAnak)).yaw).toBeCloseTo(30);
    expect(pengolah("kiri").olah(0, wajah(0, keKananAnak)).yaw).toBeCloseTo(-30);
  });

  it("kalibrasi menjadikan median yaw sebagai arah normal", () => {
    const p = pengolah();
    p.kalibrasi(true);
    for (const y of [8, 10, 12, 40]) p.olah(0, wajah(0, y));
    p.kalibrasi(false);
    expect(p.olah(1, wajah(0, 12)).yaw).toBeCloseTo(0);
  });

  it("nangis hanya bila mata/alis tinggi DAN mulut terbuka", () => {
    const tinggi = { eyeSquintLeft: 0.9, eyeSquintRight: 0.9, browDownLeft: 0.9, browDownRight: 0.9 };
    const p = pengolah();
    let t = 0;
    for (; t < 2000; t += 50) p.olah(t, wajah(0.02, 0, 0.7, tinggi));
    expect(p.olah(t, wajah(0.02, 0, 0.7, tinggi)).nangis).toBe(false);
    p.baselineBoleh(false);
    let s = p.olah(t, wajah(0.9, 0, 0.7, tinggi));
    for (let i = 0; i < 10; i++) s = p.olah((t += 50), wajah(0.9, 0, 0.7, tinggi));
    expect(s.nangis).toBe(true);
  });

  it("wajah tidak ada = terlihat false dengan nilai nol", () => {
    expect(pengolah().olah(5, null)).toEqual({ t: 5, mulut: 0, rahang: 0, yaw: 0, nangis: false, terlihat: false });
  });
});
