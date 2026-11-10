// Pemilik: A (Darryl). A2.1: penghitung kunyahan dari sinyal rahang (dokumen produk II.6.4). Fungsi murni.
// Kunyahan TIDAK menentukan hasil suapan; hanya untuk animasi karakter, akhir jeda kunyah, dan dugaan ngemut.
import type { Sinyal } from "../../bersama/kontrak/sinyal.ts";
import type { Ambang } from "./ambang.ts";

export type KeadaanKunyah = {
  arah: "naik" | "turun";
  puncak: number;
  sebelum: number | null;
  siklus: number[]; // waktu (ms) siklus dalam 3 detik terakhir
  terakhir: number | null; // waktu siklus terakhir
  pernahAktif: boolean;
};

export const kunyahAwal = (): KeadaanKunyah => ({
  arah: "naik", puncak: -Infinity, sebelum: null, siklus: [], terakhir: null, pernahAktif: false,
});

const JENDELA_MS = 3000;
const JARAK_MIN_MS = 400; // 2,5 Hz
const JARAK_MAKS_MS = 1250; // 0,8 Hz
const SELESAI_MS = 4000;

/**
 * Satu langkah per frame. `getarDiam` = simpangan baku rahang saat diam (baseline).
 * aktif: ≥ 3 siklus dalam 3 detik dengan jarak antar siklus 0,4–1,25 detik, dan siklus terakhir ≤ 1,25 detik lalu.
 * selesai: pernah aktif lalu tidak ada siklus selama 4 detik.
 */
export function langkahKunyah(
  k: KeadaanKunyah,
  s: Sinyal,
  getarDiam: number,
  a: Pick<Ambang, "kunyahKaliGetar" | "kunyahMinimal">,
): { k: KeadaanKunyah; aktif: boolean; selesai: boolean } {
  let { arah, puncak, terakhir } = k;
  const siklus = k.siklus.filter((t) => t > s.t - JENDELA_MS);
  let sebelum: number | null = k.sebelum;

  if (!s.terlihat) {
    sebelum = null; // nilai saat wajah hilang tidak dipakai sebagai puncak atau lembah
  } else {
    const v = s.rahang;
    if (sebelum !== null) {
      if (arah === "naik" && v < sebelum) {
        puncak = sebelum;
        arah = "turun";
      } else if (arah === "turun" && v > sebelum) {
        if (puncak - sebelum >= Math.max(a.kunyahKaliGetar * getarDiam, a.kunyahMinimal)) {
          siklus.push(s.t);
          terakhir = s.t;
        }
        arah = "naik";
      }
    }
    sebelum = v;
  }

  // Siklus terakhir harus baru (≤ 1,25 s); tanpa ini kunyah dianggap aktif sampai 3 s setelah rahang berhenti.
  const aktif =
    siklus.length >= 3 &&
    terakhir !== null && s.t - terakhir <= JARAK_MAKS_MS &&
    siklus.every((t, i) => i === 0 || (t - siklus[i - 1] >= JARAK_MIN_MS && t - siklus[i - 1] <= JARAK_MAKS_MS));
  const pernahAktif = k.pernahAktif || aktif;
  const selesai = pernahAktif && terakhir !== null && s.t - terakhir >= SELESAI_MS;
  return { k: { arah, puncak, sebelum, siklus, terakhir, pernahAktif }, aktif, selesai };
}
