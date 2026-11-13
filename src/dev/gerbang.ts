// Pemilik: A (Darryl). A1.5: hitungan untuk log percobaan gerbang go/no-go. Fungsi murni, dites di uji/mesin.
import type { Sinyal } from "../../bersama/kontrak/sinyal.ts";
import type { Ambang } from "../mesin/ambang.ts";
import { kunyahAwal, langkahKunyah } from "../mesin/kunyah.ts";
import { next, sesiAwal, type Kejadian, type Konteks } from "../mesin/sesi.ts";
import { saklarTahap } from "../mesin/tahap.ts";

export const UJI_GERBANG = [
  "Mulut terbuka setelah Suap",
  "Sendok + makanan asli, disuapi dari samping",
  "Mulut sudah terbuka / aaa 3 detik lalu tutup",
  "Dua wajah di kamera",
  "Menoleh menjauh",
  "Menoleh ke arah pengasuh",
  "Kunyah bibir tertutup, makanan asli",
  "Angguk tanpa mengunyah",
  "Mulut terbuka lama (pura-pura menangis)",
] as const;

export type Percobaan = {
  no: number;
  uji: string;
  penguji: string;
  tSuap: number;
  /** Rentang mulut terbuka terpanjang di jendela (detik), 0 bila tidak pernah terbuka. */
  lamaBukaDetik: number;
  mulutMaks: number;
  yawMin: number;
  yawMaks: number;
  siklusKunyah: number;
  hilangDetik: number;
};

/** Ringkasan sinyal di jendela [tSuap - sebelum, tSuap + sesudah] (ms). */
export function nilaiPercobaan(
  sinyal: Sinyal[], tSuap: number, ambangTerbuka: number, sebelumMs = 3000, sesudahMs = 12000,
): Pick<Percobaan, "lamaBukaDetik" | "mulutMaks" | "yawMin" | "yawMaks" | "hilangDetik"> {
  const jendela = sinyal.filter((s) => s.t >= tSuap - sebelumMs && s.t <= tSuap + sesudahMs);
  let terpanjang = 0, mulaiBuka: number | null = null, hilang = 0, mulutMaks = 0, yawMin = 0, yawMaks = 0;
  jendela.forEach((s, i) => {
    const dt = i > 0 ? s.t - jendela[i - 1].t : 0;
    if (!s.terlihat) { hilang += dt; mulaiBuka = null; return; }
    mulutMaks = Math.max(mulutMaks, s.mulut);
    yawMin = Math.min(yawMin, s.yaw);
    yawMaks = Math.max(yawMaks, s.yaw);
    if (s.mulut > ambangTerbuka) {
      mulaiBuka ??= s.t;
      terpanjang = Math.max(terpanjang, s.t - mulaiBuka);
    } else mulaiBuka = null;
  });
  return { lamaBukaDetik: terpanjang / 1000, mulutMaks, yawMin, yawMaks, hilangDetik: hilang / 1000 };
}

/** Min, median, persentil 90, dan usulan `batasBukaDetik` = p90 + 1 dibulatkan ke atas ke 0,5. */
export function statistikLamaBuka(nilai: number[]) {
  const urut = nilai.filter((v) => v > 0).sort((a, b) => a - b);
  if (!urut.length) return null;
  const persentil = (p: number) => urut[Math.min(urut.length - 1, Math.ceil(p * urut.length) - 1)];
  const p90 = persentil(0.9);
  return { n: urut.length, min: urut[0], median: persentil(0.5), p90, usulanBatas: Math.ceil((p90 + 1) * 2) / 2 };
}

/** Simpan objek sebagai file JSON di perangkat (tanpa jaringan). */
export function unduhJson(namaFile: string, isi: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(isi)], { type: "application/json" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: namaFile });
  a.click();
  URL.revokeObjectURL(url);
}

// ---- Penilaian dengan engine (dipakai uji/mesin/akurasi.ts untuk gerbang A1.5 dan uji akurasi A3.2) ----

export type HasilSuap = "diterima" | "ditolak" | "tidak_pasti";
/** Label yang diharapkan per percobaan. `bukan_*` = lolos asal hasilnya bukan itu. */
export type Label = HasilSuap | "bukan_ditolak" | "bukan_diterima" | "kunyah" | "bukan_kunyah";

/** Harapan tiap uji gerbang (dokumen produk bagian 20). */
export const HARAPAN_UJI: Record<(typeof UJI_GERBANG)[number], { label: Label; lolos: number }> = {
  "Mulut terbuka setelah Suap": { label: "diterima", lolos: 9 },
  "Sendok + makanan asli, disuapi dari samping": { label: "diterima", lolos: 8 },
  "Mulut sudah terbuka / aaa 3 detik lalu tutup": { label: "diterima", lolos: 8 },
  "Dua wajah di kamera": { label: "diterima", lolos: 9 },
  "Menoleh menjauh": { label: "ditolak", lolos: 9 },
  "Menoleh ke arah pengasuh": { label: "bukan_ditolak", lolos: 9 },
  "Kunyah bibir tertutup, makanan asli": { label: "kunyah", lolos: 7 },
  "Angguk tanpa mengunyah": { label: "bukan_kunyah", lolos: 9 },
  "Mulut terbuka lama (pura-pura menangis)": { label: "bukan_diterima", lolos: 9 },
};

const simpangan = (v: number[]) => {
  if (v.length < 2) return 0;
  const r = v.reduce((a, b) => a + b, 0) / v.length;
  return Math.sqrt(v.reduce((a, b) => a + (b - r) ** 2, 0) / v.length);
};

/**
 * Putar ulang rekaman ke engine sesi untuk satu Suap. Engine baru per percobaan supaya percobaan sebelumnya
 * (kunyahan, penolakan) tidak ikut memengaruhi. Mengembalikan hasil engine dan apakah kunyah aktif terdeteksi
 * dalam 12 detik setelah Suap.
 */
/**
 * Getar rahang saat diam: persentil 10 simpangan baku jendela 1,5 detik di seluruh rekaman. Di aplikasi nilai ini
 * dari kalibrasi diam 3 detik; rekaman gerbang dimulai setelah kalibrasi, jadi diambil dari momen paling tenang.
 */
export function getarDiamRekaman(sinyal: Sinyal[]): number {
  const v = sinyal.filter((s) => s.terlihat).map((s) => s.rahang);
  const sd: number[] = [];
  for (let i = 0; i + 30 <= v.length; i += 15) sd.push(simpangan(v.slice(i, i + 30)));
  sd.sort((a, b) => a - b);
  return sd.length ? sd[Math.floor(sd.length * 0.1)] : 0;
}

export function nilaiSuap(sinyal: Sinyal[], tSuap: number, ambang: Ambang): { hasil: HasilSuap; kunyah: boolean } {
  const kx: Konteks = {
    aturan: { max_minutes: 30, end_after_refusal_minutes: 15, stage: 1, ngemut_hint: "" },
    saklar: saklarTahap(1), ambang, getarDiam: getarDiamRekaman(sinyal),
  };
  // Siapkan engine sampai MENUNGGU_SUAP dengan sinyal diam sebelum buffer Suap.
  let t = tSuap - 15_000;
  let k = sesiAwal(t).keadaan;
  const kirim = (e: Kejadian) => { k = next(k, e, kx).keadaan; };
  for (; t < tSuap - ambang.bufferSebelumSuapDetik * 1000; t += 50) {
    kirim({ jenis: "sinyal", s: { t, mulut: 0, rahang: 0, yaw: 0, nangis: false, terlihat: true } });
    if (k.status === "PEMANASAN") kirim({ jenis: "tombol", tombol: "lewati_pemanasan", t });
  }

  let hasil: HasilSuap | null = null;
  let kunyah = false;
  let kk = kunyahAwal();
  let ditekan = false;
  for (const s of sinyal) {
    if (s.t < tSuap - ambang.bufferSebelumSuapDetik * 1000) continue;
    if (s.t > tSuap + 12_000) break;
    if (!ditekan && s.t >= tSuap) { kirim({ jenis: "tombol", tombol: "suap", t: s.t }); ditekan = true; }
    if (hasil === null) {
      kirim({ jenis: "sinyal", s });
      kirim({ jenis: "detik", t: s.t });
      if (k.gigitan.length) hasil = k.gigitan[0].hasil === "ditolak" ? "ditolak" : "diterima";
      else if (k.status === "TIDAK_PASTI") hasil = "tidak_pasti";
    }
    if (s.t >= tSuap) {
      const h = langkahKunyah(kk, s, kx.getarDiam, ambang);
      kk = h.k;
      kunyah ||= h.aktif;
    }
  }
  return { hasil: hasil ?? "tidak_pasti", kunyah };
}

/** Apakah hasil sesuai label. */
export function cocok(label: Label, h: { hasil: HasilSuap; kunyah: boolean }): boolean {
  if (label === "kunyah") return h.kunyah;
  if (label === "bukan_kunyah") return !h.kunyah;
  if (label === "bukan_ditolak") return h.hasil !== "ditolak";
  if (label === "bukan_diterima") return h.hasil !== "diterima";
  return h.hasil === label;
}
