// Pemilik: A (Darryl). A1.5: hitungan untuk log percobaan gerbang go/no-go. Fungsi murni, dites di uji/mesin.
import type { Sinyal } from "../../bersama/kontrak/sinyal.ts";

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
