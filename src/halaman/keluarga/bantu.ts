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

/** "Mbak" + "Mbak Rina" → "Mbak Rina" (seed menyimpan sapaan di nama pengasuh). */
export function namaDenganSapaan(sapaan: string, nama: string): string {
  return nama.toLowerCase().startsWith(`${sapaan.toLowerCase()} `) ? nama : `${sapaan} ${nama}`;
}

export function tanggalLokal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type SesiHari = { tanggal: string; diterima: number; ditolak: number };

/** Jumlah per tanggal (YYYY-MM-DD). */
export function totalPerHari(sesi: SesiHari[], tanggal: string[]) {
  return tanggal.map((t) => {
    const s = sesi.filter((x) => x.tanggal.slice(0, 10) === t);
    return { tanggal: t, ada: s.length > 0, diterima: s.reduce((a, x) => a + x.diterima, 0), ditolak: s.reduce((a, x) => a + x.ditolak, 0) };
  });
}

/** Senin..Minggu minggu ini. */
export function tanggalMingguIni(kini = new Date()): string[] {
  const senin = new Date(kini);
  senin.setDate(kini.getDate() - ((kini.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(senin); d.setDate(senin.getDate() + i); return tanggalLokal(d); });
}

/** n hari terakhir sampai hari ini. */
export function tanggalTerakhir(n: number, kini = new Date()): string[] {
  return Array.from({ length: n }, (_, i) => { const d = new Date(kini); d.setDate(kini.getDate() - (n - 1 - i)); return tanggalLokal(d); });
}
