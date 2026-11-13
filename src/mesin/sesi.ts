// Pemilik: A (Darryl). A2.2: state machine sesi makan (dokumen produk II.6.5, PRD F-17/F-18).
// Fungsi murni: next(keadaan, kejadian, konteks) → { keadaan, perintah }. Tidak ada Date.now, timer, atau DOM;
// semua waktu datang dari kejadian (ms, performance.now). Semua angka ambang dari konteks.ambang (K10).
//
// Tampilan (pose, layar, teks, klip) disimpan di keadaan lalu dibaca lewat `tampilan()`. `perintah` hanya efek
// ke luar engine: izin isi baseline dan mode kalibrasi pada sumber kamera.
import type { IdKlip } from "../../bersama/konten/klip.ts";
import type { IdTeks } from "../../bersama/konten/teks.ts";
import type { Sinyal } from "../../bersama/kontrak/sinyal.ts";
import type {
  AlasanSelesai, Gigitan, ModeLayar, Pose, SesiSelesai, StatusSesi, TampilanSesi,
} from "../../bersama/kontrak/sesi.ts";
import { TEKS } from "../../bersama/konten/teks.ts";
import type { Ambang } from "./ambang.ts";
import { kunyahAwal, langkahKunyah, type KeadaanKunyah } from "./kunyah.ts";
import type { SaklarTahap } from "./tahap.ts";

/** Kolom aturan yang dipakai sesi. Cocok dengan `AturanSchema` milik C (bersama/kontrak/aturan.ts). */
export type AturanSesi = {
  max_minutes: number;
  end_after_refusal_minutes: number;
  stage: number;
  ngemut_hint: string;
};

export type Konteks = {
  aturan: AturanSesi;
  saklar: SaklarTahap;
  ambang: Ambang;
  /** Simpangan baku rahang saat diam dari baseline sumber (untuk penghitung kunyahan). */
  getarDiam: number;
};

export type Tombol =
  | "suap" | "lanjut" | "ya" | "tidak" | "stop" | "darurat" | "lewati_pemanasan" | "koreksi_diterima" | "koreksi_ditolak";

export type Kejadian =
  | { jenis: "sinyal"; s: Sinyal }
  | { jenis: "tombol"; tombol: Tombol; t: number }
  | { jenis: "detik"; t: number }
  | { jenis: "pemanasan_selesai"; t: number };

export type Perintah = { jenis: "baselineBoleh"; nilai: boolean } | { jenis: "kalibrasi"; aktif: boolean };

export type Keadaan = {
  status: StatusSesi;
  /** Status yang dilanjutkan setelah wajah terlihat lagi. */
  sebelumHilang: StatusSesi | null;
  mulai: number;
  sekarang: number;
  masukStatus: number;
  /** Awal loop (setelah pemanasan); dasar hitungan batas menolak. */
  awalLoop: number | null;
  terakhirDiterima: number | null;
  putaran: number;
  pose: Pose;
  makananTahap: 0 | 1 | 2 | 3 | 4;
  teks: { id: IdTeks; tanya: boolean } | null;
  teksSejak: number;
  klip: { id: IdKlip; nonce: number } | null;
  klipTerakhir: Partial<Record<IdKlip, number>>;
  teksTerakhir: Partial<Record<IdTeks, number>>;
  gigitan: Gigitan[];
  /** Sinyal terakhir (3 detik; selama MENILAI sejak tSuap - buffer). */
  buffer: Sinyal[];
  tSuap: number | null;
  /** Batas jendela penilaian saat ini (diperpanjang selama mulut terbuka). */
  akhirJendela: number | null;
  yawMenolakSejak: number | null;
  siklusSejakSuap: number;
  hilangSejak: number | null;
  kunyah: KeadaanKunyah;
  kunyahAktif: boolean;
  /** Sejak kapan mulut tertutup tanpa kunyah selama jeda (dugaan ngemut). */
  diamSejak: number | null;
  kalibrasiAktif: boolean;
  alasanSelesai: AlasanSelesai | null;
  selesaiPada: number | null;
};

const KALIBRASI_MS = 3_000;
const GILIRAN_MS = 4_000; // karakter menggigit ±2,5 detik lalu "Sekarang giliranmu"
const GIGIT_MS = 2_500;
const MERAYAKAN_MS = 2_000;
const TAWARKAN_MS = 60_000;
const ULANG_KLIP_MS = 20_000;
const ULANG_TEKS_MS = 60_000;
const TEKS_HILANG_MS = 8_000;
const STATUS_LOOP: StatusSesi[] = [
  "PEMANASAN", "GILIRAN_KARAKTER", "MENUNGGU_SUAP", "MENILAI", "DITERIMA", "JEDA_KUNYAH",
  "KEMUNGKINAN_NGEMUT", "MENOLAK", "TIDAK_PASTI", "TIDAK_TERLIHAT",
];
// Status yang butuh wajah anak; di status lain wajah hilang tidak menghentikan apa pun.
const STATUS_BUTUH_WAJAH: StatusSesi[] = ["MENUNGGU_SUAP", "JEDA_KUNYAH"];

export function sesiAwal(t: number): { keadaan: Keadaan; perintah: Perintah[] } {
  const k: Keadaan = {
    status: "KALIBRASI", sebelumHilang: null, mulai: t, sekarang: t, masukStatus: t, awalLoop: null,
    terakhirDiterima: null, putaran: 0, pose: "netral", makananTahap: 0, teks: null, teksSejak: t, klip: null,
    klipTerakhir: {}, teksTerakhir: {}, gigitan: [], buffer: [], tSuap: null, akhirJendela: null,
    yawMenolakSejak: null, siklusSejakSuap: 0, hilangSejak: null, kunyah: kunyahAwal(), kunyahAktif: false,
    diamSejak: null, kalibrasiAktif: true, alasanSelesai: null, selesaiPada: null,
  };
  putarKlip(k, "sapa_awal", t);
  return { keadaan: k, perintah: [{ jenis: "kalibrasi", aktif: true }, { jenis: "baselineBoleh", nilai: true }] };
}

// ---------- pembantu (mengubah salinan keadaan di dalam next) ----------

function putarKlip(k: Keadaan, id: IdKlip, t: number) {
  const lalu = k.klipTerakhir[id];
  if (lalu !== undefined && t - lalu < ULANG_KLIP_MS) return;
  k.klipTerakhir[id] = t;
  k.klip = { id, nonce: (k.klip?.nonce ?? 0) + 1 };
}

function tampilkanTeks(k: Keadaan, id: IdTeks, t: number) {
  const tanya = TEKS[id].tanya;
  const lalu = k.teksTerakhir[id];
  if (!tanya && lalu !== undefined && t - lalu < ULANG_TEKS_MS) return;
  k.teksTerakhir[id] = t;
  k.teks = { id, tanya };
  k.teksSejak = t;
}

const detikSesi = (k: Keadaan, t: number) => Math.max(0, Math.round((t - k.mulai) / 100) / 10);

function catat(k: Keadaan, hasil: Gigitan["hasil"], t: number, dikoreksi: boolean) {
  k.gigitan.push({ detik: detikSesi(k, t), hasil, dikoreksi });
  if (hasil === "diterima") k.terakhirDiterima = t;
}

function ke(k: Keadaan, status: StatusSesi, t: number, kx: Konteks, p: Perintah[]) {
  const dari = k.status;
  k.status = status;
  k.masukStatus = t;
  // Teks tanya selalu ditutup saat status berganti; teks biasa hilang sendiri setelah 8 detik.
  if (k.teks?.tanya) k.teks = null;
  if (dari === "MENILAI" && status !== "MENILAI") p.push({ jenis: "baselineBoleh", nilai: !k.kunyahAktif });

  switch (status) {
    case "PEMANASAN":
      k.pose = "enak";
      break;
    case "GILIRAN_KARAKTER": {
      k.awalLoop ??= t;
      k.putaran++;
      const ajak = kx.saklar.ajakPengasuhGigit === "selalu" || (kx.saklar.ajakPengasuhGigit === "kadang" && k.putaran % 3 === 0);
      if (kx.saklar.karakterMenggigit) {
        k.pose = "menggigit";
        // Utuh + 4 gigitan (gambar makanan punya 5 tahap, bersama/konten/makanan.ts).
        k.makananTahap = ((k.makananTahap + 1) % 5) as 0 | 1 | 2 | 3 | 4;
      } else {
        k.pose = "enak";
      }
      if (ajak) putarKlip(k, "mbak_gigit_duluan", t);
      break;
    }
    case "MENUNGGU_SUAP":
      k.pose = "menunggu";
      putarKlip(k, "giliranmu", t);
      break;
    case "MENILAI":
      k.pose = "menunggu";
      p.push({ jenis: "baselineBoleh", nilai: false });
      break;
    case "DITERIMA":
      k.pose = "merayakan";
      k.teks = null; // arahan saat menolak tidak relevan lagi
      putarKlip(k, k.gigitan.filter((g) => g.hasil === "diterima").length % 2 ? "hore" : "tos_mbak", t);
      break;
    case "JEDA_KUNYAH":
      k.pose = "mengunyah";
      k.kunyah = kunyahAwal();
      k.kunyahAktif = false;
      k.diamSejak = t;
      putarKlip(k, "masih_ngunyah", t);
      break;
    case "KEMUNGKINAN_NGEMUT":
      k.pose = "santai";
      tampilkanTeks(k, "ngemut", t);
      break;
    case "MENOLAK":
      // K11: datar. Tidak ada klip hore atau pose merayakan.
      k.pose = "santai";
      putarKlip(k, "nanti_lagi", t);
      tampilkanTeks(k, "jangan_dibujuk", t);
      break;
    case "TIDAK_PASTI":
      k.pose = "netral";
      tampilkanTeks(k, "tadi_masuk", t);
      break;
    case "TIDAK_TERLIHAT":
      k.pose = "menunggu";
      tampilkanTeks(k, "wajah_tidak_terlihat", t);
      break;
    case "SELESAI":
      k.selesaiPada = t;
      break;
    case "KALIBRASI":
      break;
  }
}

function selesai(k: Keadaan, alasan: AlasanSelesai, t: number, kx: Konteks, p: Perintah[]) {
  k.alasanSelesai = alasan;
  if (alasan === "waktu_habis") {
    putarKlip(k, "waktunya_selesai", t);
    tampilkanTeks(k, "waktu_habis", t);
  } else if (alasan === "terlalu_lama_menolak") {
    tampilkanTeks(k, "akhiri_tidak_apa", t);
  } else if (k.teks?.tanya) {
    k.teks = null;
  }
  if (k.kalibrasiAktif) { k.kalibrasiAktif = false; p.push({ jenis: "kalibrasi", aktif: false }); }
  ke(k, "SELESAI", t, kx, p);
}

function mulaiMenilai(k: Keadaan, t: number, kx: Konteks, p: Perintah[]) {
  // Kunyahan nyata tidak selalu berirama rapi, jadi `kunyahAktif` sering padam sesaat. Untuk menahan Suap cukup:
  // ≥ 2 siklus dalam 3 detik terakhir dan siklus terakhir ≤ 1,5 detik lalu.
  // Hanya saat mulut tertutup dan kepala hampir lurus: buka mulut (aaa) atau menoleh juga menggeser rahang.
  const sejenak = k.buffer.filter((s) => s.t > t - 1_500);
  const baruKunyah = sejenak.length > 0 && sejenak.every((s) => s.terlihat && s.mulut < kx.ambang.tutup && Math.abs(s.yaw) < 15) &&
    k.kunyah.terakhir !== null && t - k.kunyah.terakhir <= 1_500 &&
    k.kunyah.siklus.filter((x) => x > t - 3_000).length >= 3;
  if (k.kunyahAktif || baruKunyah) {
    tampilkanTeks(k, "masih_ngunyah_tunggu", t);
    return;
  }
  if (!kx.ambang.hasilDariKamera) {
    ke(k, "TIDAK_PASTI", t, kx, p); // cadangan gerbang: hasil dari tombol pengasuh
    return;
  }
  k.tSuap = t;
  k.akhirJendela = t + kx.ambang.jendelaDetik * 1000;
  k.yawMenolakSejak = null;
  k.siklusSejakSuap = 0;
  ke(k, "MENILAI", t, kx, p);
}

/** Rentang mulut terbuka yang sudah tertutup dan memenuhi syarat diterima. Sampel tidak terlihat diabaikan. */
function cariDiterima(k: Keadaan, a: Ambang): number | null {
  const dariT = k.tSuap! - a.bufferSebelumSuapDetik * 1000;
  let buka: number | null = null;
  let diatasTutup = 0; // sampel terakhir dengan mulut ≥ `tutup`; acuan yang sama dengan mulutSedangTerbuka
  let atas = 0; // sampel terakhir di atas `terbuka`: lama buka diukur sampai sini, bukan sampai `tutup`
  let nangis = false;
  for (const s of k.buffer) {
    if (s.t < dariT || !s.terlihat) continue;
    if (buka === null) {
      if (s.mulut > a.terbuka) { buka = atas = diatasTutup = s.t; nangis = s.nangis; }
      continue;
    }
    nangis ||= s.nangis;
    if (s.mulut > a.terbuka) atas = s.t;
    if (s.mulut >= a.tutup) { diatasTutup = s.t; continue; }
    if (s.t - diatasTutup < a.tutupDetik * 1000) continue;
    const lama = atas - buka;
    if (lama >= a.minBukaDetik * 1000 && lama <= a.batasBukaDetik * 1000 && !nangis) return s.t;
    buka = null;
  }
  return null;
}

/** Masih terbuka sampai mulut di bawah `tutup` selama `tutupDetik` (sama dengan histeresis di cariDiterima). */
function mulutSedangTerbuka(k: Keadaan, a: Ambang) {
  const akhir = k.buffer.at(-1)?.t ?? 0;
  return k.buffer.some((s) => s.terlihat && s.t >= akhir - a.tutupDetik * 1000 && s.mulut >= a.tutup);
}

function pernahTerbuka(k: Keadaan, a: Ambang) {
  const dariT = k.tSuap! - a.bufferSebelumSuapDetik * 1000;
  return k.buffer.some((s) => s.t >= dariT && s.terlihat && s.mulut > a.terbuka);
}

// ---------- langkah utama ----------

export function next(lama: Keadaan, e: Kejadian, kx: Konteks): { keadaan: Keadaan; perintah: Perintah[] } {
  const p: Perintah[] = [];
  if (lama.status === "SELESAI") return { keadaan: lama, perintah: p };
  const k: Keadaan = {
    ...lama, buffer: lama.buffer.slice(), gigitan: lama.gigitan.slice(),
    klipTerakhir: { ...lama.klipTerakhir }, teksTerakhir: { ...lama.teksTerakhir },
  };
  const a = kx.ambang;
  const t = e.jenis === "sinyal" ? e.s.t : e.t;
  k.sekarang = t;

  // 1. Sinyal: simpan, kunyah, wajah hilang.
  if (e.jenis === "sinyal") {
    const s = e.s;
    k.buffer.push(s);
    const simpanDari = k.status === "MENILAI" && k.tSuap !== null
      ? Math.min(k.tSuap - a.bufferSebelumSuapDetik * 1000, t - a.bufferSebelumSuapDetik * 1000)
      : t - a.bufferSebelumSuapDetik * 1000;
    while (k.buffer.length && k.buffer[0].t < simpanDari) k.buffer.shift();

    if (a.kunyahDariKamera) {
      const h = langkahKunyah(k.kunyah, s, kx.getarDiam, a);
      if (h.k.terakhir !== k.kunyah.terakhir) k.siklusSejakSuap++;
      k.kunyah = h.k;
      if (h.aktif !== k.kunyahAktif && k.status !== "MENILAI") p.push({ jenis: "baselineBoleh", nilai: !h.aktif });
      k.kunyahAktif = h.aktif;
      if (k.status === "JEDA_KUNYAH" && h.selesai) ke(k, "GILIRAN_KARAKTER", t, kx, p);
    }

    k.hilangSejak = s.terlihat ? null : (k.hilangSejak ?? t);
    if (k.status === "TIDAK_TERLIHAT" && s.terlihat) {
      const balik = k.sebelumHilang ?? "MENUNGGU_SUAP";
      k.sebelumHilang = null;
      if (k.teks?.id === "wajah_tidak_terlihat") k.teks = null;
      ke(k, balik, t, kx, p);
    } else if (
      k.hilangSejak !== null && t - k.hilangSejak > a.tidakTerlihatDetik * 1000
    ) {
      if (STATUS_BUTUH_WAJAH.includes(k.status)) {
        k.sebelumHilang = k.status;
        ke(k, "TIDAK_TERLIHAT", t, kx, p);
      } else if (k.status === "KALIBRASI") {
        tampilkanTeks(k, "wajah_tidak_terlihat", t);
      }
    }
    if (k.status === "JEDA_KUNYAH" && s.terlihat && (s.mulut > a.terbuka || k.kunyahAktif)) k.diamSejak = t;
  }

  // 2. Tombol.
  if (e.jenis === "tombol") {
    switch (e.tombol) {
      case "stop": selesai(k, "stop", t, kx, p); break;
      case "darurat": selesai(k, "stop_darurat", t, kx, p); break;
      case "suap":
        if (STATUS_LOOP.includes(k.status)) mulaiMenilai(k, t, kx, p);
        break;
      case "lewati_pemanasan":
        if (k.status === "PEMANASAN") ke(k, "GILIRAN_KARAKTER", t, kx, p);
        break;
      case "lanjut":
        if (k.status === "JEDA_KUNYAH" || k.status === "MENOLAK") ke(k, "GILIRAN_KARAKTER", t, kx, p);
        break;
      case "ya":
        if (k.status === "TIDAK_PASTI") {
          catat(k, "diterima", t, true);
          ke(k, "DITERIMA", t, kx, p);
        } else if (k.status === "KEMUNGKINAN_NGEMUT") {
          const akhir = k.gigitan.at(-1);
          if (akhir) k.gigitan[k.gigitan.length - 1] = { ...akhir, hasil: "ngemut", dikoreksi: true };
          ke(k, "GILIRAN_KARAKTER", t, kx, p);
          if (kx.aturan.ngemut_hint) tampilkanTeks(k, "saran_ngemut", t);
        }
        break;
      case "tidak":
        if (k.status === "TIDAK_PASTI") {
          catat(k, "ditolak", t, true);
          ke(k, "GILIRAN_KARAKTER", t, kx, p);
        } else if (k.status === "KEMUNGKINAN_NGEMUT") {
          ke(k, "GILIRAN_KARAKTER", t, kx, p);
        }
        break;
      case "koreksi_diterima":
      case "koreksi_ditolak": {
        const akhir = k.gigitan.at(-1);
        const hasil = e.tombol === "koreksi_diterima" ? "diterima" : "ditolak";
        if (akhir) {
          k.gigitan[k.gigitan.length - 1] = { ...akhir, hasil, dikoreksi: true };
          if (hasil === "diterima") k.terakhirDiterima = t;
        }
        break;
      }
    }
  }

  if (e.jenis === "pemanasan_selesai" && k.status === "PEMANASAN") ke(k, "GILIRAN_KARAKTER", t, kx, p);

  // 3. Aturan global.
  if (k.status !== "SELESAI") {
    if (t - k.mulai >= kx.aturan.max_minutes * 60_000) selesai(k, "waktu_habis", t, kx, p);
    else if (k.awalLoop !== null && t - (k.terakhirDiterima ?? k.awalLoop) >= kx.aturan.end_after_refusal_minutes * 60_000) {
      selesai(k, "terlalu_lama_menolak", t, kx, p);
    }
  }

  // 4. Timer dan penilaian per status.
  const lamaStatus = t - k.masukStatus;
  switch (k.status) {
    case "KALIBRASI":
      if (lamaStatus >= KALIBRASI_MS) {
        k.kalibrasiAktif = false;
        p.push({ jenis: "kalibrasi", aktif: false });
        if (k.teks?.id === "wajah_tidak_terlihat") k.teks = null;
        ke(k, "PEMANASAN", t, kx, p);
      }
      break;
    case "GILIRAN_KARAKTER":
      if (kx.saklar.karakterMenggigit && k.pose === "menggigit" && lamaStatus >= GIGIT_MS) {
        k.pose = "enak";
        putarKlip(k, "karakter_enak", t);
      }
      if (lamaStatus >= GILIRAN_MS) ke(k, "MENUNGGU_SUAP", t, kx, p);
      break;
    case "MENUNGGU_SUAP":
      if (lamaStatus >= TAWARKAN_MS) tampilkanTeks(k, "tawarkan_suapan_kecil", t);
      break;
    case "MENILAI": {
      const diterimaPada = cariDiterima(k, a);
      if (diterimaPada !== null) {
        catat(k, "diterima", diterimaPada, false);
        ke(k, "DITERIMA", t, kx, p);
        break;
      }
      // Menoleh menjauhi pengasuh selama yawMenolakDetik setelah Suap.
      const sAkhir = e.jenis === "sinyal" ? e.s : null;
      if (sAkhir && sAkhir.terlihat) {
        if (sAkhir.yaw < -a.yawMenolakDerajat) k.yawMenolakSejak ??= t;
        else k.yawMenolakSejak = null;
      }
      if (k.yawMenolakSejak !== null && t - k.yawMenolakSejak >= a.yawMenolakDetik * 1000) {
        catat(k, "ditolak", t, false);
        ke(k, "MENOLAK", t, kx, p);
        break;
      }
      if (t >= k.akhirJendela!) {
        const batasMaks = k.tSuap! + a.jendelaMaksDetik * 1000;
        if (mulutSedangTerbuka(k, a) && t < batasMaks) break; // diperpanjang sampai mulut tertutup
        const kePengasuh = k.buffer.some((s) => s.t >= k.tSuap! && s.terlihat && s.yaw > a.yawKePengasuhDerajat);
        if (!pernahTerbuka(k, a) && k.siklusSejakSuap === 0 && !kePengasuh) {
          catat(k, "ditolak", t, false);
          ke(k, "MENOLAK", t, kx, p);
        } else {
          ke(k, "TIDAK_PASTI", t, kx, p);
        }
      }
      break;
    }
    case "DITERIMA":
      if (lamaStatus >= MERAYAKAN_MS) ke(k, "JEDA_KUNYAH", t, kx, p);
      break;
    case "JEDA_KUNYAH":
      if (!a.kunyahDariKamera) {
        if (lamaStatus >= a.timerJedaDetik * 1000) ke(k, "GILIRAN_KARAKTER", t, kx, p);
      } else if (k.diamSejak !== null && !k.kunyah.pernahAktif && t - k.diamSejak >= a.ngemutDetik * 1000) {
        ke(k, "KEMUNGKINAN_NGEMUT", t, kx, p);
      }
      break;
    case "KEMUNGKINAN_NGEMUT":
      if (lamaStatus >= a.tidakPastiTungguDetik * 1000) ke(k, "GILIRAN_KARAKTER", t, kx, p);
      break;
    case "MENOLAK":
      if (lamaStatus >= a.menolakTungguDetik * 1000) ke(k, "GILIRAN_KARAKTER", t, kx, p);
      break;
    case "TIDAK_PASTI":
      if (lamaStatus >= a.tidakPastiTungguDetik * 1000) ke(k, "GILIRAN_KARAKTER", t, kx, p); // tidak dicatat
      break;
    default:
      break;
  }

  // 5. Teks biasa hilang sendiri setelah 8 detik.
  if (k.teks && !k.teks.tanya && t - k.teksSejak >= TEKS_HILANG_MS) k.teks = null;

  return { keadaan: k, perintah: p };
}

// ---------- keluaran untuk layar dan server ----------

/** Bukaan mulut karakter: meniru mulut anak, mengikuti rahang saat jeda, atau dari pose. */
export function mulutKarakter(k: Keadaan): number {
  const akhir = k.buffer.at(-1);
  if ((k.status === "MENUNGGU_SUAP" || k.status === "MENILAI" || k.status === "DITERIMA") && akhir?.terlihat) {
    return k.pose === "merayakan" ? 0 : Math.min(1, Math.max(0, akhir.mulut));
  }
  if (k.status === "JEDA_KUNYAH" && akhir?.terlihat) {
    const r = k.buffer.filter((s) => s.terlihat).map((s) => s.rahang);
    const min = Math.min(...r), maks = Math.max(...r);
    return maks - min > 1e-6 ? (akhir.rahang - min) / (maks - min) : 0;
  }
  return k.pose === "menggigit" ? 0.8 : 0;
}

export function tampilan(k: Keadaan, kx: Konteks): TampilanSesi {
  const layar: ModeLayar =
    kx.saklar.layar === "hitam" ? "hitam"
      : k.status === "JEDA_KUNYAH" || k.status === "KEMUNGKINAN_NGEMUT" ? "redup"
        : "terang";
  return {
    status: k.status,
    pose: k.pose,
    mulutKarakter: mulutKarakter(k),
    layar,
    makananTahap: k.makananTahap,
    teks: k.teks,
    klip: k.klip,
    gigitan: k.gigitan,
    detikBerjalan: detikSesi(k, k.sekarang),
    tahap: Math.min(4, Math.max(1, Math.round(kx.aturan.stage))),
  };
}

/** Hasil untuk `POST /api/sessions`. `mulaiIso`/`selesaiIso` dari jam dinding, diberikan pemanggil. */
export function hasilSesi(
  k: Keadaan, kx: Konteks,
  info: { child_id: string; menu: string; makanan_baru: boolean; mulaiIso: string; selesaiIso: string },
): SesiSelesai | null {
  if (k.status !== "SELESAI" || !k.alasanSelesai || k.selesaiPada === null) return null;
  return {
    child_id: info.child_id,
    menu: info.menu,
    makanan_baru: info.makanan_baru,
    mulai: info.mulaiIso,
    selesai: info.selesaiIso,
    durasi_detik: Math.max(0, Math.round((k.selesaiPada - k.mulai) / 1000)),
    tahap: Math.min(4, Math.max(1, Math.round(kx.aturan.stage))),
    alasan_selesai: k.alasanSelesai,
    gigitan: k.gigitan,
  };
}
