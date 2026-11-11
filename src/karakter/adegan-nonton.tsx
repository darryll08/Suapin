// Pemilik: B (Satya). Ilustrasi masalah di landing: anak menatap tablet kartun, sendok dari pengasuh menunggu di samping.
// Anak tidak menangis atau dipaksa: yang digambarkan situasinya (makan sambil nonton), bukan penderitaannya.
import { IsiWajahAnak } from "./demo-meniru.tsx";

export function AdeganNonton({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={`block w-full ${className}`} role="img"
      aria-label="Ilustrasi: anak menatap tablet kartun saat disuapi, sendok menunggu di samping mulutnya.">
      <rect width="400" height="300" rx="28" fill="#FBEFD2" />
      {/* meja */}
      <rect x="0" y="236" width="400" height="64" fill="#E7DCCB" />
      <rect x="0" y="236" width="400" height="6" fill="#C9B79C" />
      {/* tablet kartun */}
      <g className="tablet-kedip">
        <rect x="262" y="96" width="118" height="146" rx="14" fill="#4B2E5A" />
        <rect x="270" y="106" width="102" height="118" rx="8" fill="#EEE7F1" />
        <circle cx="300" cy="140" r="16" fill="#E0A526" />
        <circle cx="340" cy="168" r="20" fill="#6E5A78" />
        <rect x="282" y="192" width="78" height="10" rx="5" fill="#C9B79C" />
        <path d="M315 150 l14 9 l-14 9 z" fill="#FFFDF8" />
      </g>
      {/* anak */}
      <ellipse cx="160" cy="262" rx="74" ry="44" fill="#E0A526" />
      <g transform="translate(92,92) scale(1.15)">
        <IsiWajahAnak mulut={0} menoleh />
      </g>
      {/* garis pandang ke tablet */}
      <path d="M212 168 Q236 158 258 160" fill="none" stroke="#6E5A78" strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" />
      {/* tangan pengasuh + sendok, menunggu */}
      <g className="sendok-menunggu">
        <path d="M-10 226 Q20 218 44 212" fill="none" stroke="#6E5A78" strokeWidth="24" strokeLinecap="round" />
        <circle cx="50" cy="210" r="14" fill="#E9BE98" />
        <path d="M60 206 L90 200" stroke="#C9B79C" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="100" cy="199" rx="13" ry="8" fill="#FFFDF8" stroke="#C9B79C" strokeWidth="3" />
        <circle cx="100" cy="196" r="5" fill="#7FA442" />
      </g>
      {/* jam */}
      <g transform="translate(26,26)">
        <rect width="96" height="40" rx="20" fill="#FFFDF8" />
        <circle cx="22" cy="20" r="10" fill="none" stroke="#4B2E5A" strokeWidth="3" />
        <path d="M22 14 V20 L27 23" fill="none" stroke="#4B2E5A" strokeWidth="3" strokeLinecap="round" />
        <text x="40" y="26" fontSize="16" fontWeight="700" fill="#4B2E5A">1 jam</text>
      </g>
    </svg>
  );
}
