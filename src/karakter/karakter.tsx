// Pemilik: B (Satya). Komponen karakter (B1.3). Keputusan aset 11 Nov: SVG flat (rencana B di UI UX 11.2),
// karena lapisan gambar tidak siap sebelum gerbang. Komponen ini tidak tahu apa pun soal kamera:
// `mulut` (0..1) dari engine langsung dipakai di atribut `d`.
import { useEffect, useState, type CSSProperties } from "react";
import type { ModeLayar, Pose } from "../../bersama/kontrak/sesi.ts";
import { cariMakanan, type TahapMakanan } from "../../bersama/konten/makanan.ts";
import { IsiMulut } from "./mulut.tsx";
import { GambarTokoh, type IdTokoh } from "./tokoh.tsx";
import "./karakter.css";

export type PropsKarakter = {
  pose: Pose;
  mulut: number;
  makanan: { id: string; tahap: TahapMakanan } | null;
  layar: ModeLayar;
  /** Lingkaran jagung muda di belakang karakter. */
  latar?: boolean;
  /** Karakter memegang makanan di depan badan tanpa menggigit (pemanasan). */
  pegang?: boolean;
  /** Teman makan pilihan keluarga; tanpa ini tampil karakter bawaan. */
  tokoh?: IdTokoh;
  className?: string;
};

const KULIT = "#F6D7B8";
const KULIT_BAYANG = "#EBC29F";
const PIPI = "#F0C4A4";
const BAJU = "#6E5A78";
const RAMBUT = "#4B2E5A";
const MATA = "#2E1B38";

/** Kotak mulut (koordinat kanvas 400×400). */
const KOTAK_MULUT = { x: 160, y: 222, skala: 0.8 };

const GIGIT_MS = 2500;

/** Urutan menggigit (UI UX 11.5) sebagai fungsi waktu. */
function urutanGigit(ms: number) {
  const tangan = ms < 600 ? 120 * (1 - ms / 600) : ms > 2100 ? 120 * Math.min(1, (ms - 2100) / 400) : 0;
  let mulut = 0;
  if (ms >= 600 && ms < 900) mulut = 0.8 * ((ms - 600) / 300);
  else if (ms >= 900 && ms < 1100) mulut = 0.8 * (1 - (ms - 900) / 200);
  else if (ms >= 1100 && ms < 2100) mulut = 0.2 * Math.abs(Math.sin(((ms - 1100) / 330) * Math.PI));
  return { tangan, mulut, sudahGigit: ms >= 900, selesai: ms >= GIGIT_MS };
}

function useKedip(pose: Pose) {
  const [tutup, setTutup] = useState(false);
  useEffect(() => {
    let t = 0;
    const jadwal = () => {
      const [min, maks] = pose === "santai" ? [5000, 7000] : [3000, 6000];
      t = window.setTimeout(() => {
        setTutup(true);
        t = window.setTimeout(() => { setTutup(false); jadwal(); }, 120);
      }, min + Math.random() * (maks - min));
    };
    jadwal();
    return () => window.clearTimeout(t);
  }, [pose]);
  return tutup;
}

/** Waktu sejak pose `menggigit` dimulai; hanya berjalan 2,5 detik, jadi tidak ada render 20×/detik di luar urutan ini. */
function useWaktuGigit(pose: Pose) {
  const [ms, setMs] = useState(GIGIT_MS);
  useEffect(() => {
    if (pose !== "menggigit") return;
    const awal = performance.now();
    let raf = 0;
    const langkah = () => {
      const d = performance.now() - awal;
      setMs(Math.min(GIGIT_MS, d));
      if (d < GIGIT_MS) raf = requestAnimationFrame(langkah);
    };
    raf = requestAnimationFrame(langkah);
    return () => { cancelAnimationFrame(raf); setMs(GIGIT_MS); };
  }, [pose]);
  return ms;
}

function Mata({ pose, kedip }: { pose: Pose; kedip: boolean }) {
  const senyumMata = pose === "enak" || pose === "merayakan";
  const kiri = 158, kanan = 242, y = 186;
  if (senyumMata || kedip) {
    const d = (cx: number) => senyumMata
      ? `M${cx - 16},${y + 4} Q${cx},${y - 14} ${cx + 16},${y + 4}`
      : `M${cx - 15},${y} Q${cx},${y + 8} ${cx + 15},${y}`;
    return (
      <g fill="none" stroke={MATA} strokeWidth="6" strokeLinecap="round">
        <path d={d(kiri)} /><path d={d(kanan)} />
      </g>
    );
  }
  const ry = pose === "mengunyah" ? 9 : pose === "menunggu" ? 20 : 17;
  const rx = pose === "menunggu" ? 15 : 13;
  return (
    <g>
      {[kiri, kanan].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={y} rx={rx} ry={ry} fill={MATA} />
          {ry > 10 && <circle cx={cx + 5} cy={y - 6} r="4.5" fill="#FFFDF8" />}
        </g>
      ))}
    </g>
  );
}

function Alis({ pose }: { pose: Pose }) {
  const naik = pose === "menunggu" ? -8 : pose === "merayakan" ? -10 : pose === "enak" ? 4 : 0;
  const lengkung = pose === "santai" ? 0 : pose === "enak" ? 3 : 6;
  const y = 150 + naik;
  return (
    <g fill="none" stroke={RAMBUT} strokeWidth="6" strokeLinecap="round">
      <path d={`M140,${y} Q158,${y - lengkung} 176,${y}`} />
      <path d={`M224,${y} Q242,${y - lengkung} 260,${y}`} />
    </g>
  );
}

const PERCIK = [
  { x: 92, y: 110, dx: -40, dy: -30, r: 10, w: "#E0A526" },
  { x: 120, y: 70, dx: -24, dy: -50, r: 8, w: "#FBEFD2" },
  { x: 200, y: 52, dx: 0, dy: -56, r: 12, w: "#E0A526" },
  { x: 280, y: 70, dx: 24, dy: -50, r: 8, w: "#FBEFD2" },
  { x: 308, y: 110, dx: 40, dy: -30, r: 10, w: "#E0A526" },
  { x: 330, y: 170, dx: 56, dy: -8, r: 9, w: "#E0A526" },
];

export function Karakter({ pose, mulut, makanan, layar, latar = true, pegang = false, tokoh, className = "" }: PropsKarakter) {
  const kedip = useKedip(pose);
  const msGigit = useWaktuGigit(pose);
  const gigit = pose === "menggigit" ? urutanGigit(msGigit) : null;

  if (layar === "hitam") return null;

  const bukaMulut = gigit ? gigit.mulut : mulut;
  const tahapTampil: TahapMakanan = makanan
    ? gigit && !gigit.sudahGigit && makanan.tahap > 0 ? ((makanan.tahap - 1) as TahapMakanan) : makanan.tahap
    : 0;
  const gambarMakanan = makanan ? cariMakanan(makanan.id).gambar[tahapTampil] : null;

  const kelasBadan =
    pose === "merayakan" ? "karakter-lompat"
      : pose === "santai" || pose === "menggigit" ? ""
        : pose === "enak" ? "karakter-goyang-besar"
          : "karakter-goyang";

  return (
    <svg viewBox="0 0 400 400" className={`block size-full select-none ${className}`} role="img"
      aria-label="Teman makan" data-pose={pose}>
      {latar && <circle cx="200" cy="215" r="172" fill="#FBEFD2" />}
      <g key={pose === "merayakan" ? "rayakan" : "biasa"} className={`karakter-badan ${kelasBadan}`}>
        {tokoh ? (
          <g transform="translate(20,10) scale(1.5)">
            <g className={pose === "menunggu" ? "karakter-condong" : ""} style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
              <GambarTokoh id={tokoh} mulut={pose === "merayakan" ? 0.5 : bukaMulut} />
            </g>
          </g>
        ) : (
        <g className={pose === "menunggu" ? "karakter-condong" : ""} style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
          {/* badan */}
          <ellipse cx="200" cy="350" rx="112" ry="60" fill={BAJU} />
          <ellipse cx="200" cy="362" rx="70" ry="30" fill="#7F6A8A" />
          {/* kepala */}
          <circle cx="200" cy="192" r="120" fill={KULIT} />
          <path d="M84,214 Q200,340 316,214 Q300,300 200,312 Q100,300 84,214 Z" fill={KULIT_BAYANG} opacity="0.55" />
          <path d="M96,150 Q120,70 200,66 Q282,70 304,150 Q270,108 228,112 Q214,96 200,112 Q150,100 96,150 Z" fill={RAMBUT} />
          <path d="M196,70 Q186,40 210,30" fill="none" stroke={RAMBUT} strokeWidth="9" strokeLinecap="round" />
          <ellipse cx="130" cy="232" rx="22" ry="13" fill={PIPI} />
          <ellipse cx="270" cy="232" rx="22" ry="13" fill={PIPI} />
          <Alis pose={pose} />
          <Mata pose={pose} kedip={kedip && pose !== "enak" && pose !== "merayakan"} />
          <g transform={`translate(${KOTAK_MULUT.x},${KOTAK_MULUT.y}) scale(${KOTAK_MULUT.skala})`}>
            <IsiMulut buka={bukaMulut} senyum={pose === "merayakan"} />
          </g>
        </g>
        )}
      </g>

      {(gigit || pegang) && gambarMakanan && (
        <g transform={`translate(0,${gigit ? gigit.tangan : 30})`} style={{ transition: gigit ? undefined : "transform 600ms var(--ease-standar)" }}>
          <image href={gambarMakanan} x="148" y="252" width="104" height="104" />
          {/* Tangan hanya saat menggigit (masuk dari bawah). Saat memegang (pemanasan) makanan mengambang di depan badan
              supaya tidak tampak setengah tangan terpotong di tepi bawah gambar. */}
          {gigit && <ellipse cx="200" cy="356" rx="34" ry="24" fill={KULIT} stroke={KULIT_BAYANG} strokeWidth="4" />}
        </g>
      )}

      {pose === "merayakan" && (
        <g key="percik">
          {PERCIK.map((p, i) => (
            <circle key={i} className="karakter-percik" cx={p.x} cy={p.y} r={p.r} fill={p.w}
              style={{ "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, transformBox: "fill-box" } as CSSProperties} />
          ))}
        </g>
      )}

      <rect className="karakter-redup" x="0" y="0" width="400" height="400" fill="#000" opacity={layar === "redup" ? 0.6 : 0} pointerEvents="none" />
    </svg>
  );
}
