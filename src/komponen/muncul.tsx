// Pemilik: B (Satya). Animasi muncul saat di-scroll. Sekali saja, tanpa scroll-jacking; hanya transform + opacity.
// Varian: bawah (naik), kiri / kanan (geser masuk dari samping), skala (membesar pelan). Mati di prefers-reduced-motion.
import { useEffect, useRef, useState, type ReactNode } from "react";

export type ArahMuncul = "bawah" | "kiri" | "kanan" | "skala";

function useTerlihat<T extends Element>() {
  const ref = useRef<T>(null);
  const [terlihat, setTerlihat] = useState(typeof IntersectionObserver === "undefined");
  useEffect(() => {
    const el = ref.current;
    if (!el || terlihat) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTerlihat(true); io.disconnect(); } }, { rootMargin: "0px 0px -12% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [terlihat]);
  return { ref, terlihat };
}

export function Muncul({ children, className = "", tunda = 0, dari = "bawah" }: {
  children: ReactNode; className?: string; tunda?: number; dari?: ArahMuncul;
}) {
  const { ref, terlihat } = useTerlihat<HTMLDivElement>();
  return (
    <div ref={ref} className={`muncul muncul-${dari} ${terlihat ? "terlihat" : ""} ${className}`}
      style={tunda ? { transitionDelay: `${tunda}ms` } : undefined}>
      {children}
    </div>
  );
}

/** Angka yang menghitung naik saat terlihat (mis. 15 → 60). Di reduced-motion langsung angka akhir. */
export function AngkaNaik({ dari, ke, ms = 1100 }: { dari: number; ke: number; ms?: number }) {
  const { ref, terlihat } = useTerlihat<HTMLSpanElement>();
  const [n, setN] = useState(dari);
  useEffect(() => {
    if (!terlihat) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(ke); return; }
    let raf = 0; const awal = performance.now();
    const langkah = (t: number) => {
      const p = Math.min(1, (t - awal) / ms);
      setN(Math.round(dari + (ke - dari) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(langkah);
    };
    raf = requestAnimationFrame(langkah);
    return () => cancelAnimationFrame(raf);
  }, [terlihat, dari, ke, ms]);
  return <span ref={ref} className="tabular-nums">{n}</span>;
}
