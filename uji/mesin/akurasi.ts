// Pemilik: A (Darryl). A1.5 + A3.2: nilai rekaman kamera dengan engine sesi, lalu cetak tabel Markdown.
// Pakai: npx tsx uji/mesin/akurasi.ts [folder] [kunci=nilai ...]
//   folder bawaan uji/mesin/data. Contoh ubah ambang: npx tsx uji/mesin/akurasi.ts uji/mesin/data batasBukaDetik=6
//
// Setiap rekaman `X.json` (RekamanSinyal) dipasangkan dengan `X.suap.json` yang diunduh /dev/kamera:
//   { uji, penguji, sisi, suap: [t, ...] }                       gerbang: label diambil dari HARAPAN_UJI
//   { uji, penguji, sisi, suap: [{ t, label }, ...] }             uji akurasi: label ditulis manual per suapan
// Tanpa file .suap.json, waktu Suap ditaksir 0,5 detik sebelum mulut mulai terbuka (ditandai "taksiran").
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { RekamanSinyalSchema, type Sinyal } from "../../bersama/kontrak/sinyal.ts";
import { cocok, HARAPAN_UJI, nilaiPercobaan, nilaiSuap, statistikLamaBuka, UJI_GERBANG, type HasilSuap, type Label } from "../../src/dev/gerbang.ts";
import { AMBANG_AWAL, gabungAmbang } from "../../src/mesin/ambang.ts";

type Uji = (typeof UJI_GERBANG)[number];
type Baris = { uji: string; penguji: string; label: Label; hasil: HasilSuap; kunyah: boolean; benar: boolean; lamaBuka: number; taksiran: boolean };

const argumen = process.argv.slice(2);
const folder = argumen.find((a) => !a.includes("=")) ?? "uji/mesin/data";
const ubah = Object.fromEntries(argumen.filter((a) => a.includes("=")).map((a) => {
  const [k, v] = a.split("=");
  return [k, v === "true" ? true : v === "false" ? false : Number(v)];
}));
const ambang = gabungAmbang({ ...AMBANG_AWAL, ...ubah });

/** Taksiran waktu Suap: 0,5 s sebelum tiap awal mulut terbuka (bukaan berjarak < 1 s digabung). */
function taksirSuap(sinyal: Sinyal[]): number[] {
  const awal: number[] = [];
  let buka = false, tutupTerakhir = -Infinity;
  for (const s of sinyal) {
    if (s.mulut > ambang.terbuka && !buka) {
      if (s.t - tutupTerakhir > 1000) awal.push(s.t - 500);
      buka = true;
    } else if (s.mulut <= ambang.terbuka && buka) {
      buka = false;
      tutupTerakhir = s.t;
    }
  }
  return awal;
}

const baris: Baris[] = [];
for (const f of readdirSync(folder).filter((n) => n.endsWith(".json") && !n.endsWith(".suap.json")).sort()) {
  const rek = RekamanSinyalSchema.safeParse(JSON.parse(readFileSync(join(folder, f), "utf8")));
  if (!rek.success) continue;
  const fileSuap = join(folder, f.replace(/\.json$/, ".suap.json"));
  const meta = existsSync(fileSuap) ? JSON.parse(readFileSync(fileSuap, "utf8")) : null;
  const dariCatatan = /Gerbang: (.+?) · penguji (.+?) ·/.exec(rek.data.catatan);
  const uji: string = meta?.uji ?? dariCatatan?.[1] ?? f;
  const penguji: string = meta?.penguji ?? dariCatatan?.[2] ?? "?";
  const suap: { t: number; label?: Label }[] = meta
    ? meta.suap.map((x: number | { t: number; label: Label }) => (typeof x === "number" ? { t: x } : x))
    : taksirSuap(rek.data.sinyal).map((t) => ({ t }));
  const harapan = HARAPAN_UJI[uji as Uji]?.label;
  for (const { t, label = harapan } of suap) {
    if (!label) continue;
    const h = nilaiSuap(rek.data.sinyal, t, ambang);
    baris.push({
      uji, penguji, label, ...h, benar: cocok(label, h),
      lamaBuka: nilaiPercobaan(rek.data.sinyal, t, ambang.terbuka).lamaBukaDetik, taksiran: !meta,
    });
  }
}

if (!baris.length) {
  console.log(`Tidak ada rekaman yang bisa dinilai di ${folder}.`);
  process.exit(0);
}

const ubahan = Object.keys(ubah).length ? ` (diubah: ${Object.entries(ubah).map(([k, v]) => `${k}=${v}`).join(", ")})` : "";
console.log(`Ambang: AMBANG_AWAL${ubahan}. ${baris.length} percobaan dari ${folder}.\n`);

// Tabel gerbang: per uji, benar/total per penguji, dinormalkan ke 10 percobaan untuk dibandingkan dengan syarat.
console.log("| Uji | Syarat | " + [...new Set(baris.map((b) => b.penguji))].join(" | ") + " | Total | Lolos? |");
console.log("|---|---|" + [...new Set(baris.map((b) => b.penguji))].map(() => "---").join("|") + "|---|---|");
const daftarPenguji = [...new Set(baris.map((b) => b.penguji))];
for (const uji of new Set(baris.map((b) => b.uji))) {
  const b = baris.filter((x) => x.uji === uji);
  const syarat = HARAPAN_UJI[uji as Uji];
  const sel = daftarPenguji.map((p) => {
    const x = b.filter((y) => y.penguji === p);
    return x.length ? `${x.filter((y) => y.benar).length}/${x.length}` : "";
  });
  const benar = b.filter((x) => x.benar).length;
  const lolos = syarat ? (benar / b.length >= syarat.lolos / 10 ? "ya" : "tidak") : "-";
  const tanda = b.some((x) => x.taksiran) ? " (Suap ditaksir)" : "";
  console.log(`| ${uji}${tanda} | ${syarat ? `≥ ${syarat.lolos}/10` : "-"} | ${sel.join(" | ")} | ${benar}/${b.length} | ${lolos} |`);
}

// Lama buka dari uji sendok → usulan batasBukaDetik.
const sendok = baris.filter((b) => b.uji === UJI_GERBANG[1]).map((b) => b.lamaBuka);
const st = statistikLamaBuka(sendok);
if (st) {
  console.log(`\nLama buka uji sendok (n = ${st.n}): min ${st.min.toFixed(2)} s, median ${st.median.toFixed(2)} s, p90 ${st.p90.toFixed(2)} s → usulan batasBukaDetik ${st.usulanBatas}`);
}

// Precision, recall, F1 untuk percobaan berlabel hasil tegas.
const tegas = baris.filter((b) => b.label === "diterima" || b.label === "ditolak");
for (const kelas of ["diterima", "ditolak"] as const) {
  const tp = tegas.filter((b) => b.hasil === kelas && b.label === kelas).length;
  const fp = tegas.filter((b) => b.hasil === kelas && b.label !== kelas).length;
  const fn = tegas.filter((b) => b.hasil !== kelas && b.label === kelas).length;
  const p = tp + fp ? tp / (tp + fp) : NaN, r = tp + fn ? tp / (tp + fn) : NaN;
  const f1 = p + r ? (2 * p * r) / (p + r) : NaN;
  console.log(`${kelas}: precision ${p.toFixed(2)}, recall ${r.toFixed(2)}, F1 ${f1.toFixed(2)} (TP ${tp}, FP ${fp}, FN ${fn})`);
}
const tp = tegas.filter((b) => b.hasil === "tidak_pasti").length;
console.log(`tidak pasti: ${tp}/${tegas.length} (ditanyakan ke pengasuh, tidak dihitung benar)`);
console.log("\nKlaim: diuji pada orang dewasa, belum diuji pada balita.");
