// Pemilik: B (Satya). Pembungkus "muncul saat di-scroll" (translateY 16 px + pudar, 400 ms). Sekali saja, tanpa scroll-jacking.
import { useEffect, useRef, useState, type ReactNode } from "react";

export function Muncul({ children, className = "", tunda = 0 }: { children: ReactNode; className?: string; tunda?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [terlihat, setTerlihat] = useState(typeof IntersectionObserver === "undefined");
  useEffect(() => {
    const el = ref.current;
    if (!el || terlihat) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTerlihat(true); io.disconnect(); } }, { rootMargin: "0px 0px -10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [terlihat]);
  return (
    <div ref={ref} className={`muncul ${terlihat ? "terlihat" : ""} ${className}`} style={tunda ? { transitionDelay: `${tunda}ms` } : undefined}>
      {children}
    </div>
  );
}
