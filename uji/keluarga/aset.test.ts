// Pemilik: B (Satya). B1.2: setiap gambar di MAKANAN dan STIKER ada di public/; contoh data keluarga konsisten.
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { JUMLAH_TAHAP_MAKANAN, MAKANAN, STIKER } from "../../bersama/konten/makanan.ts";
import { CONTOH_LAPORAN, CONTOH_SAYA, CONTOH_SAYA_TRIAL_HABIS } from "../../bersama/kontrak/contoh/keluarga.ts";

const ada = (p: string) => existsSync(new URL(`../../public${p}`, import.meta.url));

describe("aset keluarga", () => {
  it("semua gambar makanan ada (utuh + 4 gigitan), id unik, umum terakhir", () => {
    expect(new Set(MAKANAN.map((m) => m.id)).size).toBe(MAKANAN.length);
    expect(MAKANAN[MAKANAN.length - 1].id).toBe("umum");
    for (const m of MAKANAN) {
      expect(m.gambar).toHaveLength(JUMLAH_TAHAP_MAKANAN);
      for (const g of m.gambar) expect(ada(g), g).toBe(true);
    }
  });
  it("minimal 3 stiker dan semuanya ada", () => {
    expect(STIKER.length).toBeGreaterThanOrEqual(3);
    for (const s of STIKER) expect(ada(s), s).toBe(true);
  });
  it("makanan wajib MVP: brokoli + umum", () => {
    expect(MAKANAN.map((m) => m.id)).toEqual(expect.arrayContaining(["brokoli", "umum"]));
  });
});

describe("contoh data keluarga", () => {
  it("Dika: 4 th 2 bln, Mbak Rini, tahap 1, sesi terbuka", () => {
    expect(CONTOH_SAYA.child).toMatchObject({ panggilan: "Dika", usia_bulan: 50, sapaan: "mbak", nama_pengasuh: "Rini", stage: 1 });
    expect(CONTOH_SAYA.sesi_dibuka).toBe(true);
  });
  it("laporan 14 hari, stiker 7 hari, paparan brokoli 4/10", () => {
    expect(CONTOH_LAPORAN.stiker_minggu_ini).toHaveLength(7);
    expect(CONTOH_LAPORAN.paparan[0]).toEqual({ makanan: "brokoli", jumlah: 4, target: 10 });
    const hari = new Set(CONTOH_LAPORAN.sesi.map((s) => s.tanggal));
    expect(hari.size).toBe(14);
  });
  it("sesi malam lebih banyak ditolak daripada pagi (pola untuk ringkasan)", () => {
    const rata = (jam: string) => {
      const s = CONTOH_LAPORAN.sesi.filter((x) => x.jam === jam);
      return s.reduce((a, x) => a + x.ditolak, 0) / s.length;
    };
    expect(rata("18.30")).toBeGreaterThan(rata("07.00"));
  });
  it("trial habis mengunci sesi", () => {
    expect(CONTOH_SAYA_TRIAL_HABIS).toMatchObject({ sesi_dibuka: false, alasan_terkunci: "trial_habis" });
  });
});
