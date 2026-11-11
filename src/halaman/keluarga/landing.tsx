// Pemilik: B (Satya). Landing `/` (B3.1, UI UX 10.1). Alur: hook + demo meniru → masalah → cara kerja →
// lepas layar bertahap → untuk klinik + privasi. Angka hanya yang bersumber (Dokumen Produk bagian 4–5, 24).
// Ketuk logo 5× dalam 3 detik → /dev/ambang (tanpa umpan balik).
import { useRef, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { AdeganNonton } from "../../karakter/adegan-nonton.tsx";
import { DemoMeniru } from "../../karakter/demo-meniru.tsx";
import { Muncul } from "../../komponen/muncul.tsx";
import { bento, tombolHero, tombolTeks, tombolUtama, wadahKeluarga } from "../../gaya/gaya.ts";
import { Panah } from "../../komponen/beranda.tsx";
import { kalimatTahap } from "./bantu.ts";
import { api } from "./data.ts";

const fokus = "outline-none focus-visible:ring-4 focus-visible:ring-jagung focus-visible:ring-offset-2 focus-visible:ring-offset-latar";
const tombolPilUngu =
  `inline-flex min-h-14 items-center justify-between gap-3 rounded-full bg-ungu pl-6 pr-2 font-judul text-isi font-bold whitespace-nowrap text-latar sm:text-tombol ` +
  `transition-transform duration-150 active:scale-[0.98] ${fokus}`;
const tombolPilGaris =
  `inline-flex min-h-14 items-center justify-center rounded-full border-2 border-ungu px-6 font-judul text-isi font-bold text-ungu sm:text-tombol ` +
  `transition-[transform,background-color] duration-150 hover:bg-ungu-tint active:scale-[0.98] ${fokus}`;

export function Landing() {
  const pindah = useNavigate();
  const ketukan = useRef<number[]>([]);
  const ketukLogo = () => {
    const t = Date.now();
    ketukan.current = [...ketukan.current.filter((x) => t - x < 3000), t];
    if (ketukan.current.length >= 5) void pindah("/dev/ambang");
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-4 pb-6 md:gap-24">
      <div className="flex flex-col">
        <header className="flex items-center justify-between pt-3">
          <button type="button" onClick={ketukLogo} className="inline-flex min-h-12 items-center gap-2 font-judul text-subjudul font-bold">
            <img src="/ikon/suapin-ikon-ungu-putih.svg" alt="" className="size-9 rounded-[10px]" />
            Suapin
          </button>
          <span className="hidden sm:block"><Link to="/klinik/masuk" className={tombolTeks}>Untuk klinik →</Link></span>
        </header>

        {/* 1. Hook */}
        <section className="grid items-center gap-8 pt-6 md:grid-cols-[1.1fr_1fr] md:pt-12">
          <div className="flex flex-col gap-5">
            <h1 className="font-judul text-[34px] leading-[42px] font-bold text-balance md:text-[52px] md:leading-[60px]">
              Makan jadi giliran main,{" "}
              <span className="relative inline-block text-jagung-tua">
                bukan tontonan.
                <svg viewBox="0 0 200 12" className="absolute -bottom-2 left-0 h-3 w-full" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 8 Q100 0 198 7" fill="none" stroke="var(--color-jagung)" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <span className="h-1 w-12 rounded-full bg-ungu" aria-hidden="true" />
            <p className="max-w-[460px] text-isi text-ungu-muda">Teman makan yang meniru mulut anak, lalu pelan-pelan pergi dari layar.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/mulai" className={tombolPilUngu}>Mulai gratis untuk keluarga <PanahJagung /></Link>
              <Link to="/klinik/masuk" className={tombolPilGaris}>Untuk klinik</Link>
            </div>
            <Link to="/masuk" className={`${tombolTeks} -ml-3 self-start`}>Sudah punya kode? Masuk</Link>
            <ul className="flex flex-wrap gap-2 text-kecil font-semibold">
              <Chip ikon={<IkonKamera />}>Video tetap di HP</Chip>
              <Chip ikon={<IkonAnak />}>Untuk usia 3–5 tahun</Chip>
            </ul>
          </div>
          <DemoMeniru className="mx-auto w-full max-w-[300px] md:max-w-[440px]" />
        </section>
      </div>

      {/* 2. Masalah */}
      <section className="grid items-center gap-8 md:grid-cols-2">
        <Muncul><AdeganNonton /></Muncul>
        <Muncul tunda={100} className="flex flex-col gap-4">
          <p className="text-kecil font-bold tracking-wider text-jagung-tua uppercase">Masalahnya</p>
          <h2 className="font-judul text-judul font-bold md:text-[34px] md:leading-[42px]">Disuapi sambil nonton, makan bisa sampai satu jam.</h2>
          <p className="text-isi text-ungu-muda">
            Tanpa layar, anak menutup mulut. Dengan layar, anak makan tanpa memperhatikan makanannya. Dokter meminta makan tanpa layar, tapi di rumah tidak ada penggantinya.
          </p>
          <div className={`${bento} flex flex-col gap-1`}>
            <p className="font-judul text-[34px] leading-10 font-bold tabular-nums">15–60%</p>
            <p className="text-isi">anak prasekolah mengalami kesulitan makan, menurut berbagai studi di Indonesia.</p>
            <p className="text-[13px] text-ungu-muda">Angka berbeda karena definisinya berbeda. Sumber: kajian pustaka, repositori UKWMS.</p>
          </div>
        </Muncul>
      </section>

      {/* 3. Cara kerja */}
      <section className="flex flex-col gap-8">
        <Muncul className="mx-auto flex max-w-[640px] flex-col gap-3 text-center">
          <p className="text-kecil font-bold tracking-wider text-jagung-tua uppercase">Cara kerja</p>
          <h2 className="font-judul text-judul font-bold md:text-[34px] md:leading-[42px]">Layar dipakai untuk makan bareng, bukan untuk ditonton.</h2>
        </Muncul>
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            ["01", "Karakter menggigit duluan", "Anak melihat teman makannya menikmati makanan yang sama."],
            ["02", "Pengasuh menekan Suap", "Satu tombol besar di sisi pengasuh. Tidak perlu membaca layar."],
            ["03", "Karakter meniru, lalu merayakan", "Mulut karakter mengikuti mulut anak. Perayaan hanya saat suapan diterima; saat menolak, karakter diam."],
          ].map(([n, judul, isi], i) => (
            <li key={n}>
              <Muncul tunda={i * 100} className={`${bento} flex h-full flex-col gap-2`}>
                <span className="font-judul text-[34px] leading-10 font-bold text-jagung-tua tabular-nums">{n}</span>
                <h3 className="font-judul text-subjudul font-bold">{judul}</h3>
                <p className="text-isi text-ungu-muda">{isi}</p>
              </Muncul>
            </li>
          ))}
        </ol>
        <Muncul className="mx-auto max-w-[640px] text-center text-kecil text-ungu-muda">
          Makanan baru dihitung sampai 10 kali coba, karena penerimaan umumnya naik setelah 8–10 kali paparan (tinjauan USDA NESR).
        </Muncul>
      </section>

      {/* 4. Lepas layar bertahap */}
      <section className="flex flex-col gap-8">
        <Muncul className="mx-auto flex max-w-[640px] flex-col gap-3 text-center">
          <p className="text-kecil font-bold tracking-wider text-jagung-tua uppercase">Lepas layar bertahap</p>
          <h2 className="font-judul text-judul font-bold md:text-[34px] md:leading-[42px]">Tujuannya justru supaya layar tidak dibutuhkan lagi.</h2>
        </Muncul>
        <ol className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((t, i) => (
            <li key={t}>
              <Muncul tunda={i * 80} className={`flex h-full flex-col gap-2 rounded-bento p-5 shadow-kartu ${t === 3 ? "bg-black text-latar" : t === 4 ? "bg-ungu-tint" : "bg-permukaan"}`}>
                <span className={`font-judul text-[34px] leading-10 font-bold tabular-nums ${t === 3 ? "text-jagung" : "text-ungu"}`}>{t}</span>
                <p className={`text-kecil ${t === 3 ? "text-latar/90" : "text-ungu-muda"}`}>{kalimatTahap(t, "anak", "Pengasuh")}</p>
              </Muncul>
            </li>
          ))}
        </ol>
        <Muncul className="mx-auto max-w-[640px] text-center text-kecil text-ungu-muda">
          Naik tahap otomatis setelah 5 sesi dengan minimal 5 suapan diterima. Di jalur klinik, dokter yang menaikkan.
        </Muncul>
      </section>

      {/* 5. Untuk klinik + privasi */}
      <Muncul>
        <section className="grid gap-6 rounded-bento bg-ungu p-6 text-latar shadow-kartu md:grid-cols-[1.4fr_1fr] md:p-10">
          <div className="flex flex-col gap-3">
            <p className="text-kecil font-bold tracking-wider text-jagung uppercase">Untuk klinik</p>
            <h2 className="font-judul text-judul font-bold md:text-[34px] md:leading-[42px]">Dokter menulis aturan seperti biasa. Sesi di rumah langsung mengikuti.</h2>
            <p className="text-isi text-latar/90">AI mengubah teks dokter menjadi aturan sesi dalam rentang aman. Dokter memeriksa dan mengonfirmasi sebelum aturan dipakai.</p>
          </div>
          <div className="flex flex-col justify-end gap-3">
            <Link to="/klinik/masuk" className={tombolHero}>Masuk untuk klinik <Panah /></Link>
            <p className="flex items-start gap-2 text-kecil text-latar/90">
              <span className="mt-0.5 shrink-0"><IkonKamera /></span>
              Video kamera tidak pernah keluar dari HP. Yang disimpan hanya hasil suapan: diterima, ditolak, atau ngemut.
            </p>
          </div>
        </section>
      </Muncul>

      <footer className="flex flex-col gap-3 border-t border-garis/60 pt-6 text-[13px] text-ungu-muda">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>Prototipe lomba LOGICODIX 2026. Bukan alat diagnosis.</span>
          <button type="button" className="min-h-12 underline-offset-4 hover:underline"
            onClick={() => void api.demoMasukDika().then(() => pindah("/beranda"))}>
            Mode demo: keluarga Dika
          </button>
        </div>
        <span>Klip suara dan skrining masih draf. Deteksi diuji pada orang dewasa.</span>
      </footer>
    </main>
  );
}

function Chip({ ikon, children }: { ikon: ReactNode; children: ReactNode }) {
  return <li className="inline-flex min-h-10 items-center gap-2 rounded-full bg-permukaan px-4 shadow-kartu">{ikon}{children}</li>;
}

function PanahJagung() {
  return (
    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-jagung text-ungu" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M7 17L17 7M9 7h8v8" /></svg>
    </span>
  );
}

const garis = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
function IkonKamera() {
  return <svg viewBox="0 0 24 24" className="size-5" {...garis} aria-hidden="true"><rect x="2" y="6" width="14" height="12" rx="3" /><path d="M16 10l6-3v10l-6-3z" /></svg>;
}
function IkonAnak() {
  return <svg viewBox="0 0 24 24" className="size-5" {...garis} aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></svg>;
}

export function TidakAda() {
  return (
    <main className={`${wadahKeluarga} flex min-h-dvh flex-col justify-center gap-4`}>
      <h1 className="font-judul text-judul font-bold">Halaman tidak ditemukan</h1>
      <Link to="/" className={tombolUtama}>Ke halaman awal</Link>
    </main>
  );
}
