// Tes A2.2: state machine sesi. Semua kasus wajib dari jobdesk A2.2 + K11.
import { describe, expect, it } from "vitest";
import type { Sinyal } from "../../bersama/kontrak/sinyal.ts";
import { SesiSelesaiSchema, TampilanSesiSchema } from "../../bersama/kontrak/sesi.ts";
import { AMBANG_AWAL, type Ambang } from "../../src/mesin/ambang.ts";
import { hasilSesi, next, sesiAwal, tampilan, type Kejadian, type Keadaan, type Konteks, type Tombol } from "../../src/mesin/sesi.ts";
import { saklarTahap } from "../../src/mesin/tahap.ts";
import { buatRekaman } from "./buat-rekaman-contoh.ts";

const MNT = 60_000;
const ATURAN = { max_minutes: 30, end_after_refusal_minutes: 15, stage: 1, ngemut_hint: "Tawarkan minum sedikit" };

function konteks(ubah: Partial<Ambang> = {}, tahap = 1, aturan: Partial<typeof ATURAN> = {}): Konteks {
  return { aturan: { ...ATURAN, ...aturan, stage: tahap }, saklar: saklarTahap(tahap), ambang: { ...AMBANG_AWAL, ...ubah }, getarDiam: 0.0017 };
}

/** Simulator kecil: menyimpan riwayat status, klip, dan pose. */
class Sim {
  k: Keadaan;
  t = 0;
  status: string[] = [];
  klip: string[] = [];
  pose: string[] = [];
  constructor(public kx: Konteks = konteks()) {
    this.k = sesiAwal(0).keadaan;
    this.catat();
  }
  private catat() {
    if (this.status.at(-1) !== this.k.status) this.status.push(this.k.status);
    if (this.k.klip && this.klip.length < this.k.klip.nonce) this.klip.push(this.k.klip.id);
    if (this.pose.at(-1) !== this.k.pose) this.pose.push(this.k.pose);
  }
  kirim(e: Kejadian) {
    this.k = next(this.k, e, this.kx).keadaan;
    this.catat();
  }
  /** Kirim sinyal tiap 50 ms selama `ms`. `f` menerima detik sejak awal langkah ini. */
  sinyal(ms: number, f: (d: number) => Partial<Sinyal> = () => ({})) {
    const awal = this.t;
    for (; this.t < awal + ms; this.t += 50) {
      this.kirim({ jenis: "sinyal", s: { t: this.t, mulut: 0, rahang: 0, yaw: 0, nangis: false, terlihat: true, ...f((this.t - awal) / 1000) } });
    }
  }
  tekan(tombol: Tombol) {
    this.kirim({ jenis: "tombol", tombol, t: this.t });
  }
  /** Lewati kalibrasi + pemanasan + giliran karakter sampai MENUNGGU_SUAP. */
  keGiliranAnak() {
    this.sinyal(3100);
    this.tekan("lewati_pemanasan");
    this.sinyal(4100);
    expect(this.k.status).toBe("MENUNGGU_SUAP");
  }
  hasil() {
    return this.k.gigitan.map((g) => g.hasil);
  }
}

const buka = (dari: number, sampai: number, nilai = 0.6) => (d: number) => ({ mulut: d >= dari && d < sampai ? nilai : 0 });

describe("penilaian suapan", () => {
  it("buka-tutup setelah Suap → diterima, perayaan setelah mulut tertutup", () => {
    const s = new Sim();
    s.keGiliranAnak();
    s.tekan("suap");
    expect(s.k.status).toBe("MENILAI");
    s.sinyal(1000, buka(0.5, 2)); // masih terbuka di akhir langkah ini
    expect(s.k.status).toBe("MENILAI");
    s.sinyal(1500);
    expect(s.k.status).toBe("DITERIMA");
    expect(s.hasil()).toEqual(["diterima"]);
    expect(s.k.pose).toBe("merayakan");
  });

  it("mulut sudah terbuka 1 detik sebelum Suap lalu tutup → diterima", () => {
    const s = new Sim();
    s.keGiliranAnak();
    s.sinyal(2000, buka(1, 2)); // terbuka sejak 1 detik sebelum Suap
    s.tekan("suap");
    s.sinyal(1000, buka(0, 0.5));
    expect(s.hasil()).toEqual(["diterima"]);
  });

  it("buka 6 detik (lewat batasBukaDetik) → tidak pasti, bukan diterima", () => {
    const s = new Sim();
    s.keGiliranAnak();
    s.tekan("suap");
    s.sinyal(8000, buka(0, 6.2));
    expect(s.k.status).toBe("TIDAK_PASTI");
    expect(s.k.teks?.id).toBe("tadi_masuk");
    expect(s.hasil()).toEqual([]);
  });

  it("buka + nangis → bukan diterima", () => {
    const s = new Sim();
    s.keGiliranAnak();
    s.tekan("suap");
    s.sinyal(7000, (d) => ({ ...buka(0.5, 2)(d), nangis: d >= 0.5 && d < 2 }));
    expect(s.hasil()).not.toContain("diterima");
    expect(s.k.status).toBe("TIDAK_PASTI");
  });

  it("menoleh menjauh (yaw −35°) 1,2 detik → menolak, datar tanpa hore/merayakan (K11)", () => {
    const s = new Sim();
    s.keGiliranAnak();
    const klipSebelum = s.klip.length;
    s.tekan("suap");
    s.sinyal(1500, (d) => ({ yaw: d < 1.2 ? -35 : 0 }));
    expect(s.k.status).toBe("MENOLAK");
    expect(s.hasil()).toEqual(["ditolak"]);
    expect(s.k.pose).toBe("santai");
    expect(s.k.teks?.id).toBe("jangan_dibujuk");
    const klipBaru = s.klip.slice(klipSebelum);
    expect(klipBaru).toContain("nanti_lagi");
    expect(klipBaru).not.toContain("hore");
    expect(klipBaru).not.toContain("tos_mbak");
    expect(s.pose).not.toContain("merayakan");
  });

  it("menoleh ke arah pengasuh (yaw +35°) → bukan menolak", () => {
    const s = new Sim();
    s.keGiliranAnak();
    s.tekan("suap");
    s.sinyal(3000, (d) => ({ yaw: 35, ...buka(1.5, 2.3)(d) }));
    expect(s.hasil()).toEqual(["diterima"]);
  });

  it("tertawa 5 detik sebelum Suap (di luar buffer) tidak dihitung", () => {
    const s = new Sim();
    s.keGiliranAnak();
    s.sinyal(6000, buka(0, 1)); // terbuka 5-6 detik sebelum Suap
    s.tekan("suap");
    s.sinyal(7000);
    expect(s.hasil()).not.toContain("diterima");
  });

  it("mulut tidak pernah terbuka dan rahang diam sepanjang jendela → menolak", () => {
    const s = new Sim();
    s.keGiliranAnak();
    s.tekan("suap");
    s.sinyal(6500);
    expect(s.k.status).toBe("MENOLAK");
    expect(s.hasil()).toEqual(["ditolak"]);
  });

  it("jendela diperpanjang selama mulut masih terbuka (maks 12 detik)", () => {
    const s = new Sim();
    s.keGiliranAnak();
    s.tekan("suap");
    s.sinyal(5000);
    s.sinyal(3000, buka(0, 2.5)); // terbuka 5-7,5 detik setelah Suap, lewat akhir jendela 6 detik
    expect(s.hasil()).toEqual(["diterima"]);
  });
});

describe("tombol pengasuh", () => {
  it("TIDAK_PASTI: Ya → diterima dikoreksi; Tidak → ditolak dikoreksi; diam 10 detik → tidak dicatat", () => {
    for (const [jawab, harap] of [["ya", "diterima"], ["tidak", "ditolak"]] as const) {
      const s = new Sim(konteks({ hasilDariKamera: false }));
      s.keGiliranAnak();
      s.tekan("suap");
      expect(s.k.status).toBe("TIDAK_PASTI");
      s.tekan(jawab);
      expect(s.k.gigitan).toEqual([{ detik: expect.any(Number), hasil: harap, dikoreksi: true }]);
    }
    const s = new Sim(konteks({ hasilDariKamera: false }));
    s.keGiliranAnak();
    s.tekan("suap");
    s.sinyal(10_500);
    expect(s.k.status).not.toBe("TIDAK_PASTI");
    expect(s.hasil()).toEqual([]);
  });

  it("hasilDariKamera = false → Suap langsung menampilkan teks tadi_masuk", () => {
    const s = new Sim(konteks({ hasilDariKamera: false }));
    s.keGiliranAnak();
    s.tekan("suap");
    expect(s.k.teks).toEqual({ id: "tadi_masuk", tanya: true });
  });

  it("Suap saat kunyah masih aktif → tidak menilai, teks masih ngunyah", () => {
    const s = new Sim();
    s.keGiliranAnak();
    s.sinyal(3000, (d) => ({ rahang: 0.04 * Math.sin(2 * Math.PI * 1.5 * d) }));
    expect(s.k.kunyahAktif).toBe(true);
    s.tekan("suap");
    expect(s.k.status).toBe("MENUNGGU_SUAP");
    expect(s.k.teks?.id).toBe("masih_ngunyah_tunggu");
  });

  it("koreksi mengubah suapan terakhir dan menandai dikoreksi", () => {
    const s = new Sim();
    s.keGiliranAnak();
    s.tekan("suap");
    s.sinyal(6500);
    expect(s.hasil()).toEqual(["ditolak"]);
    s.tekan("koreksi_diterima");
    expect(s.k.gigitan.at(-1)).toMatchObject({ hasil: "diterima", dikoreksi: true });
  });

  it("Stop dan Darurat langsung selesai dengan alasannya", () => {
    for (const [tombol, alasan] of [["stop", "stop"], ["darurat", "stop_darurat"]] as const) {
      const s = new Sim();
      s.sinyal(1000);
      s.tekan(tombol);
      expect(s.k.status).toBe("SELESAI");
      expect(s.k.alasanSelesai).toBe(alasan);
    }
  });
});

describe("jeda kunyah dan ngemut", () => {
  it("diterima → jeda kunyah redup → kunyah selesai → giliran karakter", () => {
    const s = new Sim();
    s.keGiliranAnak();
    s.tekan("suap");
    s.sinyal(1500, buka(0.2, 1));
    s.sinyal(2100);
    expect(s.k.status).toBe("JEDA_KUNYAH");
    expect(tampilan(s.k, s.kx).layar).toBe("redup");
    s.sinyal(5000, (d) => ({ rahang: 0.04 * Math.sin(2 * Math.PI * 1.5 * d) }));
    s.sinyal(4500);
    expect(s.status.slice(-1)[0]).toMatch(/GILIRAN_KARAKTER|MENUNGGU_SUAP/);
  });

  it("mulut tertutup dan rahang diam 15 detik setelah diterima → kemungkinan ngemut; Ya menandai ngemut", () => {
    const s = new Sim();
    s.keGiliranAnak();
    s.tekan("suap");
    s.sinyal(1500, buka(0.2, 1));
    s.sinyal(2100);
    s.sinyal(15_100);
    expect(s.k.status).toBe("KEMUNGKINAN_NGEMUT");
    expect(s.k.teks).toEqual({ id: "ngemut", tanya: true });
    s.tekan("ya");
    expect(s.k.gigitan.at(-1)).toMatchObject({ hasil: "ngemut", dikoreksi: true });
    expect(s.k.teks?.id).toBe("saran_ngemut");
  });

  it("kunyahDariKamera = false → jeda selesai lewat timer 15 detik, tanpa ngemut", () => {
    const s = new Sim(konteks({ kunyahDariKamera: false }));
    s.keGiliranAnak();
    s.tekan("suap");
    s.sinyal(1500, buka(0.2, 1));
    s.sinyal(2100);
    s.sinyal(15_100);
    expect(s.status).not.toContain("KEMUNGKINAN_NGEMUT");
    expect(s.k.status).toMatch(/GILIRAN_KARAKTER|MENUNGGU_SUAP/);
  });
});

describe("aturan global dan wajah hilang", () => {
  it("waktu sesi ≥ max_minutes → selesai waktu_habis dengan klip waktunya_selesai", () => {
    const s = new Sim(konteks({}, 1, { max_minutes: 10 }));
    s.keGiliranAnak();
    s.kirim({ jenis: "detik", t: 10 * MNT });
    expect(s.k.status).toBe("SELESAI");
    expect(s.k.alasanSelesai).toBe("waktu_habis");
    expect(s.klip.at(-1)).toBe("waktunya_selesai");
  });

  it("15 menit tanpa suapan diterima → selesai terlalu_lama_menolak", () => {
    const s = new Sim();
    s.keGiliranAnak();
    s.kirim({ jenis: "detik", t: s.t + 15 * MNT });
    expect(s.k.alasanSelesai).toBe("terlalu_lama_menolak");
    expect(s.k.teks?.id).toBe("akhiri_tidak_apa");
  });

  it("wajah hilang > 1,5 detik saat menunggu → TIDAK_TERLIHAT, lalu kembali saat terlihat", () => {
    const s = new Sim();
    s.keGiliranAnak();
    s.sinyal(2000, () => ({ terlihat: false }));
    expect(s.k.status).toBe("TIDAK_TERLIHAT");
    expect(s.k.teks?.id).toBe("wajah_tidak_terlihat");
    s.sinyal(100);
    expect(s.k.status).toBe("MENUNGGU_SUAP");
  });

  it("teks biasa hilang sendiri setelah 8 detik, teks tanya tidak", () => {
    const s = new Sim();
    s.keGiliranAnak();
    s.tekan("suap");
    s.sinyal(6500);
    expect(s.k.teks?.id).toBe("jangan_dibujuk");
    s.sinyal(8100);
    expect(s.k.teks).toBeNull();
  });
});

describe("saklar tahap", () => {
  it("tahap 1: karakter menggigit; tiap putaran ke-3 mengajak pengasuh", () => {
    const s = new Sim(konteks({}, 1));
    s.keGiliranAnak();
    expect(s.pose).toContain("menggigit");
    expect(s.klip).toContain("karakter_enak");
    for (let i = 0; i < 2; i++) { s.tekan("suap"); s.sinyal(6500); s.tekan("lanjut"); s.sinyal(25_000); }
    expect(s.klip).toContain("mbak_gigit_duluan");
  });

  it("tahap 2: karakter tidak menggigit, pengasuh selalu diajak", () => {
    const s = new Sim(konteks({}, 2));
    s.keGiliranAnak();
    expect(s.pose).not.toContain("menggigit");
    expect(s.klip).toContain("mbak_gigit_duluan");
  });

  it("tahap 3: layar selalu hitam", () => {
    const s = new Sim(konteks({}, 3));
    s.keGiliranAnak();
    expect(tampilan(s.k, s.kx).layar).toBe("hitam");
    s.tekan("suap");
    s.sinyal(1500, buka(0.2, 1));
    s.sinyal(2100);
    expect(s.k.status).toBe("JEDA_KUNYAH");
    expect(tampilan(s.k, s.kx).layar).toBe("hitam");
  });

  it("saklarTahap sesuai tabel II.7 dan membatasi tahap di luar 1–4", () => {
    expect(saklarTahap(4)).toEqual({ layar: "catat_saja", karakterMenggigit: false, ajakPengasuhGigit: "tidak", suara: false });
    expect(saklarTahap(0).layar).toBe("nyala");
    expect(saklarTahap(9).layar).toBe("catat_saja");
  });
});

describe("keluaran", () => {
  it("tampilan selalu lolos TampilanSesiSchema dan hasil lolos SesiSelesaiSchema", () => {
    const s = new Sim();
    s.keGiliranAnak();
    expect(() => TampilanSesiSchema.parse(tampilan(s.k, s.kx))).not.toThrow();
    s.tekan("suap");
    s.sinyal(1500, buka(0.2, 1));
    expect(() => TampilanSesiSchema.parse(tampilan(s.k, s.kx))).not.toThrow();
    s.tekan("stop");
    const h = hasilSesi(s.k, s.kx, {
      child_id: "anak-1", menu: "brokoli", makanan_baru: true,
      mulaiIso: "2026-11-11T00:00:00.000Z", selesaiIso: "2026-11-11T00:00:09.000Z",
    });
    expect(SesiSelesaiSchema.parse(h)).toEqual(h);
    expect(h!.gigitan).toEqual([{ detik: expect.any(Number), hasil: "diterima", dikoreksi: false }]);
    expect(h!.alasan_selesai).toBe("stop");
  });

  it("mulut karakter meniru mulut anak saat menunggu suap", () => {
    const s = new Sim();
    s.keGiliranAnak();
    s.sinyal(200, () => ({ mulut: 0.45 }));
    expect(tampilan(s.k, s.kx).mulutKarakter).toBeCloseTo(0.45);
  });
});

describe("rekaman contoh", () => {
  it("diputar ke engine dengan Suap di detik 2; 10,5; 19; 22 → 3 diterima, 1 ditolak", () => {
    const s = new Sim();
    // Engine mulai 8 detik sebelum rekaman (kalibrasi 3 s + giliran karakter 4 s) supaya loop sudah siap.
    // Suap kedua di detik 10,5, bukan 9,5: kunyah pertama baru berhenti ±8,7 s, dan Suap saat kunyah masih
    // aktif memang sengaja tidak dinilai.
    s.t = -8000;
    s.k = sesiAwal(-8000).keadaan;
    s.sinyal(3100);
    s.tekan("lewati_pemanasan");
    s.sinyal(4100);
    const suap = [2000, 10500, 19000, 22000];
    for (const sinyal of buatRekaman().sinyal) {
      if (suap.includes(sinyal.t)) s.kirim({ jenis: "tombol", tombol: "suap", t: sinyal.t });
      s.kirim({ jenis: "sinyal", s: sinyal });
      if (s.k.status === "PEMANASAN") s.kirim({ jenis: "pemanasan_selesai", t: sinyal.t });
    }
    expect(s.hasil().filter((h) => h === "diterima")).toHaveLength(3);
    expect(s.hasil().filter((h) => h === "ditolak")).toHaveLength(1);
  });
});

describe("teks saat diterima", () => {
  it("teks 'jangan dibujuk' hilang saat suapan berikutnya diterima", () => {
    const s = new Sim();
    s.keGiliranAnak();
    s.tekan("suap");
    s.sinyal(1500, (d) => ({ yaw: d < 1.2 ? -35 : 0 }));
    expect(s.k.teks?.id).toBe("jangan_dibujuk");
    s.tekan("suap");
    s.sinyal(1500, buka(0.2, 1));
    expect(s.k.status).toBe("DITERIMA");
    expect(s.k.teks).toBeNull();
  });
});
