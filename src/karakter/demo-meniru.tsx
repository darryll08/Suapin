// Pemilik: B (Satya). Demo hero landing: wajah anak (ilustrasi) dan karakter Suapin bergerak dari rekaman sinyal
// yang sama (bersama/kontrak/contoh/rekaman-sinyal.json, rekaman buatan), jadi pengunjung melihat karakter meniru mulut.
// Tidak memakai kamera atau MediaPipe. Animasi hanya berjalan saat terlihat di layar.
import { useEffect, useRef, useState } from "react";
import type { Pose } from "../../bersama/kontrak/sesi.ts";
import { Karakter } from "./karakter.tsx";
import { IsiMulut } from "./mulut.tsx";

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
      <svg viewBox="0 0 400 400" className="orbit absolute inset-0 size-full" aria-hidden="true">
        <circle cx="200" cy="200" r="196" fill="none" stroke="var(--color-garis)" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="160" fill="none" stroke="var(--color-garis)" strokeWidth="1.5" strokeDasharray="4 8" />
        <circle cx="200" cy="4" r="7" fill="var(--color-jagung)" />
        <circle cx="361" cy="230" r="5" fill="var(--color-ungu)" />
        <circle cx="60" cy="300" r="6" fill="var(--color-ungu-muda)" />
      </svg>
      <div className="absolute inset-[13%] rounded-full bg-jagung-muda" />
      <div className="absolute inset-[11%]">
        <Karakter pose={pose} mulut={mulut} makanan={null} layar="terang" latar={false} />
      </div>

      {/* wajah anak (ilustrasi) di orbit, mulutnya digerakkan sinyal yang sama */}
      <figure className="absolute bottom-[2%] left-[0%] flex w-[30%] flex-col items-center gap-1">
        <div className="aspect-square w-full rounded-full border-4 border-permukaan bg-ungu-tint shadow-kartu">
          <WajahAnak mulut={mulut} />
        </div>
        <figcaption className="rounded-full bg-permukaan px-3 py-1 text-[13px] font-semibold shadow-kartu">Anak</figcaption>
      </figure>

      <Label className="top-[6%] right-[0%]" tunda="0s">Meniru mulut anak</Label>
      <Label className="top-[40%] -left-[2%]" tunda="-1s">Giliran makan</Label>
      <Label className="right-[2%] bottom-[16%]" tunda="-2s">Dirayakan saat diterima</Label>
      <p className="sr-only">Animasi: mulut karakter mengikuti buka-tutup mulut anak dari rekaman contoh, lalu karakter merayakan saat suapan diterima.</p>
    </div>
  );
}

function Label({ children, className, tunda }: { children: string; className: string; tunda: string }) {
  return (
    <span className={`melayang absolute rounded-full bg-permukaan px-3 py-2 text-[13px] font-semibold whitespace-nowrap text-ungu shadow-kartu sm:px-4 sm:text-kecil ${className}`}
      style={{ animationDelay: tunda }} aria-hidden="true">
      {children}
    </span>
  );
}

/** Wajah anak ilustrasi (bukan foto). Rambut dikuncir, berbeda dari karakter. Koordinat 120×120. */
export function IsiWajahAnak({ mulut = 0, menoleh = false }: { mulut?: number; menoleh?: boolean }) {
  const geser = menoleh ? 10 : 0;
  return (
    <g>
      <circle cx="26" cy="38" r="12" fill="#4B2E5A" />
      <circle cx="94" cy="38" r="12" fill="#4B2E5A" />
      <circle cx="60" cy="64" r="40" fill="#F2CDA8" />
      <path d="M22,56 Q30,22 60,22 Q90,22 98,56 Q82,40 60,42 Q38,40 22,56 Z" fill="#4B2E5A" />
      <ellipse cx="40" cy="78" rx="8" ry="5" fill="#EFB99A" />
      <ellipse cx="80" cy="78" rx="8" ry="5" fill="#EFB99A" />
      <ellipse cx={46 + geser} cy="64" rx="4.5" ry="5.5" fill="#2E1B38" />
      <ellipse cx={74 + geser} cy="64" rx="4.5" ry="5.5" fill="#2E1B38" />
      <g transform={`translate(${42 + geser / 2},76) scale(0.36)`}>
        <IsiMulut buka={mulut} />
      </g>
    </g>
  );
}

export function WajahAnak(p: { mulut?: number; menoleh?: boolean }) {
  return <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true"><IsiWajahAnak {...p} /></svg>;
}
