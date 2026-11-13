// Pemilik: B (Satya). Landing `/` (B3.1, UI UX 10.1). Alur: hook + demo meniru → masalah → cara kerja →
// lepas layar bertahap → untuk klinik + privasi. Angka hanya yang bersumber (Dokumen Produk bagian 4–5, 24).
// Ketuk logo 5× dalam 3 detik → /dev/ambang (tanpa umpan balik).
import { useRef, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { DemoMeniru } from "../../karakter/demo-meniru.tsx";
import { AdeganDenganLayar, AdeganSenang, AdeganTanpaLayar } from "../../karakter/adegan-landing.tsx";
import { AngkaNaik, Muncul } from "../../komponen/muncul.tsx";
import { bento, tombolHero, tombolUtama, wadahKeluarga } from "../../gaya/gaya.ts";
import { kalimatTahap } from "./bantu.ts";
import { api } from "./data.ts";

const fokus = "outline-none focus-visible:ring-4 focus-visible:ring-jagung focus-visible:ring-offset-2 focus-visible:ring-offset-latar";
const tombolPilUngu =
  `group inline-flex min-h-14 items-center justify-between gap-3 rounded-full bg-ungu pl-6 pr-2 font-judul text-isi font-bold whitespace-nowrap text-latar sm:text-tombol ` +
  `transition-[transform,box-shadow,background-color] duration-200 ease-standar hover:-translate-y-0.5 hover:bg-ungu-muda hover:shadow-angkat ` +
  `active:translate-y-0 active:scale-[0.97] motion-reduce:transform-none ${fokus}`;
const tombolPilGaris =
  `inline-flex min-h-14 items-center justify-center rounded-full border-2 border-ungu px-8 font-judul text-isi font-bold text-ungu sm:text-tombol ` +
  `transition-[transform,box-shadow,background-color] duration-200 ease-standar hover:-translate-y-0.5 hover:bg-ungu-tint hover:shadow-angkat-tipis ` +
  `active:translate-y-0 active:scale-[0.97] motion-reduce:transform-none ${fokus}`;

export function Landing() {
  const pindah = useNavigate();
  const ketukan = useRef<number[]>([]);
  const ketukLogo = () => {
    const t = Date.now();
    ketukan.current = [...ketukan.current.filter((x) => t - x < 3000), t];
    if (ketukan.current.length >= 5) void pindah("/dev/ambang");
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-16 overflow-x-clip px-4 pb-6 md:gap-24">
      <div className="flex flex-col">
        <header className="flex items-center justify-between pt-3">
          <button type="button" onClick={ketukLogo} className="inline-flex min-h-12 items-center gap-2 font-judul text-subjudul font-bold">
            <img src="/ikon/suapin-ikon-ungu-putih.svg" alt="" className="size-9 rounded-isian" />
            Suapin
          </button>
          <Link to="/masuk" className="inline-flex min-h-12 items-center rounded-full px-4 text-isi font-semibold text-ungu underline-offset-4 hover:underline hover:decoration-jagung hover:decoration-2">Masuk</Link>
        </header>

        {/* 1. Hook */}
        <section className="grid items-center gap-8 pt-6 md:grid-cols-[1.1fr_1fr] md:pt-12">
          <div className="flex flex-col gap-5">
            <h1 className="masuk font-judul text-besar font-bold text-balance md:text-hero">
              Makan jadi giliran main,{" "}
              <span className="relative inline-block text-jagung-tua">
                bukan tontonan.
                <svg viewBox="0 0 200 12" className="absolute -bottom-2 left-0 h-3 w-full" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 8 Q100 0 198 7" fill="none" stroke="var(--color-jagung)" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <span className="masuk h-1 w-12 rounded-full bg-ungu" style={{ animationDelay: "100ms" }} aria-hidden="true" />
            <p className="masuk max-w-[460px] text-isi text-ungu-muda" style={{ animationDelay: "150ms" }}>Teman makan yang meniru mulut anak, lalu pelan-pelan pergi dari layar.</p>
            <div className="masuk flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "250ms" }}>
              <Link to="/mulai" className={tombolPilUngu}>Mulai gratis untuk keluarga <PanahJagung /></Link>
              <Link to="/masuk" className={tombolPilGaris}>Masuk</Link>
            </div>
            <ul className="masuk flex flex-wrap gap-2 text-kecil font-semibold" style={{ animationDelay: "350ms" }}>
              <Chip ikon={<IkonKamera />}>Video tetap di HP</Chip>
              <Chip ikon={<IkonAnak />}>Untuk usia 3–5 tahun</Chip>
            </ul>
          </div>
          <DemoMeniru className="masuk-skala mx-auto w-full max-w-[300px] md:max-w-[440px]" />
        </section>
      </div>

      {/* 2. Masalah: dua sisi yang sama-sama tidak berhasil */}
      <section className="flex flex-col gap-8">
        <div className="grid items-end gap-6 md:grid-cols-[1.3fr_1fr]">
          <Muncul dari="kiri" className="flex flex-col gap-4">
            <h2 className="font-judul text-judul font-bold md:text-besar">Tanpa layar menolak, dengan layar tidak memperhatikan.</h2>
            <p className="text-isi text-ungu-muda">Dokter meminta makan tanpa layar, tapi di rumah tidak ada penggantinya.</p>
          </Muncul>
          <Muncul dari="kanan" tunda={150} className={`${bento} flex flex-col gap-1`}>
            <p className="font-judul text-besar font-bold tabular-nums">15–<AngkaNaik dari={15} ke={60} />%</p>
            <p className="text-isi">anak prasekolah mengalami kesulitan makan, menurut berbagai studi di Indonesia.</p>
            <p className="text-mini text-ungu-muda">Angka berbeda karena definisinya berbeda. Sumber: kajian pustaka, repositori UKWMS.</p>
          </Muncul>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Adegan gambar={<AdeganTanpaLayar />} label="Tanpa layar" ikon={<IkonTangan />} tunda={0} dari="kiri"
            judul="Anak menutup mulut dan menoleh dari sendok."
            alt="Ilustrasi: teman makan menutup mulut dan menoleh dari sendok berisi brokoli." />
          <Adegan gambar={<AdeganDenganLayar />} label="Dengan layar" ikon={<IkonJam />} tunda={150} dari="kanan"
            judul="Mau makan, tapi matanya ke layar. Bisa sampai satu jam."
            alt="Ilustrasi: teman makan menatap tablet sementara sendok berisi brokoli menunggu di piring." />
        </div>
      </section>

      {/* 3. Cara kerja */}
      <section className="flex flex-col gap-8">
        <Muncul className="mx-auto flex max-w-[640px] flex-col gap-3 text-center">
          <h2 className="font-judul text-judul font-bold md:text-besar">Layar dipakai untuk makan bareng, bukan untuk ditonton.</h2>
        </Muncul>
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            ["01", "Karakter menggigit duluan", "Anak melihat teman makannya menikmati makanan yang sama."],
            ["02", "Pengasuh menekan Suap", "Satu tombol besar di bawah layar. Tidak perlu membaca layar."],
            ["03", "Karakter meniru, lalu merayakan", "Mulut karakter mengikuti mulut anak. Perayaan hanya saat suapan diterima; saat menolak, karakter diam."],
          ].map(([n, judul, isi], i) => (
            <li key={n}>
              <Muncul tunda={i * 150} className={`${bento} flex h-full flex-col gap-2`}>
                <span className="font-judul text-besar font-bold text-jagung-tua tabular-nums">{n}</span>
                <h3 className="font-judul text-subjudul font-bold">{judul}</h3>
                <p className="text-isi text-ungu-muda">{isi}</p>
              </Muncul>
            </li>
          ))}
        </ol>
        <Muncul dari="skala">
          <figure className={`${bento} grid items-center gap-5 p-4 sm:grid-cols-[220px_1fr] sm:p-5`}>
            <div className="mx-auto aspect-square w-full max-w-[220px] overflow-hidden rounded-kartu bg-jagung-muda">
              <div role="img" aria-label="Ilustrasi: teman makan tertawa, dikelilingi stiker." className="size-full"><AdeganSenang /></div>
            </div>
            <figcaption className="flex flex-col gap-2 sm:pr-4">
              <p className="font-judul text-subjudul font-bold text-balance md:text-judul">Makan jadi momen yang ditunggu, bukan drama setiap hari.</p>
              <p className="text-isi text-ungu-muda">Setiap suapan yang diterima dirayakan. Orang tua dan dokter melihat catatannya: diterima, ditolak, atau ngemut.</p>
            </figcaption>
          </figure>
        </Muncul>
        <Muncul className="mx-auto max-w-[640px] text-center text-kecil text-ungu-muda">
          Makanan baru dihitung sampai 10 kali coba, karena penerimaan umumnya naik setelah 8–10 kali paparan (tinjauan USDA NESR).
        </Muncul>
      </section>

      {/* 4. Lepas layar bertahap */}
      <section className="flex flex-col gap-8">
        <Muncul className="mx-auto flex max-w-[640px] flex-col gap-3 text-center">
          <h2 className="font-judul text-judul font-bold md:text-besar">Tujuannya justru supaya layar tidak dibutuhkan lagi.</h2>
        </Muncul>
        <ol className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((t, i) => (
            <li key={t}>
              <Muncul dari="skala" tunda={i * 120} className={`flex h-full flex-col gap-2 rounded-bento border border-garis/50 p-5 ${t === 3 ? "bg-black text-latar" : t === 4 ? "bg-ungu-tint" : "bg-permukaan"}`}>
                <span className={`font-judul text-besar font-bold tabular-nums ${t === 3 ? "text-jagung" : "text-ungu"}`}>{t}</span>
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
      <Muncul dari="skala">
        <section className="grid gap-6 rounded-bento bg-ungu p-6 text-latar md:grid-cols-[1.4fr_1fr] md:p-10">
          <div className="flex flex-col gap-3">
            <h2 className="font-judul text-judul font-bold md:text-besar">Dokter menulis aturan seperti biasa. Sesi di rumah langsung mengikuti.</h2>
            <p className="text-isi text-latar/90">AI mengubah teks dokter menjadi aturan sesi dalam rentang aman. Dokter memeriksa dan mengonfirmasi sebelum aturan dipakai.</p>
          </div>
          <div className="flex flex-col justify-end gap-3">
            <Link to="/masuk?sebagai=klinik" className={tombolHero}>Masuk untuk klinik</Link>
            <p className="flex items-start gap-2 text-kecil text-latar/90">
              <span className="mt-0.5 shrink-0"><IkonKamera /></span>
              Video kamera tidak pernah keluar dari HP. Yang disimpan hanya hasil suapan: diterima, ditolak, atau ngemut.
            </p>
          </div>
        </section>
      </Muncul>

      <footer className="flex flex-col gap-3 border-t border-garis/60 pt-6 text-mini text-ungu-muda">
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

function Adegan({ gambar, label, ikon, judul, alt, tunda, dari }: { gambar: ReactNode; label: string; ikon: ReactNode; judul: string; alt: string; tunda: number; dari: "kiri" | "kanan" }) {
  return (
    <Muncul tunda={tunda} dari={dari}>
      <figure className={`${bento} flex flex-col gap-3 p-3`}>
        <div className="relative">
          <div role="img" aria-label={alt} className="overflow-hidden rounded-kartu">{gambar}</div>
          <span className="absolute top-3 left-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-permukaan px-4 text-kecil font-bold">
            {ikon} {label}
          </span>
        </div>
        <figcaption className="px-2 pb-2 text-isi font-semibold">{judul}</figcaption>
      </figure>
    </Muncul>
  );
}

function Chip({ ikon, children }: { ikon: ReactNode; children: ReactNode }) {
  return <li className="inline-flex min-h-10 items-center gap-2 rounded-full border border-garis/70 bg-permukaan px-4">{ikon}{children}</li>;
}

function PanahJagung() {
  return (
    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-jagung text-ungu transition-transform duration-200 ease-standar group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:rotate-12 motion-reduce:transform-none" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M7 17L17 7M9 7h8v8" /></svg>
    </span>
  );
}

const garis = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
function IkonKamera() {
  return <svg viewBox="0 0 24 24" className="size-5" {...garis} aria-hidden="true"><rect x="2" y="6" width="14" height="12" rx="3" /><path d="M16 10l6-3v10l-6-3z" /></svg>;
}
function IkonTangan() {
  return <svg viewBox="0 0 24 24" className="size-5" {...garis} aria-hidden="true"><path d="M8 13V6a1.5 1.5 0 0 1 3 0v6M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v7a6 6 0 0 1-6 6h-.5A5.5 5.5 0 0 1 5 13.5V11a1.5 1.5 0 0 1 3 0" /></svg>;
}
function IkonJam() {
  return <svg viewBox="0 0 24 24" className="size-5" {...garis} aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
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
