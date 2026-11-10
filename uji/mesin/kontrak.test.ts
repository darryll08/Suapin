// Tes kontrak A0.3 dan penjaga K4/K5.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { RekamanSinyalSchema } from "../../bersama/kontrak/sinyal.ts";
import { SesiSelesaiSchema, TampilanSesiSchema } from "../../bersama/kontrak/sesi.ts";
import { JALUR_REKAMAN, buatRekaman } from "./buat-rekaman-contoh.ts";

const rekaman = RekamanSinyalSchema.parse(JSON.parse(readFileSync(JALUR_REKAMAN, "utf8")));

describe("rekaman sinyal contoh", () => {
  it("lolos skema: 30 detik di 20 fps", () => {
    expect(rekaman.fps).toBe(20);
    expect(rekaman.sinyal).toHaveLength(600);
    expect(rekaman.sinyal.at(-1)!.t).toBe(29950);
  });

  it("sama dengan keluaran pembuatnya (jalankan ulang skrip bila berubah)", () => {
    expect(rekaman).toEqual(buatRekaman());
  });

  it("berisi 3 buka-tutup mulut, 1 menoleh menjauh, dan 2 detik tidak terlihat", () => {
    let naik = 0;
    rekaman.sinyal.forEach((s, i) => {
      if (i > 0 && s.mulut > 0.3 && rekaman.sinyal[i - 1].mulut <= 0.3) naik++;
    });
    expect(naik).toBe(3);
    expect(rekaman.sinyal.filter((s) => s.yaw <= -25).length / rekaman.fps).toBe(2);
    expect(rekaman.sinyal.filter((s) => !s.terlihat).length / rekaman.fps).toBe(2);
  });
});

const sesiContoh = {
  child_id: "anak-1",
  menu: "brokoli",
  makanan_baru: true,
  mulai: "2026-11-10T05:00:00.000Z",
  selesai: "2026-11-10T05:18:00.000Z",
  durasi_detik: 1080,
  tahap: 1,
  alasan_selesai: "waktu_habis",
  gigitan: [{ detik: 95.5, hasil: "diterima", dikoreksi: false }],
};

describe("SesiSelesaiSchema", () => {
  it("menerima hasil sesi yang benar", () => {
    expect(SesiSelesaiSchema.parse(sesiContoh)).toEqual(sesiContoh);
  });

  it("menolak kolom tambahan seperti landmark (K5)", () => {
    expect(SesiSelesaiSchema.safeParse({ ...sesiContoh, landmark: [[0, 0, 0]] }).success).toBe(false);
    const gigitanLebih = [{ ...sesiContoh.gigitan[0], gambar: "data:image/png;base64,AA" }];
    expect(SesiSelesaiSchema.safeParse({ ...sesiContoh, gigitan: gigitanLebih }).success).toBe(false);
  });

  it("menolak tahap di luar 1-4 dan alasan selesai yang tidak dikenal", () => {
    expect(SesiSelesaiSchema.safeParse({ ...sesiContoh, tahap: 5 }).success).toBe(false);
    expect(SesiSelesaiSchema.safeParse({ ...sesiContoh, alasan_selesai: "bosan" }).success).toBe(false);
  });
});

describe("TampilanSesiSchema", () => {
  it("menerima tampilan awal sesi", () => {
    const tampilan = {
      status: "KALIBRASI", pose: "netral", mulutKarakter: 0, layar: "terang", makananTahap: 0,
      teks: null, klip: { id: "sapa_awal", nonce: 1 }, gigitan: [], detikBerjalan: 0, tahap: 1,
    };
    expect(TampilanSesiSchema.parse(tampilan)).toEqual(tampilan);
  });

  it("menolak klip yang tidak ada di daftar konten", () => {
    const salah = {
      status: "MENOLAK", pose: "santai", mulutKarakter: 0, layar: "terang", makananTahap: 0,
      teks: null, klip: { id: "hore_besar", nonce: 2 }, gigitan: [], detikBerjalan: 30, tahap: 1,
    };
    expect(TampilanSesiSchema.safeParse(salah).success).toBe(false);
  });
});
