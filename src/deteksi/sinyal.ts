// Pemilik: A (Darryl). A1.3: mengubah keluaran FaceLandmarker menjadi `Sinyal` (bersama/kontrak/sinyal.ts).
// Fungsi murni tanpa DOM, jadi bisa dites dengan angka buatan.
import type { Sinyal } from "../../bersama/kontrak/sinyal.ts";
import type { Ambang } from "../mesin/ambang.ts";
import { buatBaseline } from "./baseline.ts";
import type { Titik } from "./pilih-wajah.ts";

type Kategori = { categoryName: string; score: number };

// Indeks landmark FaceLandmarker (478 titik): 152 dagu, 1 ujung hidung, 10 dahi.
const DAGU = 152, HIDUNG = 1, DAHI = 10;

/**
 * Tanda yaw mentah saat anak menoleh ke KANAN-nya sendiri (arah anak menghadap layar).
 * shortcut: nilai ini tebakan sampai diverifikasi di /dev/kamera saat gerbang; ubah ke -1 bila terbalik
 * dan catat di docs/gerbang.md.
 */
export const TANDA_YAW_KANAN_ANAK: 1 | -1 = 1;

export const skor = (kategori: Kategori[], nama: string) => kategori.find((c) => c.categoryName === nama)?.score ?? 0;

/** Jarak dagu-hidung dibagi tinggi wajah (dahi-dagu). x,y dikali ukuran video supaya rasio tidak terdistorsi. */
export function rahangMentah(lm: Titik[], lebar: number, tinggi: number): number {
  const jarak = (a: Titik, b: Titik) => Math.hypot((a.x - b.x) * lebar, (a.y - b.y) * tinggi);
  const wajah = jarak(lm[DAHI], lm[DAGU]);
  return wajah > 0 ? jarak(lm[DAGU], lm[HIDUNG]) / wajah : 0;
}

/** Derajat dari matriks transformasi wajah (16 angka, kolom-mayor). */
export const yawMentah = (m: number[]) => (Math.atan2(m[8], m[10]) * 180) / Math.PI;

export const nangisMentah = (k: Kategori[]) =>
  (skor(k, "eyeSquintLeft") + skor(k, "eyeSquintRight") + skor(k, "browDownLeft") + skor(k, "browDownRight")) / 4;

export const haluskan = (baru: number, lama: number | null) => (lama === null ? baru : 0.4 * baru + 0.6 * lama);

/** Satu wajah terpilih pada satu frame, sudah diambil dari hasil FaceLandmarker. */
export type WajahFrame = { landmark: Titik[]; kategori: Kategori[]; matriks: number[] | null };

export type PengolahSinyal = {
  olah(t: number, wajah: WajahFrame | null): Sinyal;
  /** Dari engine: baseline hanya diisi saat bukan MENILAI dan bukan kunyah aktif. */
  baselineBoleh(b: boolean): void;
  /** true selama karakter berkata "Lihat aku dulu": yaw dikumpulkan; false: median jadi baseline yaw. */
  kalibrasi(aktif: boolean): void;
  /** Simpangan baku rahang saat diam, untuk penghitung kunyahan. */
  getarDiam(): number;
};

export function buatPengolahSinyal(opsi: {
  sisiPengasuh: "kiri" | "kanan";
  ukuranVideo: () => { lebar: number; tinggi: number };
  ambang: () => Pick<Ambang, "nangis" | "terbuka">;
}): PengolahSinyal {
  const baseMulut = buatBaseline();
  const baseRahang = buatBaseline();
  let mulutHalus: number | null = null;
  let rahangHalus: number | null = null;
  let yawDasar = 0;
  let kumpulanYaw: number[] | null = null;
  // Positif selalu berarti menoleh KE pengasuh.
  const arah = (opsi.sisiPengasuh === "kanan" ? 1 : -1) * TANDA_YAW_KANAN_ANAK;

  return {
    baselineBoleh: (b) => { baseMulut.boleh(b); baseRahang.boleh(b); },
    getarDiam: () => baseRahang.getar(),
    kalibrasi: (aktif) => {
      if (aktif) { kumpulanYaw = []; return; }
      if (kumpulanYaw?.length) {
        const urut = [...kumpulanYaw].sort((a, b) => a - b);
        yawDasar = urut[Math.floor(urut.length / 2)];
      }
      kumpulanYaw = null;
    },
    olah: (t, wajah) => {
      if (!wajah) {
        mulutHalus = rahangHalus = null; // jangan campur nilai lama saat wajah muncul lagi
        return { t, mulut: 0, rahang: 0, yaw: 0, nangis: false, terlihat: false };
      }
      const { lebar, tinggi } = opsi.ukuranVideo();
      const mulutRaw = skor(wajah.kategori, "jawOpen");
      const rahangRaw = rahangMentah(wajah.landmark, lebar, tinggi);
      baseMulut.tambah(t, mulutRaw);
      baseRahang.tambah(t, rahangRaw);
      mulutHalus = haluskan(mulutRaw - baseMulut.nilai(mulutRaw), mulutHalus);
      rahangHalus = haluskan(rahangRaw - baseRahang.nilai(rahangRaw), rahangHalus);
      const mulut = Math.min(1, Math.max(0, mulutHalus));

      const yawRaw = wajah.matriks ? yawMentah(wajah.matriks) : yawDasar;
      kumpulanYaw?.push(yawRaw);
      const a = opsi.ambang();
      return {
        t,
        mulut,
        rahang: rahangHalus,
        yaw: (yawRaw - yawDasar) * arah,
        nangis: nangisMentah(wajah.kategori) > a.nangis && mulut > a.terbuka,
        terlihat: true,
      };
    },
  };
}
