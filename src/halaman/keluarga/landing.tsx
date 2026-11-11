// Pemilik: B (Satya). Landing `/` (B3.1, UI UX 10.1), gaya bento: kartu hero ubi ungu (judul + dua jalan masuk)
// + kartu karakter + tiga kartu fitur. Ketuk logo 5× dalam 3 detik → /dev/ambang (tanpa umpan balik).
import { useRef, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { Karakter } from "../../karakter/karakter.tsx";
import { Panah } from "../../komponen/beranda.tsx";
import { bento, tombolHero, tombolHeroKedua, tombolTeks, tombolUtama, wadahKeluarga } from "../../gaya/gaya.ts";
import { api } from "./data.ts";

export function Landing() {
  const pindah = useNavigate();
  const ketukan = useRef<number[]>([]);
  const ketukLogo = () => {
    const t = Date.now();
    ketukan.current = [...ketukan.current.filter((x) => t - x < 3000), t];
    if (ketukan.current.length >= 5) void pindah("/dev/ambang");
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-4 px-4 pb-6">
      <header className="flex items-center justify-between pt-3">
        <button type="button" onClick={ketukLogo} className="inline-flex min-h-12 items-center gap-2 font-judul text-subjudul font-bold">
          <img src="/ikon/suapin-ikon-ungu-putih.svg" alt="" className="size-9 rounded-[10px]" />
          Suapin
        </button>
        <span className="hidden sm:block"><Link to="/klinik/masuk" className={tombolTeks}>Untuk klinik →</Link></span>
      </header>

      <div className="grid gap-4 md:grid-cols-[1.35fr_1fr]">
        <div className="relative order-1 flex items-end justify-center overflow-hidden rounded-bento bg-jagung-muda md:order-2 md:min-h-[420px]">
          <div className="aspect-square w-[170px] md:w-[340px]">
            <Karakter pose="netral" mulut={0} makanan={null} layar="terang" latar={false} />
          </div>
        </div>

        <section className="order-2 flex flex-col justify-between gap-6 rounded-bento bg-ungu p-6 text-latar shadow-kartu md:order-1 md:p-8">
          <div className="flex flex-col gap-3">
            <h1 className="font-judul text-tampilan font-bold md:text-[44px] md:leading-[52px]">Makan jadi giliran main, bukan tontonan.</h1>
            <p className="text-isi text-latar/90">Teman makan yang meniru mulut anak, lalu pelan-pelan pergi dari layar.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/mulai" className={tombolHero}>Mulai gratis untuk keluarga <Panah /></Link>
            <Link to="/klinik/masuk" className={tombolHeroKedua}>Untuk klinik</Link>
            <Link to="/masuk" className="inline-flex min-h-12 items-center self-start font-semibold text-latar underline-offset-4 hover:underline">
              Sudah punya kode? Masuk
            </Link>
          </div>
        </section>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Fitur ikon={<IkonMulut />} judul="Meniru mulut anak">Karakter membuka dan menutup mulut bersama anak, langsung di HP.</Fitur>
        <Fitur ikon={<IkonTahap />} judul="Lepas layar bertahap">Dari karakter ikut makan sampai layar gelap dan pengasuh memimpin.</Fitur>
        <Fitur ikon={<IkonKamera />} judul="Video tetap di HP">Video kamera tidak pernah keluar dari HP. Yang disimpan hanya hasil suapan.</Fitur>
      </div>

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2 text-[13px] text-ungu-muda">
        <span>Prototipe lomba LOGICODIX 2026. Bukan alat diagnosis.</span>
        <button type="button" className="min-h-12 underline-offset-4 hover:underline"
          onClick={() => void api.demoMasukDika().then(() => pindah("/beranda"))}>
          Mode demo: keluarga Dika
        </button>
      </footer>
    </main>
  );
}

function Fitur({ ikon, judul, children }: { ikon: ReactNode; judul: string; children: ReactNode }) {
  return (
    <section className={`${bento} flex gap-4 sm:flex-col`}>
      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-ungu-tint text-ungu">{ikon}</span>
      <div className="flex flex-col gap-1">
        <h2 className="font-judul text-isi font-bold">{judul}</h2>
        <p className="text-kecil text-ungu-muda">{children}</p>
      </div>
    </section>
  );
}

const garis = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function IkonKamera() {
  return <svg viewBox="0 0 24 24" className="size-6" {...garis} aria-hidden="true"><rect x="2" y="6" width="14" height="12" rx="3" /><path d="M16 10l6-3v10l-6-3z" /></svg>;
}
function IkonMulut() {
  return <svg viewBox="0 0 24 24" className="size-6" {...garis} aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M8 14q4 4 8 0" /><path d="M9 9.5h.01M15 9.5h.01" /></svg>;
}
function IkonTahap() {
  return <svg viewBox="0 0 24 24" className="size-6" {...garis} aria-hidden="true"><path d="M4 20h4v-5h4v-5h4V5h4" /></svg>;
}

export function TidakAda() {
  return (
    <main className={`${wadahKeluarga} flex min-h-dvh flex-col justify-center gap-4`}>
      <h1 className="font-judul text-judul font-bold">Halaman tidak ditemukan</h1>
      <Link to="/" className={tombolUtama}>Ke halaman awal</Link>
    </main>
  );
}
