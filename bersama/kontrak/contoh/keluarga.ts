// Pemilik: B (Satya). Contoh response endpoint keluarga (jobdesk 2.8, B0.4). Tipe di sini mengikuti tabel 2.5;
// bila `bersama/kontrak/api.ts` (C) sudah ada, tipe ini diganti `z.infer` dari skema C.
// Data: Dika (4 th 2 bln, Mbak Rini, tahap 1, trial sisa 3 hari) + keadaan sulit.

export type Plan = "trial" | "program" | "klinik";
export type AlasanTerkunci = "skrining_belum" | "tanda_bahaya" | "trial_habis" | null;

export type Saya = {
  child: {
    id: string; panggilan: string; usia_bulan: number; sapaan: "mbak" | "bu" | "oma" | "ayah";
    nama_pengasuh: string; plan: Plan; trial_until: string | null; stage: number;
  };
  sesi_dibuka: boolean;
  alasan_terkunci: AlasanTerkunci;
};

export type Aturan = {
  max_minutes: number; stage: number;
  advance_rule: { sessions: number; min_accepted_bites: number };
  end_after_refusal_minutes: number; ngemut_hint: string;
};

export type AturanAnak = { aturan: Aturan; source: "default" | "dokter"; confirmed_at: string | null };

export type SesiLaporan = {
  id: string; tanggal: string; jam: string; menu: string;
  diterima: number; ditolak: number; ngemut: number; durasi: number; // durasi dalam menit
};

export type Laporan = {
  tahap: number;
  stiker_minggu_ini: boolean[]; // 7 hari, Senin..Minggu minggu ini
  paparan: { makanan: string; jumlah: number; target: number }[];
  sesi: SesiLaporan[];
  ringkasan_keluarga: string | null;
  plan: Plan;
  trial_sisa_hari: number | null;
};

export type HasilSimpanSesi = {
  session_id: string; naik_tahap: boolean; tahap_baru: number; saran_turun_tahap: boolean;
  paparan: { makanan: string; jumlah: number } | null;
};

export type Ringkasan = { keluarga: string; dokter: string; sumber: "ai" | "cache" | "template" };

export const ATURAN_DEFAULT_CONTOH: Aturan = {
  max_minutes: 30, stage: 1,
  advance_rule: { sessions: 5, min_accepted_bites: 5 },
  end_after_refusal_minutes: 15,
  ngemut_hint: "Tunggu sebentar, tawarkan minum sedikit, jangan dipaksa menelan",
};

export const CONTOH_SAYA: Saya = {
  child: {
    id: "anak-dika", panggilan: "Dika", usia_bulan: 50, sapaan: "mbak", nama_pengasuh: "Rini",
    plan: "trial", trial_until: "2026-11-14T23:59:00+07:00", stage: 1,
  },
  sesi_dibuka: true,
  alasan_terkunci: null,
};

export const CONTOH_SAYA_ANAK_BARU: Saya = {
  child: { ...CONTOH_SAYA.child, id: "anak-nara", panggilan: "Nara", usia_bulan: 38, trial_until: null },
  sesi_dibuka: false,
  alasan_terkunci: "skrining_belum",
};

export const CONTOH_SAYA_TANDA_BAHAYA: Saya = {
  ...CONTOH_SAYA_ANAK_BARU, alasan_terkunci: "tanda_bahaya",
};

export const CONTOH_SAYA_TRIAL_HABIS: Saya = {
  child: { ...CONTOH_SAYA.child, trial_until: "2026-11-08T23:59:00+07:00" },
  sesi_dibuka: false,
  alasan_terkunci: "trial_habis",
};

export const CONTOH_SAYA_NAMA_PANJANG: Saya = {
  child: { ...CONTOH_SAYA.child, panggilan: "Muhammad Rafandra Alfarizqi", nama_pengasuh: "Rini Kusumawardhani Prameswari" },
  sesi_dibuka: true,
  alasan_terkunci: null,
};

export const CONTOH_ATURAN: AturanAnak = { aturan: ATURAN_DEFAULT_CONTOH, source: "default", confirmed_at: null };

/** 14 hari sesi bervariasi; sesi malam sengaja lebih banyak ditolak supaya ringkasan punya pola. */
export function buatSesiContoh(hariIni = new Date("2026-11-11T12:00:00+07:00")): SesiLaporan[] {
  const sesi: SesiLaporan[] = [];
  for (let h = 1; h <= 14; h++) {
    const tgl = new Date(hariIni.getTime() - h * 86_400_000);
    const tanggal = tgl.toISOString().slice(0, 10);
    const pagi = { diterima: 4 + ((h * 3) % 4), ditolak: 1 + (h % 2), ngemut: h % 5 === 0 ? 1 : 0 };
    sesi.push({ id: `sesi-${h}-pagi`, tanggal, jam: "07.00", menu: h % 3 === 0 ? "umum" : "brokoli", ...pagi, durasi: 14 + (h % 6) });
    if (h % 2 === 0) {
      sesi.push({ id: `sesi-${h}-malam`, tanggal, jam: "18.30", menu: "umum", diterima: 1 + (h % 2), ditolak: 4 + (h % 3), ngemut: h % 4 === 0 ? 1 : 0, durasi: 15 });
    }
  }
  return sesi;
}

export const CONTOH_LAPORAN: Laporan = {
  tahap: 1,
  stiker_minggu_ini: [true, true, false, false, false, false, false],
  paparan: [{ makanan: "brokoli", jumlah: 4, target: 10 }],
  sesi: buatSesiContoh(),
  ringkasan_keluarga:
    "Minggu ini Dika paling mudah menerima suapan saat sarapan (rata-rata 5 suapan). Di makan malam, Dika lebih sering menolak. Coba tawarkan makan malam lebih awal, sebelum Dika terlalu lelah.",
  plan: "trial",
  trial_sisa_hari: 3,
};

export const CONTOH_LAPORAN_KOSONG: Laporan = {
  tahap: 1, stiker_minggu_ini: [false, false, false, false, false, false, false],
  paparan: [], sesi: [], ringkasan_keluarga: null, plan: "trial", trial_sisa_hari: 5,
};

export const CONTOH_SIMPAN_SESI: HasilSimpanSesi = {
  session_id: "sesi-baru", naik_tahap: false, tahap_baru: 1, saran_turun_tahap: false,
  paparan: { makanan: "brokoli", jumlah: 5 },
};

export const CONTOH_RINGKASAN: Ringkasan = {
  keluarga: CONTOH_LAPORAN.ringkasan_keluarga!,
  dokter:
    "14 hari terakhir: 21 sesi, rata-rata 4,6 suapan diterima per sesi. Penolakan terkonsentrasi di sesi malam (rata-rata 5 ditolak vs 1,5 pagi). Ngemut dikonfirmasi 3 kali.",
  sumber: "template",
};
