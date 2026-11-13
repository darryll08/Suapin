// Pemilik: B (Satya). Adegan landing dari tokoh teman makan (Darryl) + aset makanan/stiker yang sama
// dengan layar sesi, menggantikan ilustrasi anak buatan AI. Statis: tanpa animasi terus-menerus.
import { GambarTokoh, type IdTokoh } from "./tokoh.tsx";
import "./karakter.css";

const GARIS = "#3A2346";

/** Sendok miring dengan makanan di atasnya. (x, y) = pusat cekungan sendok. */
function Sendok({ x, y, sudut, makanan = "brokoli" }: { x: number; y: number; sudut: number; makanan?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${sudut})`}>
      <path d="M26 0 L160 -5" stroke={GARIS} strokeWidth={17} strokeLinecap="round" />
      <path d="M26 0 L160 -5" stroke="#C9B79C" strokeWidth={9} strokeLinecap="round" />
      <ellipse cx={0} cy={0} rx={34} ry={18} fill="#C9B79C" stroke={GARIS} strokeWidth={5} />
      <image href={`/aset/makanan/${makanan}_0.svg`} x={-48} y={-84} width={96} height={96} />
    </g>
  );
}

function Tokoh({ id, x, y, skala = 1, putar = 0, cermin = false, mulut = 0, tutupMulut = false }: { id: IdTokoh; x: number; y: number; skala?: number; putar?: number; cermin?: boolean; mulut?: number; tutupMulut?: boolean }) {
  // Koordinat tokoh 240×260; putar dan cermin di sekitar pusat kepala (120, 120).
  return (
    <g transform={`translate(${x} ${y}) scale(${cermin ? -skala : skala} ${skala}) rotate(${putar} 120 120) translate(${cermin ? -240 : 0} 0)`}>
      <GambarTokoh id={id} mulut={mulut} kunci={`adegan-${id}`} />
      {tutupMulut && (
        // Dua lengan naik dari badan, tangan kecil bertemu di depan mulut (warna lengan baju + kulit tokoh).
        <g strokeLinecap="round" strokeLinejoin="round">
          <Lengan dari={[84, 238]} ke={[100, 168]} />
          <Lengan dari={[156, 238]} ke={[142, 170]} />
          <Telapak x={110} y={158} putar={-12} />
          <Telapak x={131} y={161} putar={12} cermin />
        </g>
      )}
    </g>
  );
}

/** Lengan baju dari badan ke pergelangan, melengkung keluar. */
function Lengan({ dari: [x1, y1], ke: [x2, y2] }: { dari: [number, number]; ke: [number, number] }) {
  const d = `M${x1} ${y1} Q${(x1 + x2) / 2 + (x1 < 120 ? -16 : 16)} ${(y1 + y2) / 2 + 6} ${x2} ${y2}`;
  return (
    <g fill="none">
      <path d={d} stroke={GARIS} strokeWidth={25} />
      <path d={d} stroke="#F2B54A" strokeWidth={15} />
    </g>
  );
}

/** Tangan kecil polos (bentuk sarung tangan) menghadap ke tengah, ibu jari menyembul di atas. (x, y) = pusat. */
function Telapak({ x, y, putar, cermin = false }: { x: number; y: number; putar: number; cermin?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${putar}) scale(${cermin ? -1 : 1} 1)`} stroke={GARIS} strokeWidth={4.5} fill="#F7D5BC">
      <path d="M-5 -10 C-6 -18 4 -19 5 -11" />
      <path d="M-15 0 C-15 -8 -9 -11 -1 -11 L8 -11 C15 -11 17 -5 15 -1 C17 3 15 10 8 10 L-3 11 C-11 11 -15 7 -15 0 Z" />
    </g>
  );
}

function Meja({ warna }: { warna: string }) {
  return <rect x={0} y={318} width={600} height={82} fill={warna} />;
}

/** Tanpa layar: tokoh menutup mulut dan menoleh dari sendok. */
export function AdeganTanpaLayar() {
  return (
    <svg viewBox="0 0 600 400" className="block h-auto w-full" aria-hidden="true">
      <rect width={600} height={400} fill="#FBEFD2" />
      <circle cx={232} cy={176} r={150} fill="#F6E2B4" />
      <Meja warna="#E9D9BE" />
      <Tokoh id="nara" x={100} y={46} skala={1.1} cermin tutupMulut />
      <Sendok x={440} y={200} sudut={-8} />
      <path d="M392 150 q-14 -16 -6 -34 M410 140 q-6 -18 6 -30" stroke={GARIS} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.5} />
    </svg>
  );
}

/** Dengan layar: tokoh menatap tablet, sendok menunggu di samping. */
export function AdeganDenganLayar() {
  return (
    <svg viewBox="0 0 600 400" className="block h-auto w-full" aria-hidden="true">
      <rect width={600} height={400} fill="#EEE7F1" />
      <circle cx={210} cy={190} r={150} fill="#E2D6E8" />
      <Meja warna="#DCCDE3" />
      <Tokoh id="pao" x={80} y={40} skala={1.1} />
      {/* Tablet di depan, condong ke arah tokoh. */}
      <g transform="translate(330 150) rotate(-6)">
        <rect width={200} height={146} rx={18} fill="#4B2E5A" stroke={GARIS} strokeWidth={5} />
        <rect x={13} y={13} width={174} height={120} rx={8} fill="#E0A526" />
        <path d="M86 50 L86 96 L124 73 Z" fill="#FFFDF8" />
        <rect x={13} y={13} width={174} height={120} rx={8} fill="#FFFDF8" opacity={0.15} />
      </g>
      {/* Sendok diam di piring, belum disentuh. */}
      <ellipse cx={500} cy={346} rx={86} ry={20} fill="#FFFDF8" stroke={GARIS} strokeWidth={5} />
      <Sendok x={478} y={330} sudut={2} />
    </svg>
  );
}

/** Makan jadi momen ditunggu: tokoh membuka mulut, ditemani stiker. */
export function AdeganSenang() {
  return (
    <svg viewBox="0 0 400 400" className="block size-full" aria-hidden="true">
      <rect width={400} height={400} fill="#FBEFD2" />
      <circle cx={200} cy={210} r={150} fill="#F6E2B4" />
      <Tokoh id="raka" x={66} y={92} skala={1.12} mulut={0.85} />
      <image href="/aset/stiker/jagung.svg" x={18} y={40} width={92} height={92} transform="rotate(-12 64 86)" />
      <image href="/aset/stiker/ubi.svg" x={296} y={30} width={86} height={86} transform="rotate(10 339 73)" />
      <image href="/aset/stiker/nasi.svg" x={300} y={250} width={78} height={78} />
      {[[70, 190], [340, 170], [110, 330]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={7} fill="#E0A526" />
      ))}
    </svg>
  );
}
