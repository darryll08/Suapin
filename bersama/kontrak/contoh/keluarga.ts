// Pemilik: B (Satya). Contoh respons endpoint keluarga diturunkan dari kontrak API.
// Data: Dika (4 th 2 bln, Mbak Rini, tahap 1, trial sisa 3 hari) + keadaan sulit.

import type { Keluaran, NamaEndpoint } from "../api.ts";
import { ATURAN_DEFAULT } from "../aturan.ts";

export type Saya = Keluaran<"saya">;
export type Plan = Saya["child"]["plan"];
export type AlasanTerkunci = Saya["alasan_terkunci"];
export type Aturan = Keluaran<"aturanBaca">["aturan"];
export type AturanAnak = Keluaran<"aturanBaca">;
export type Laporan = Keluaran<"laporanKeluarga">;
export type SesiLaporan = Laporan["sesi"][number];
export type HasilSimpanSesi = Keluaran<"sesiSimpan">;
export type Ringkasan = Keluaran<"ringkasanBuat">;

export const ATURAN_DEFAULT_CONTOH: Aturan = ATURAN_DEFAULT;

export const CONTOH_SAYA: Saya = {
  child: {
    id: "anak-dika", panggilan: "Dika", usia_bulan: 50, sapaan: "mbak", nama_pengasuh: "Rini",
    plan: "trial", trial_until: "2026-11-14T16:59:00.000Z", stage: 1, email: "keluarga@demo.test",
  },
  sesi_dibuka: true,
  alasan_terkunci: null,
  paket_sampai: null,
};

export const CONTOH_SAYA_ANAK_BARU: Saya = {
  child: { ...CONTOH_SAYA.child, id: "anak-nara", panggilan: "Nara", usia_bulan: 38, trial_until: null },
  sesi_dibuka: false,
  alasan_terkunci: "skrining_belum",
  paket_sampai: null,
};

export const CONTOH_SAYA_TANDA_BAHAYA: Saya = {
  ...CONTOH_SAYA_ANAK_BARU, alasan_terkunci: "tanda_bahaya",
};

export const CONTOH_SAYA_TRIAL_HABIS: Saya = {
  child: { ...CONTOH_SAYA.child, plan: "expired", trial_until: "2026-11-08T16:59:00.000Z" },
  sesi_dibuka: false,
  alasan_terkunci: "trial_habis",
  paket_sampai: null,
};

export const CONTOH_SAYA_NAMA_PANJANG: Saya = {
  child: { ...CONTOH_SAYA.child, panggilan: "Muhammad Rafandra Alfarizqi", nama_pengasuh: "Rini Kusumawardhani Prameswari" },
  sesi_dibuka: true,
  alasan_terkunci: null,
  paket_sampai: null,
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

const tokenContoh = "contoh-laporan-dika".padEnd(43, "_");

export const CONTOH_API_KELUARGA = {
  anakBuat: { child_id: CONTOH_SAYA_ANAK_BARU.child.id },
  saya: CONTOH_SAYA,
  skriningSimpan: { ada_tanda_bahaya: false },
  aturanBaca: CONTOH_ATURAN,
  sesiSimpan: CONTOH_SIMPAN_SESI,
  laporanKeluarga: CONTOH_LAPORAN,
  laporanBagikan: { token: tokenContoh, url: "/r/" + tokenContoh },
  paketAktifkan: { plan: "program" },
  ringkasanBuat: CONTOH_RINGKASAN,
  notifikasiDaftar: { belum_dibaca: 1, kunci_publik: null, notifikasi: [{ id: "n-1", jenis: "pengingat",
    judul: "Yuk makan bareng Dika lagi", isi: "Sudah beberapa hari belum ada sesi.", tautan: "/sesi",
    dibuat: "2026-11-12T01:00:00.000Z", dibaca: false }] },
} satisfies Partial<{ [N in NamaEndpoint]: Keluaran<N> }>;
