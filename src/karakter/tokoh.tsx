// Enam teman makan yang bisa dipilih keluarga. SVG flat, kanvas 240×260.
// Bentuk tiap tokoh berupa string SVG tetap (tanpa masukan pengguna); hanya mulut yang dihitung ulang dari `mulut` 0..1.
import "./karakter.css";

export type IdTokoh = "raka" | "nara" | "jeru" | "pao" | "dino" | "tung";

const GARIS = "#3A2346";

const mata = (x: number, y: number, s = 1) =>
  `<g class="tokoh-mata"><ellipse cx="${x}" cy="${y}" rx="${5.5 * s}" ry="${7.5 * s}" fill="${GARIS}"/><circle cx="${x + 1.8 * s}" cy="${y - 2.6 * s}" r="${1.8 * s}" fill="#fff"/></g>`;
const pipi = (x: number, y: number, warna = "#EE9A82") => `<ellipse cx="${x}" cy="${y}" rx="11" ry="6.5" fill="${warna}" opacity=".55"/>`;
const alis = (x: number, y: number, arah: number) => `<path class="tokoh-tipis" d="M${x - 8} ${y + arah} Q${x} ${y - 4} ${x + 8} ${y - arah}"/>`;

/** Mulut: 0 = senyum tertutup, 1 = terbuka lebar. `id` membuat clipPath unik per tokoh. */
function mulutSvg(id: string, cx: number, cy: number, w: number, m: number) {
  if (m < 0.08) return `<path class="tokoh-tipis" d="M${cx - w / 2} ${cy} Q${cx} ${cy + w * 0.42} ${cx + w / 2} ${cy}"/>`;
  const h = 6 + m * w * 1.05, lebar = w * (0.8 + m * 0.25), x0 = cx - lebar / 2, x1 = cx + lebar / 2;
  const d = `M${x0} ${cy} Q${cx} ${cy - 4} ${x1} ${cy} Q${x1 + 2} ${cy + h} ${cx} ${cy + h} Q${x0 - 2} ${cy + h} ${x0} ${cy} Z`;
  return `<clipPath id="mulut-${id}"><path d="${d}"/></clipPath><path d="${d}" fill="#5B2B3D"/>`
    + `<ellipse clip-path="url(#mulut-${id})" cx="${cx}" cy="${cy + h}" rx="${lebar * 0.36}" ry="${h * 0.5}" fill="#E8918A"/>`
    + `<path class="tokoh-g" d="${d}" fill="none" style="stroke-width:4"/>`;
}

type Tokoh<I extends string = IdTokoh> = { id: I; nama: string; ket: string; mulut: [cx: number, cy: number, lebar: number, maks: number]; badan: string };

export const TOKOH: Tokoh[] = [
  {
    id: "raka", nama: "Raka", ket: "cowok kecil", mulut: [120, 150, 26, 0.55],
    badan: `
      <path class="tokoh-g" d="M60 248 C60 204 80 184 120 184 C160 184 180 204 180 248 Z" fill="#6E4C86"/>
      <path class="tokoh-g" d="M88 186 C92 204 148 204 152 186" fill="#5A3B70" style="stroke-width:4"/>
      <path class="tokoh-tipis" d="M108 200 V222 M132 200 V222" style="stroke:#E0A526;stroke-width:4"/>
      <circle cx="108" cy="224" r="4" fill="#E0A526"/><circle cx="132" cy="224" r="4" fill="#E0A526"/>
      <ellipse class="tokoh-g" cx="54" cy="120" rx="12" ry="15" fill="#F7D5BC"/>
      <ellipse class="tokoh-g" cx="186" cy="120" rx="12" ry="15" fill="#F7D5BC"/>
      <path class="tokoh-g" d="M120 44 C168 44 186 78 184 120 C182 164 156 190 120 190 C84 190 57 164 56 120 C55 78 72 44 120 44 Z" fill="#F7D5BC"/>
      <path class="tokoh-g" d="M58 112 C50 82 58 54 82 42 C108 26 160 24 180 42 C194 56 192 86 182 108 C178 94 172 86 162 82 C152 86 142 84 134 78 C122 86 106 86 96 80 C86 84 78 88 72 94 C66 98 61 104 58 112 Z" fill="#5A3A2C"/>
      <path class="tokoh-tipis" d="M92 40 C90 52 90 64 93 76" style="stroke-width:3"/>
      <path class="tokoh-tipis" d="M101 52 C116 44 130 52 146 46 C158 42 168 48 174 56 M101 66 C116 58 130 66 146 60 C158 56 166 62 172 72 M84 50 C76 58 70 70 66 86" style="stroke:#8A6450;stroke-width:3.5"/>
      ${alis(96, 96, 2)}${alis(146, 96, -2)}${mata(96, 120)}${mata(146, 120)}${pipi(80, 142)}${pipi(160, 142)}`,
  },
  {
    id: "nara", nama: "Nara", ket: "cewek kecil", mulut: [120, 152, 24, 0.55],
    badan: `
      <path class="tokoh-g" d="M62 248 C62 204 82 186 120 186 C158 186 178 204 178 248 Z" fill="#F2B54A"/>
      <path class="tokoh-g" d="M96 188 L120 206 L144 188" fill="#FFF9EF" style="stroke-width:4"/>
      <circle cx="98" cy="228" r="4" fill="#FFF9EF"/><circle cx="142" cy="230" r="4" fill="#FFF9EF"/><circle cx="120" cy="238" r="4" fill="#FFF9EF"/>
      <circle class="tokoh-g" cx="58" cy="66" r="22" fill="#6B4433"/>
      <circle class="tokoh-g" cx="182" cy="66" r="22" fill="#6B4433"/>
      <path class="tokoh-g" d="M120 42 C170 42 190 80 188 124 C187 150 182 168 172 176 L68 176 C58 168 53 150 52 124 C50 80 70 42 120 42 Z" fill="#6B4433"/>
      <path class="tokoh-g" d="M120 58 C162 58 178 88 176 124 C174 162 152 184 120 184 C88 184 66 162 64 124 C62 88 78 58 120 58 Z" fill="#F7D5BC"/>
      <path class="tokoh-g" d="M64 112 C62 76 86 56 120 56 C154 56 178 76 176 112 C168 98 160 92 152 96 C146 86 136 84 128 92 C120 84 108 84 100 94 C92 88 82 92 76 102 C72 104 68 108 64 112 Z" fill="#6B4433"/>
      <path class="tokoh-g" d="M170 48 l6 -10 l4 11 l11 1 l-9 7 l3 11 l-9 -6 l-9 6 l3 -11 l-8 -7 Z" fill="#E0A526" style="stroke-width:3"/>
      ${alis(100, 102, 1)}${alis(142, 102, -1)}${mata(100, 124)}${mata(142, 124)}${pipi(86, 146)}${pipi(156, 146)}`,
  },
  {
    id: "jeru", nama: "Jeru", ket: "jeruk", mulut: [120, 162, 30, 1],
    badan: `
      <path class="tokoh-g" d="M100 222 V246 M140 222 V246" fill="none"/>
      <path class="tokoh-g" d="M42 150 C26 146 20 162 28 172" fill="none"/>
      <path class="tokoh-g" d="M198 150 C214 146 220 162 212 172" fill="none"/>
      <circle class="tokoh-g" cx="120" cy="142" r="86" fill="#F3A04A"/>
      ${[[78, 96], [104, 80], [146, 84], [170, 108], [62, 140], [178, 150], [80, 196], [116, 212], [158, 194]].map(([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="3" fill="#E08A35"/>`).join("")}
      <path d="M78 92 C88 76 102 68 116 66" fill="none" stroke="#FFF9EF" stroke-width="7" stroke-linecap="round" opacity=".55"/>
      <path class="tokoh-g" d="M120 58 V44" fill="none" style="stroke-width:5"/>
      <path class="tokoh-g" d="M122 48 C130 30 152 26 164 34 C156 50 136 56 122 48 Z" fill="#7DB35E" style="stroke-width:4"/>
      ${alis(98, 112, 2)}${alis(142, 112, -2)}${mata(98, 134)}${mata(142, 134)}${pipi(80, 158, "#E8774E")}${pipi(160, 158, "#E8774E")}`,
  },
  {
    id: "pao", nama: "Pao", ket: "bakpao", mulut: [120, 172, 30, 1],
    badan: `
      <path class="tokoh-g" d="M120 54 C176 54 206 112 204 176 C203 216 180 236 120 236 C60 236 37 216 36 176 C34 112 64 54 120 54 Z" fill="#FFF9EF"/>
      <path class="tokoh-tipis" d="M120 58 C112 74 104 82 98 88 M120 58 C128 74 136 82 142 88 M120 58 C120 72 120 82 120 92" style="stroke-width:3"/>
      <circle class="tokoh-g" cx="120" cy="60" r="8" fill="#E0A526" style="stroke-width:3.5"/>
      ${alis(96, 126, 1)}${alis(144, 126, -1)}${mata(96, 146)}${mata(144, 146)}${pipi(78, 168, "#F2A98E")}${pipi(162, 168, "#F2A98E")}`,
  },
  {
    id: "dino", nama: "Dino", ket: "dinosaurus kecil", mulut: [120, 150, 26, 0.7],
    badan: `
      <path class="tokoh-g" d="M176 206 C204 204 214 186 210 170 C200 184 190 190 172 190 Z" fill="#F2B54A"/>
      <path class="tokoh-g" d="M96 50 L104 28 L116 46 L124 22 L136 46 L148 30 L152 54 Z" fill="#7A5A96"/>
      <path class="tokoh-g" d="M120 44 C166 44 186 80 184 124 C188 150 186 176 176 200 C168 222 148 236 120 236 C92 236 72 222 64 200 C54 176 52 150 56 124 C54 80 74 44 120 44 Z" fill="#F2B54A"/>
      <path class="tokoh-g" d="M120 168 C148 168 160 186 158 206 C156 224 140 232 120 232 C100 232 84 224 82 206 C80 186 92 168 120 168 Z" fill="#FBE3A6" style="stroke-width:4"/>
      <path class="tokoh-tipis" d="M100 196 H140 M98 212 H142" style="stroke:#E0A526"/>
      <path class="tokoh-g" d="M66 160 C50 158 40 170 46 182 C52 192 66 190 72 180 Z" fill="#F2B54A"/>
      <path class="tokoh-g" d="M174 160 C190 158 200 170 194 182 C188 192 174 190 168 180 Z" fill="#F2B54A"/>
      <circle cx="78" cy="96" r="5" fill="#E0A526"/><circle cx="166" cy="104" r="6" fill="#E0A526"/><circle cx="156" cy="84" r="3.5" fill="#E0A526"/>
      ${alis(98, 104, 2)}${alis(142, 104, -2)}${mata(98, 124)}${mata(142, 124)}${pipi(82, 144)}${pipi(158, 144)}`,
  },
  {
    id: "tung", nama: "Tung", ket: "tung tung sahur", mulut: [120, 136, 22, 0.6],
    badan: `
      <rect class="tokoh-g" x="96" y="196" width="14" height="48" rx="7" fill="#C99558"/>
      <rect class="tokoh-g" x="130" y="196" width="14" height="48" rx="7" fill="#C99558"/>
      <path class="tokoh-g" d="M90 244 H112 M128 244 H150" fill="none"/>
      <path d="M84 120 C66 132 58 152 62 172" fill="none" stroke="${GARIS}" stroke-width="14" stroke-linecap="round"/>
      <path d="M84 120 C66 132 58 152 62 172" fill="none" stroke="#C99558" stroke-width="6" stroke-linecap="round"/>
      <rect class="tokoh-g" x="80" y="22" width="80" height="190" rx="30" fill="#DDAE72"/>
      <ellipse class="tokoh-g" cx="120" cy="34" rx="34" ry="10" fill="#C08A4E" style="stroke-width:4"/>
      <ellipse class="tokoh-tipis" cx="120" cy="34" rx="18" ry="5" style="stroke:#A87640;stroke-width:2.5"/>
      <path class="tokoh-tipis" d="M92 160 C96 180 94 194 98 204 M148 152 C144 172 148 188 144 202 M90 62 C92 74 90 80 92 88" style="stroke:#B98348;stroke-width:3"/>
      <path class="tokoh-g" d="M200 40 C212 44 214 58 206 70 L184 150 C182 156 172 154 172 148 L186 60 C188 46 192 38 200 40 Z" fill="#B07A3E" transform="rotate(8 190 100)"/>
      <path d="M156 122 C176 124 184 140 180 156" fill="none" stroke="${GARIS}" stroke-width="14" stroke-linecap="round"/>
      <path d="M156 122 C176 124 184 140 180 156" fill="none" stroke="#C99558" stroke-width="6" stroke-linecap="round"/>
      <circle class="tokoh-g" cx="180" cy="154" r="10" fill="#C99558"/>
      <circle cx="62" cy="174" r="9" fill="#C99558" stroke="${GARIS}" stroke-width="4"/>
      ${mata(104, 100, 0.9)}${mata(136, 100, 0.9)}${alis(104, 80, 2)}${alis(136, 80, -2)}${pipi(94, 124)}${pipi(146, 124)}`,
  },
];

/** Tokoh khusus landing (tidak muncul di pilihan persiapan sesi). Gaya sama: garis ungu tua 5 px, pipi, mata bulat. */
const TOKOH_LANDING: Tokoh<"ubi">[] = [
  {
    // Ubi ungu, warna logo Suapin. Kulit lavender supaya mata gelap tetap terlihat.
    id: "ubi", nama: "Ubi", ket: "ubi ungu", mulut: [120, 156, 28, 0.9],
    badan: `
      <path class="tokoh-g" d="M120 50 C112 34 100 26 86 26 C88 40 100 50 116 54 Z" fill="#8FA36B"/>
      <path class="tokoh-g" d="M122 52 C130 30 148 20 166 24 C162 42 146 54 126 56 Z" fill="#A3B57E"/>
      <path class="tokoh-tipis" d="M120 54 C118 46 114 40 108 36 M124 54 C132 44 142 36 154 32" style="stroke-width:3"/>
      <path class="tokoh-g" d="M118 232 C116 242 110 248 102 250" fill="none"/>
      <path class="tokoh-g" d="M64 150 C46 146 38 160 46 172 C52 180 62 178 68 170" fill="#A98BBE"/>
      <path class="tokoh-g" d="M176 150 C194 146 202 160 194 172 C188 180 178 178 172 170" fill="#A98BBE"/>
      <path class="tokoh-g" d="M120 52 C162 52 184 88 186 132 C188 182 162 232 120 234 C78 232 52 182 54 132 C56 88 78 52 120 52 Z" fill="#A98BBE"/>
      <path d="M150 70 C166 86 174 108 176 132" fill="none" stroke="#C7AFD6" stroke-width="7" stroke-linecap="round" opacity=".8"/>
      ${[[80, 96, 0], [164, 172, 30], [90, 200, -20], [150, 214, 10], [72, 156, 60]].map(([x, y, r]) =>
        `<path class="tokoh-tipis" d="M${x - 6} ${y} q6 -4 12 0" transform="rotate(${r} ${x} ${y})" style="stroke:#7E5E96;stroke-width:3"/>`).join("")}
      ${alis(98, 108, 2)}${alis(142, 108, -2)}${mata(98, 130)}${mata(142, 130)}${pipi(80, 152)}${pipi(160, 152)}`,
  },
];

export const TOKOH_AWAL: IdTokoh = "raka";
const KUNCI_TOKOH = "tm_tokoh";

export function tokohTersimpan(): IdTokoh {
  try {
    const s = localStorage.getItem(KUNCI_TOKOH);
    return TOKOH.some((t) => t.id === s) ? (s as IdTokoh) : TOKOH_AWAL;
  } catch { return TOKOH_AWAL; }
}

export function simpanTokoh(id: IdTokoh) {
  try { localStorage.setItem(KUNCI_TOKOH, id); } catch { /* penyimpanan diblokir: pilihan berlaku sampai halaman ditutup */ }
}

/** Isi SVG satu tokoh dalam koordinat 240×260, untuk ditempel di dalam <svg>. */
/** `kunci` membedakan clipPath bila tokoh yang sama tampil lebih dari sekali di satu halaman. */
export function GambarTokoh({ id, mulut, kunci }: { id: IdTokoh | "ubi"; mulut: number; kunci?: string }) {
  const t = ([...TOKOH, ...TOKOH_LANDING] as Tokoh<string>[]).find((x) => x.id === id) ?? TOKOH[0];
  const [cx, cy, w, maks] = t.mulut;
  const m = Math.min(1, Math.max(0, mulut)) * maks;
  return <g dangerouslySetInnerHTML={{ __html: t.badan + mulutSvg(kunci ?? t.id, cx, cy, w, m) }} />;
}
