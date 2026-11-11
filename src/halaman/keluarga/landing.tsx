// Pemilik: B (Satya). Landing `/` (B3.1, UI UX 10.1). Ketuk logo 5× dalam 3 detik → /dev/ambang (tanpa umpan balik).
import { useRef } from "react";
import { Link, useNavigate } from "react-router";
import { Karakter } from "../../karakter/karakter.tsx";
import { tombolKedua, tombolTeks, tombolUtama, wadahKeluarga } from "../../gaya/gaya.ts";
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
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pb-6">
      <header className="flex items-center justify-between pt-3">
        <button type="button" onClick={ketukLogo} className="inline-flex min-h-12 items-center gap-2 font-judul text-subjudul font-bold">
          <img src="/ikon/suapin-ikon-ungu-putih.svg" alt="" className="size-9 rounded-[10px]" />
          Suapin
        </button>
        <span className="hidden sm:block"><Link to="/klinik/masuk" className={tombolTeks}>Untuk klinik →</Link></span>
      </header>

      <div className="flex flex-1 flex-col items-center gap-4 sm:flex-row-reverse sm:justify-between sm:gap-10">
        <div className="mx-auto aspect-square w-[200px] shrink-0 sm:w-[360px]">
          <Karakter pose="netral" mulut={0} makanan={null} layar="terang" />
        </div>
        <div className="flex w-full max-w-[560px] flex-col gap-3">
          <h1 className="font-judul text-tampilan font-bold">Makan jadi giliran main, bukan tontonan.</h1>
          <p className="text-isi text-ungu-muda">Teman makan yang meniru mulut anak, lalu pelan-pelan pergi dari layar.</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link to="/mulai" className={tombolUtama}>Mulai gratis untuk keluarga</Link>
            <Link to="/klinik/masuk" className={tombolKedua}>Untuk klinik</Link>
          </div>
          <Link to="/masuk" className={`${tombolTeks} self-start -ml-3`}>Sudah punya kode? Masuk</Link>
          <p className="flex items-center gap-2 text-kecil text-ungu-muda">
            <IkonKamera /> Video kamera tidak pernah keluar dari HP.
          </p>
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 pt-4 text-[13px] text-ungu-muda">
        <span>Prototipe lomba LOGICODIX 2026. Bukan alat diagnosis.</span>
        <button type="button" className="min-h-12 underline-offset-4 hover:underline"
          onClick={() => void api.demoMasukDika().then(() => pindah("/beranda"))}>
          Mode demo: keluarga Dika
        </button>
      </footer>
    </main>
  );
}

function IkonKamera() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="6" width="14" height="12" rx="3" /><path d="M16 10l6-3v10l-6-3z" />
    </svg>
  );
}

export function TidakAda() {
  return (
    <main className={`${wadahKeluarga} flex min-h-dvh flex-col justify-center gap-4`}>
      <h1 className="font-judul text-judul font-bold">Halaman tidak ditemukan</h1>
      <Link to="/" className={tombolUtama}>Ke halaman awal</Link>
    </main>
  );
}
