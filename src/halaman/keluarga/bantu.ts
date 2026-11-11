// Pemilik: B (Satya). Pembantu layar keluarga: muat data, format tanggal/usia, teks tahap dan skrining (DRAF).
import { useCallback, useEffect, useState } from "react";

export function useMuat<T>(muat: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [galat, setGalat] = useState("");
  const [memuat, setMemuat] = useState(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const jalankan = useCallback(muat, deps);
  const ulangi = useCallback(() => {
    setMemuat(true);
    setGalat("");
    jalankan().then(setData, (e: unknown) => setGalat(e instanceof Error ? e.message : String(e))).finally(() => setMemuat(false));
  }, [jalankan]);
  useEffect(() => { ulangi(); }, [ulangi]);
  return { data, galat, memuat, ulangi };
}

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/** "2026-11-09" → "Sen, 9 Nov" */
export function formatTanggal(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const t = new Date(y, m - 1, d);
  return `${HARI[t.getDay()]}, ${d} ${BULAN[m - 1]}`;
}

export const HARI_SEN_MIN = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

/** 50 → "4 th 2 bln" */
export function formatUsia(bulan: number): string {
  const th = Math.floor(bulan / 12), bl = bulan % 12;
  return th === 0 ? `${bl} bln` : bl === 0 ? `${th} th` : `${th} th ${bl} bln`;
}

export const NAMA_SAPAAN = { mbak: "Mbak", bu: "Bu", oma: "Oma", ayah: "Ayah" } as const;

export function kalimatTahap(tahap: number, panggilan: string, sapaan: string): string {
  switch (tahap) {
    case 1: return `Karakter ikut makan bergiliran dengan ${panggilan}.`;
    case 2: return `${sapaan} yang menggigit duluan. Karakter menyemangati.`;
    case 3: return "Layar gelap. Hanya suara yang menemani.";
    default: return `${sapaan} yang memimpin. Aplikasi hanya untuk mencatat.`;
  }
}

/** Skrining tanda bahaya: DRAF, wajib divalidasi dokter (Dokumen Produk bagian 8). */
export const PERTANYAAN_SKRINING = [
  "Berat badan turun atau tidak naik beberapa bulan?",
  "Sering tersedak atau batuk saat makan?",
  "Sesak atau bibir kebiruan saat makan?",
  "Muntah berulang atau diare lama?",
  "Tampak kesakitan saat makan atau menelan?",
  "Ada keterlambatan perkembangan lain?",
  "Punya penyakit kronis atau alergi makanan berat?",
];
