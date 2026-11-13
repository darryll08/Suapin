// Pemilik: B (Satya). Strip teks bawah layar sesi + lembar tanya Ya/Tidak (B0.3).
// Teks hanya untuk pengasuh; ukuran kecil supaya anak tidak fokus ke teks (UI UX P-sesi).
import { useEffect, useState } from "react";
import { Tombol } from "./dasar.tsx";

const LAMA_TAMPIL_MS = 8000;

/** Hilang sendiri setelah 8 detik. Ganti `kunci` untuk menampilkan ulang teks yang sama. */
export function StripTeks({ teks, kunci, gelap = false, className = "fixed inset-x-0 bottom-0 pb-4" }: {
  teks: string | null; kunci?: string | number; gelap?: boolean; className?: string;
}) {
  const id = `${teks ?? ""}|${kunci ?? ""}`;
  const [habis, setHabis] = useState<string | null>(null);
  const tampil = habis !== id;

  useEffect(() => {
    if (!teks) return;
    const t = window.setTimeout(() => setHabis(id), LAMA_TAMPIL_MS);
    return () => window.clearTimeout(t);
  }, [teks, id]);

  return (
    <div aria-live="polite" className={`pointer-events-none flex justify-center px-4 ${className}`}>
      {teks && tampil && (
        <p className={`max-w-[560px] rounded-tombol px-4 py-2 text-strip ${gelap ? "text-latar" : "bg-ungu/90 text-permukaan shadow-lembar"}`}>{teks}</p>
      )}
    </div>
  );
}

/** Lembar tanya: tetap tampil sampai pengasuh menjawab (mis. status TIDAK_PASTI). */
export function LembarTanya({ pertanyaan, jawab }: { pertanyaan: string; jawab: (ya: boolean) => void }) {
  return (
    <div
      role="dialog"
      aria-label={pertanyaan}
      className="fixed inset-x-0 bottom-0 mx-auto flex max-w-[560px] flex-col gap-4 rounded-t-kartu bg-permukaan p-5 pb-6 text-ungu shadow-lembar"
    >
      <p className="text-center font-judul text-subjudul font-bold">{pertanyaan}</p>
      <div className="grid grid-cols-2 gap-3">
        <Tombol varian="kedua" className="min-h-16 sm:w-full" onClick={() => jawab(false)}>Tidak</Tombol>
        <Tombol className="min-h-16 sm:w-full" onClick={() => jawab(true)}>Ya</Tombol>
      </div>
    </div>
  );
}
