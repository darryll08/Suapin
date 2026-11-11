// Pemilik: B (Satya). Mulut SVG parametrik (B1.3, UI UX 11.4). Tanpa merah: bibir cokelat bata, rongga ubi gelap.
// `buka` diterima sebagai prop dan langsung dipakai di atribut `d`; tidak ada state per frame di sini.

const BIBIR = "#9C6B5E";
const RONGGA = "#2E1B38";
const LIDAH = "#C98B7A";

export function pathRongga(buka: number): string {
  const b = Math.min(1, Math.max(0, buka));
  const h = 4 + b * 30;
  return `M20,20 Q50,${20 + h * 1.4} 80,20 Q50,${20 + h * 0.2} 20,20 Z`;
}

/** Isi mulut dalam koordinat 100×60, untuk ditempel di dalam SVG karakter. */
export function IsiMulut({ buka, senyum = false }: { buka: number; senyum?: boolean }) {
  if (senyum) {
    return (
      <g>
        <path d="M14,16 Q50,62 86,16 Q50,30 14,16 Z" fill={RONGGA} stroke={BIBIR} strokeWidth="4" strokeLinejoin="round" />
        <ellipse cx="50" cy="40" rx="14" ry="6" fill={LIDAH} />
      </g>
    );
  }
  const b = Math.min(1, Math.max(0, buka));
  return (
    <g>
      <path className="mulut-rongga" d={pathRongga(b)} fill={RONGGA} stroke={BIBIR} strokeWidth="4" strokeLinejoin="round" />
      {b > 0.4 && <ellipse cx="50" cy={20 + (4 + b * 30) * 0.95} rx={10 + b * 6} ry={3 + b * 3} fill={LIDAH} />}
      <path d="M18,20 Q34,14 50,19 Q66,14 82,20" fill="none" stroke={BIBIR} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

/** Mulut berdiri sendiri (katalog, uji). */
export function Mulut(p: { buka: number; senyum?: boolean }) {
  return (
    <svg viewBox="0 0 100 60" className="size-full overflow-visible" aria-hidden="true">
      <IsiMulut {...p} />
    </svg>
  );
}
