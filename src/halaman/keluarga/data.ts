// Pemilik: B (Satya). Satu-satunya pintu data layar keluarga.
// SEMENTARA: `src/lib/panggil.ts` dan `bersama/kontrak/api.ts` (C) belum ada, jadi setiap fungsi membalas dari
// server tiruan di browser (localStorage `tm_contoh_keluarga_v1`), mengikuti tabel endpoint jobdesk 2.5.
// Saat panggil() siap: ganti isi tiap fungsi dengan `panggil(<endpoint>, data)`; tanda tangan fungsi tetap.
// Tidak ada fetch di file ini.
import type { SesiSelesai } from "../../../bersama/kontrak/sesi.ts";
import {
  ATURAN_DEFAULT_CONTOH, CONTOH_RINGKASAN, buatSesiContoh,
  type AturanAnak, type HasilSimpanSesi, type Laporan, type Plan, type Ringkasan, type Saya, type SesiLaporan,
} from "../../../bersama/kontrak/contoh/keluarga.ts";

export type { AturanAnak, HasilSimpanSesi, Laporan, Ringkasan, Saya, SesiLaporan };

export class GalatApi extends Error {
  constructor(public status: number, pesan: string) { super(pesan); }
}

type Anak = {
  id: string; kode: string; panggilan: string; tanggal_lahir: string; sapaan: Saya["child"]["sapaan"];
  nama_pengasuh: string; plan: Plan; trial_until: string | null; stage: number;
  skrining: "belum" | "aman" | "bahaya";
  sesi: (SesiLaporan & { porsi?: string; mood?: string })[];
  paparan: Record<string, number>;
  ringkasan: string | null;
  token: string | null;
};
type Toko = { masuk: string | null; anak: Record<string, Anak> };

const KUNCI = "tm_contoh_keluarga_v1";
const HARI = 86_400_000;
export const KODE_DEMO_DIKA = "DKAX7QMP2RHT";

function seed(): Toko {
  const trial = new Date(Date.now() + 2 * HARI); // sisa 3 hari (termasuk hari ini)
  trial.setHours(23, 59, 0, 0);
  return {
    masuk: null,
    anak: {
      "anak-dika": {
        id: "anak-dika", kode: KODE_DEMO_DIKA, panggilan: "Dika", tanggal_lahir: tglLahirDariUsia(50),
        sapaan: "mbak", nama_pengasuh: "Rini", plan: "trial", trial_until: trial.toISOString(), stage: 1,
        skrining: "aman", sesi: buatSesiContoh(new Date()), paparan: { brokoli: 4 }, ringkasan: null, token: null,
      },
    },
  };
}

function tglLahirDariUsia(bulan: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - bulan);
  d.setDate(d.getDate() - 3);
  return d.toISOString().slice(0, 10);
}

function baca(): Toko {
  try {
    const t = localStorage.getItem(KUNCI);
    if (t) return JSON.parse(t) as Toko;
  } catch { /* abaikan */ }
  const s = seed();
  tulis(s);
  return s;
}
function tulis(t: Toko) {
  try { localStorage.setItem(KUNCI, JSON.stringify(t)); } catch { /* abaikan */ }
}

const tunda = (ms = 220) => new Promise((r) => setTimeout(r, ms));

function anakMasuk(t: Toko): Anak {
  const a = t.masuk ? t.anak[t.masuk] : undefined;
  if (!a) throw new GalatApi(401, "Silakan masuk dulu.");
  return a;
}

export function usiaBulan(tanggalLahir: string, kini = new Date()): number {
  const l = new Date(tanggalLahir);
  let b = (kini.getFullYear() - l.getFullYear()) * 12 + (kini.getMonth() - l.getMonth());
  if (kini.getDate() < l.getDate()) b -= 1;
  return Math.max(0, b);
}

function sisaTrial(a: Anak): number | null {
  if (a.plan !== "trial" || !a.trial_until) return null;
  return Math.max(0, Math.ceil((new Date(a.trial_until).getTime() - Date.now()) / HARI));
}

function keSaya(a: Anak): Saya {
  const habis = a.plan === "trial" && a.trial_until !== null && new Date(a.trial_until).getTime() < Date.now();
  const alasan = a.skrining === "belum" ? "skrining_belum" : a.skrining === "bahaya" && a.plan !== "klinik" ? "tanda_bahaya" : habis ? "trial_habis" : null;
  return {
    child: {
      id: a.id, panggilan: a.panggilan, usia_bulan: usiaBulan(a.tanggal_lahir), sapaan: a.sapaan,
      nama_pengasuh: a.nama_pengasuh, plan: a.plan, trial_until: a.trial_until, stage: a.stage,
    },
    sesi_dibuka: alasan === null,
    alasan_terkunci: alasan,
  };
}

function tanggalLokal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const ALFABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // tanpa 0/O/1/I
function acak(n: number, alfabet = ALFABET): string {
  const b = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(b, (x) => alfabet[x % alfabet.length]).join("");
}

export const api = {
  /** POST /api/children */
  async buatAnak(d: { panggilan: string; tanggal_lahir: string; sapaan: Saya["child"]["sapaan"]; nama_pengasuh: string }) {
    await tunda();
    const t = baca();
    const id = `anak-${acak(8).toLowerCase()}`;
    const kode = acak(12);
    t.anak[id] = {
      id, kode, ...d, plan: "trial", trial_until: null, stage: 1, skrining: "belum",
      sesi: [], paparan: {}, ringkasan: null, token: null,
    };
    t.masuk = id;
    tulis(t);
    return { child_id: id, kode_akses: kode };
  },

  /** POST /api/masuk */
  async masuk(kode: string) {
    await tunda();
    const t = baca();
    const bersih = kode.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const a = Object.values(t.anak).find((x) => x.kode === bersih);
    if (!a) throw new GalatApi(401, "Kode tidak dikenal. Periksa lagi huruf dan angkanya.");
    t.masuk = a.id;
    tulis(t);
  },

  /** POST /api/demo/masuk { sebagai: "keluarga_dika" } (mode demo) */
  async demoMasukDika() {
    await tunda(100);
    const t = seed();
    t.masuk = "anak-dika";
    tulis(t);
  },

  /** GET /api/saya */
  async saya(): Promise<Saya> {
    await tunda(120);
    return keSaya(anakMasuk(baca()));
  },

  /** POST /api/screenings */
  async skrining(jawaban: boolean[]) {
    await tunda();
    if (jawaban.length !== 7) throw new GalatApi(400, "Jawab ketujuh pertanyaan.");
    const t = baca();
    const a = anakMasuk(t);
    const ada = jawaban.some(Boolean);
    a.skrining = ada ? "bahaya" : "aman";
    if (!ada && !a.trial_until) {
      const akhir = new Date(Date.now() + 5 * HARI);
      akhir.setHours(23, 59, 0, 0);
      a.trial_until = akhir.toISOString();
    }
    tulis(t);
    return { ada_tanda_bahaya: ada };
  },

  /** GET /api/children/:id/rules */
  async aturan(_childId: string): Promise<AturanAnak> {
    await tunda(120);
    const a = anakMasuk(baca());
    return { aturan: { ...ATURAN_DEFAULT_CONTOH, stage: a.stage }, source: "default", confirmed_at: null };
  },

  /** POST /api/sessions */
  async simpanSesi(h: SesiSelesai): Promise<HasilSimpanSesi> {
    await tunda(300);
    const t = baca();
    const a = anakMasuk(t);
    const mulai = new Date(h.mulai);
    const hitung = (x: string) => h.gigitan.filter((g) => g.hasil === x).length;
    const id = `sesi-${acak(10).toLowerCase()}`;
    a.sesi.unshift({
      id, tanggal: tanggalLokal(mulai),
      jam: `${String(mulai.getHours()).padStart(2, "0")}.${String(mulai.getMinutes()).padStart(2, "0")}`,
      menu: h.menu, diterima: hitung("diterima"), ditolak: hitung("ditolak"), ngemut: hitung("ngemut"),
      durasi: Math.max(1, Math.round(h.durasi_detik / 60)),
    });
    let paparan: HasilSimpanSesi["paparan"] = null;
    if (h.makanan_baru) {
      a.paparan[h.menu] = (a.paparan[h.menu] ?? 0) + 1;
      paparan = { makanan: h.menu, jumlah: a.paparan[h.menu] };
    }
    const { sessions, min_accepted_bites } = ATURAN_DEFAULT_CONTOH.advance_rule;
    const akhir = a.sesi.slice(0, sessions);
    const siap = akhir.length >= sessions && akhir.every((s) => s.diterima >= min_accepted_bites);
    const naik = siap && a.plan !== "klinik" && a.stage < 4;
    if (naik) a.stage += 1;
    const turun = a.stage > 1 && a.sesi.length >= 3 && a.sesi.slice(0, 3).every((s) => s.diterima === 0);
    tulis(t);
    return { session_id: id, naik_tahap: naik, tahap_baru: a.stage, saran_turun_tahap: turun, paparan };
  },

  /** POST /api/sessions/:id/notes */
  async catatan(sessionId: string, d: { porsi?: "sedikit" | "setengah" | "habis"; mood?: "senang" | "biasa" | "rewel" }) {
    await tunda();
    const t = baca();
    const s = anakMasuk(t).sesi.find((x) => x.id === sessionId);
    if (!s) throw new GalatApi(404, "Sesi tidak ditemukan.");
    Object.assign(s, d);
    tulis(t);
  },

  /** GET /api/children/:id/report */
  async laporan(_childId: string): Promise<Laporan> {
    await tunda(180);
    const a = anakMasuk(baca());
    const kini = new Date();
    const senin = new Date(kini);
    senin.setDate(kini.getDate() - ((kini.getDay() + 6) % 7));
    const hari = new Set(a.sesi.filter((s) => s.diterima > 0).map((s) => s.tanggal));
    const stiker = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(senin);
      d.setDate(senin.getDate() + i);
      return hari.has(tanggalLokal(d));
    });
    const batas = tanggalLokal(new Date(Date.now() - 14 * HARI));
    return {
      tahap: a.stage,
      stiker_minggu_ini: stiker,
      paparan: Object.entries(a.paparan).map(([makanan, jumlah]) => ({ makanan, jumlah, target: 10 })),
      sesi: a.sesi.filter((s) => s.tanggal >= batas),
      ringkasan_keluarga: a.ringkasan,
      plan: a.plan,
      trial_sisa_hari: sisaTrial(a),
    };
  },

  /** POST /api/summaries/:childId */
  async ringkasan(_childId: string): Promise<Ringkasan> {
    await tunda(900);
    const t = baca();
    const a = anakMasuk(t);
    if (a.sesi.length === 0) {
      return { keluarga: `Belum ada sesi minggu ini. Mulai sesi pertama ${a.panggilan} kapan saja.`, dokter: "Belum ada sesi.", sumber: "template" };
    }
    const r = a.panggilan === "Dika" ? CONTOH_RINGKASAN : templatRingkasan(a);
    a.ringkasan = r.keluarga;
    tulis(t);
    return r;
  },

  /** POST /api/reports/share */
  async bagikan() {
    await tunda();
    const t = baca();
    const a = anakMasuk(t);
    if (!a.token) {
      a.token = acak(43, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_");
      tulis(t);
    }
    return { token: a.token, url: `/r/${a.token}` };
  },

  /** POST /api/plan/activate */
  async aktifkan(_paket: "program_30") {
    await tunda();
    const t = baca();
    const a = anakMasuk(t);
    a.plan = "program";
    tulis(t);
    return { plan: "program" as const };
  },
};

function templatRingkasan(a: Anak): Ringkasan {
  const n = a.sesi.length;
  const rata = a.sesi.reduce((s, x) => s + x.diterima, 0) / n;
  const keluarga = `${a.panggilan} sudah makan bareng ${n} kali. Rata-rata ${rata.toFixed(1).replace(".", ",")} suapan diterima per sesi.`;
  return { keluarga, dokter: keluarga, sumber: "template" };
}
