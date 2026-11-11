// Pemilik: B (Satya). Demo hero landing: anak (ilustrasi AI + mulut SVG) dan karakter Suapin bergerak dari rekaman sinyal
// yang sama (bersama/kontrak/contoh/rekaman-sinyal.json, rekaman buatan), jadi pengunjung melihat karakter meniru mulut.
// Tidak memakai kamera atau MediaPipe. Animasi hanya berjalan saat terlihat di layar.
import { useEffect, useRef, useState } from "react";
import type { Pose } from "../../bersama/kontrak/sesi.ts";
import { Teman } from "./teman.tsx";
import { Anak } from "./anak.tsx";

type Sampel = { t: number; mulut: number };
const REKAMAN = import.meta.glob<{ sinyal: Sampel[] }>("../../bersama/kontrak/contoh/rekaman-sinyal.json", { import: "default" });

/** Potongan rekaman dengan dua suapan (detik 1–15), diputar berulang. */
const AWAL_MS = 1000, AKHIR_MS = 15000;
const RAYAKAN_MS = 1600;

export function DemoMeniru({ className = "" }: { className?: string }) {
  const wadah = useRef<HTMLDivElement>(null);
  const [sampel, setSampel] = useState<Sampel[] | null>(null);
  const [mulut, setMulut] = useState(0);
  const [pose, setPose] = useState<Pose>("menunggu");

  useEffect(() => {
    const muat = Object.values(REKAMAN)[0];
    void muat?.().then((r) => setSampel(r.sinyal.filter((s) => s.t >= AWAL_MS && s.t <= AKHIR_MS)));
  }, []);

  useEffect(() => {
    const el = wadah.current;
    if (!sampel?.length || !el) return;
    let raf = 0, awal = 0, jalan = false, terbuka = false, rayakanSampai = 0, terakhir = -1;
    const langkah = (kini: number) => {
      if (!awal) awal = kini;
      const t = AWAL_MS + ((kini - awal) % (AKHIR_MS - AWAL_MS));
      const i = Math.min(sampel.length - 1, Math.max(0, Math.round((t - AWAL_MS) / 50)));
      if (i !== terakhir) {
        terakhir = i;
        const m = sampel[i].mulut;
        if (m > 0.35) terbuka = true;
        if (terbuka && m < 0.08) { terbuka = false; rayakanSampai = kini + RAYAKAN_MS; }
        setMulut(m);
        setPose(kini < rayakanSampai ? "merayakan" : "menunggu");
      }
      if (jalan) raf = requestAnimationFrame(langkah);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !jalan) { jalan = true; raf = requestAnimationFrame(langkah); }
      else if (!e.isIntersecting && jalan) { jalan = false; cancelAnimationFrame(raf); }
    });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [sampel]);

  return (
    <div ref={wadah} className={`relative aspect-square ${className}`}>
      {/* cincin orbit */}
      <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" aria-hidden="true">
        <circle cx="200" cy="200" r="196" fill="none" stroke="var(--color-garis)" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="160" fill="none" stroke="var(--color-garis)" strokeWidth="1.5" strokeDasharray="4 8" />
      </svg>
      <div className="absolute inset-[12%] overflow-hidden rounded-full bg-jagung-muda">
        <Teman mulut={mulut} merayakan={pose === "merayakan"} className="translate-y-[5%]" />
      </div>

      {/* wajah anak (ilustrasi) di orbit, mulutnya digerakkan sinyal yang sama */}
      <figure className="absolute bottom-[2%] left-[0%] flex w-[30%] flex-col items-center gap-1">
        <div className="aspect-square w-full overflow-hidden rounded-full border-4 border-permukaan bg-ungu-tint shadow-kartu">
          <Anak mulut={mulut} className="translate-y-[6%] scale-[1.12]" />
        </div>
        <figcaption className="rounded-full bg-permukaan px-3 py-1 text-[13px] font-semibold shadow-kartu">Anak</figcaption>
      </figure>

      <Label className="top-[6%] right-[0%]">Meniru mulut anak</Label>
      <Label className="top-[40%] -left-[2%]">Giliran makan</Label>
      <Label className="right-[2%] bottom-[16%]">Dirayakan saat diterima</Label>
      <p className="sr-only">Animasi: mulut karakter mengikuti buka-tutup mulut anak dari rekaman contoh, lalu karakter merayakan saat suapan diterima.</p>
    </div>
  );
}

function Label({ children, className }: { children: string; className: string }) {
  return (
    <span className={`absolute rounded-full bg-permukaan px-3 py-2 text-[13px] font-semibold whitespace-nowrap text-ungu shadow-kartu sm:px-4 sm:text-kecil ${className}`}
      aria-hidden="true">
      {children}
    </span>
  );
}
