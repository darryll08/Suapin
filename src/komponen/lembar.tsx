// Pemilik: B (Satya). Lembar bawah modal (UI UX 12.2: masuk 400 ms). Esc / ketuk latar = tutup.
import { useEffect, type ReactNode } from "react";
import { Tombol } from "./dasar.tsx";

export function LembarBawah({ judul, tutup, children }: { judul: string; tutup?: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!tutup) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") tutup(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [tutup]);
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ungu/30" onClick={tutup}>
      <div role="dialog" aria-modal="true" aria-label={judul} onClick={(e) => e.stopPropagation()}
        className="lembar-masuk flex w-full max-w-[560px] flex-col gap-4 rounded-t-kartu bg-permukaan p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-ungu shadow-lembar">
        <h2 className="font-judul text-subjudul font-bold">{judul}</h2>
        {children}
        {tutup && <Tombol varian="teks" onClick={tutup} className="self-center">Tutup</Tombol>}
      </div>
    </div>
  );
}
