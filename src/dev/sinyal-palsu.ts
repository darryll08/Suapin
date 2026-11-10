// Pemilik: A (Darryl). A1.4: sumber sinyal palsu untuk pengembangan, tes, dan cadangan demo.
// Dipilih lewat query `?sumber=kamera|slider|rekaman:<nama>` (contoh: `/sesi?sumber=rekaman:contoh`).
import { RekamanSinyalSchema, type RekamanSinyal, type Sinyal } from "../../bersama/kontrak/sinyal.ts";
import type { SumberSinyal } from "../deteksi/sumber-kamera.ts";

const INTERVAL_MS = 50; // 20 fps, sama dengan kamera

/** Getar rahang saat diam untuk sumber palsu (setara derau ±0,003); ambang siklus jatuh ke batas minimal. */
export const GETAR_PALSU = 0.0017;

export type NilaiSlider = Omit<Sinyal, "t">;

export type SumberSlider = SumberSinyal & {
  atur(nilai: Partial<NilaiSlider>): void;
  nilai(): NilaiSlider;
  /** Mulut 0 → 0,6 → 0 dalam 1,5 detik. */
  bukaTutup(): void;
  /** Rahang sinus 1,5 Hz amplitudo 0,04 selama 5 detik. */
  kunyah5Detik(): void;
};

export function sumberSlider(): SumberSlider {
  const nilai: NilaiSlider = { mulut: 0, rahang: 0, yaw: 0, nangis: false, terlihat: true };
  let animMulut: number | null = null;
  let animKunyah: number | null = null;
  let interval = 0;
  return {
    async mulai(onSinyal) {
      window.clearInterval(interval);
      interval = window.setInterval(() => {
        const t = performance.now();
        let { mulut, rahang } = nilai;
        if (animMulut !== null) {
          const x = (t - animMulut) / 1500;
          if (x >= 1) animMulut = null;
          else mulut = 0.6 * (x < 0.5 ? x * 2 : (1 - x) * 2);
        }
        if (animKunyah !== null) {
          const d = (t - animKunyah) / 1000;
          if (d >= 5) animKunyah = null;
          else rahang = 0.04 * Math.sin(2 * Math.PI * 1.5 * d);
        }
        onSinyal({ ...nilai, t, mulut, rahang });
      }, INTERVAL_MS);
    },
    berhenti: () => window.clearInterval(interval),
    atur: (n) => Object.assign(nilai, n),
    nilai: () => ({ ...nilai }),
    bukaTutup: () => { animMulut = performance.now(); },
    kunyah5Detik: () => { animKunyah = performance.now(); },
  };
}

/** Memutar rekaman sekali dengan jeda sesuai `t`. Waktu digeser ke `performance.now()` saat mulai. */
export function sumberRekaman(muat: () => Promise<RekamanSinyal>): SumberSinyal {
  let interval = 0;
  return {
    async mulai(onSinyal) {
      const rekaman = await muat();
      const t0 = rekaman.sinyal[0]?.t ?? 0;
      const mulaiPada = performance.now();
      let i = 0;
      window.clearInterval(interval);
      interval = window.setInterval(() => {
        const lewat = performance.now() - mulaiPada;
        while (i < rekaman.sinyal.length && rekaman.sinyal[i].t - t0 <= lewat) {
          const s = rekaman.sinyal[i++];
          onSinyal({ ...s, t: mulaiPada + s.t - t0 });
        }
        if (i >= rekaman.sinyal.length) window.clearInterval(interval);
      }, INTERVAL_MS);
    },
    berhenti: () => window.clearInterval(interval),
  };
}

// Rekaman tersedia: contoh bersama + rekaman gerbang di uji/mesin/data/. Dimuat lewat bundler, bukan fetch.
const BERKAS = {
  ...import.meta.glob<unknown>("../../bersama/kontrak/contoh/rekaman-sinyal.json", { import: "default" }),
  ...import.meta.glob<unknown>("../../uji/mesin/data/*.json", { import: "default" }),
};
export const DAFTAR_REKAMAN: Record<string, () => Promise<RekamanSinyal>> = Object.fromEntries(
  Object.entries(BERKAS).map(([jalur, muat]) => {
    const nama = jalur.endsWith("rekaman-sinyal.json") ? "contoh" : jalur.split("/").pop()!.replace(/\.json$/, "");
    return [nama, async () => RekamanSinyalSchema.parse(await muat())];
  }),
);

export type JenisSumber = { jenis: "kamera" } | { jenis: "slider" } | { jenis: "rekaman"; nama: string };

/** Membaca nilai `?sumber=`. Nilai kosong atau tidak dikenal = kamera. */
export function bacaJenisSumber(param: string | null): JenisSumber {
  if (param === "slider") return { jenis: "slider" };
  if (param?.startsWith("rekaman:") && DAFTAR_REKAMAN[param.slice(8)]) return { jenis: "rekaman", nama: param.slice(8) };
  return { jenis: "kamera" };
}
