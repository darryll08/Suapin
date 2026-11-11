// Pemilik: B (Satya). Komponen dasar (B0.3). Kelas diambil dari src/gaya/gaya.ts.
import { useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { Link } from "react-router";
import { isian, kartu, nadaPil, pil, teksPeringatan, tombolKedua, tombolTeks, tombolUtama } from "../gaya/gaya.ts";

const kelasVarian = { utama: tombolUtama, kedua: tombolKedua, teks: tombolTeks } as const;

type PropsTombol = ButtonHTMLAttributes<HTMLButtonElement> & {
  varian?: keyof typeof kelasVarian;
  memuat?: boolean;
};

export function Tombol({ varian = "utama", memuat = false, className = "", children, disabled, type = "button", ...sisa }: PropsTombol) {
  return (
    <button
      type={type}
      className={`${kelasVarian[varian]} ${className}`}
      disabled={disabled || memuat}
      aria-busy={memuat || undefined}
      {...sisa}
    >
      {memuat && <Putar />}
      {children}
    </button>
  );
}

export function Kartu({ children, className = "", as: Tag = "section" }: { children: ReactNode; className?: string; as?: "section" | "div" | "article" }) {
  return <Tag className={`${kartu} ${className}`}>{children}</Tag>;
}

type PropsIsian = InputHTMLAttributes<HTMLInputElement> & { label: string; bantuan?: string; galat?: string };

export function Isian({ label, bantuan, galat, id, className = "", ...sisa }: PropsIsian) {
  const idAuto = useId();
  const idIsian = id ?? idAuto;
  const idKet = `${idIsian}-ket`;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={idIsian} className="text-isi font-semibold">{label}</label>
      <input
        id={idIsian}
        className={isian}
        aria-invalid={galat ? true : undefined}
        aria-describedby={galat || bantuan ? idKet : undefined}
        {...sisa}
      />
      {(galat || bantuan) && (
        <p id={idKet} className={`text-kecil ${galat ? teksPeringatan : "text-ungu-muda"}`}>{galat ?? bantuan}</p>
      )}
    </div>
  );
}

export function Pil({ children, nada = "ungu" }: { children: ReactNode; nada?: keyof typeof nadaPil }) {
  return <span className={`${pil} ${nadaPil[nada]}`}>{children}</span>;
}

export function KepalaHalaman({ judul, sub, kembali }: { judul: string; sub?: string; kembali?: string }) {
  return (
    <header className="flex flex-col gap-1 pt-6 pb-4">
      {kembali && (
        <Link to={kembali} className={`${tombolTeks} -ml-3 self-start`}>
          <span aria-hidden="true">‹</span> Kembali
        </Link>
      )}
      <h1 className="font-judul text-judul font-bold">{judul}</h1>
      {sub && <p className="text-isi text-ungu-muda">{sub}</p>}
    </header>
  );
}

function Putar() {
  return (
    <span
      aria-hidden="true"
      className="size-5 animate-spin rounded-full border-[3px] border-current border-r-transparent motion-reduce:animate-none"
    />
  );
}

export function Memuat({ teks = "Memuat…" }: { teks?: string }) {
  return (
    <div role="status" className="flex min-h-32 items-center justify-center gap-3 text-ungu-muda">
      <Putar />
      <span className="text-isi">{teks}</span>
    </div>
  );
}

/** Galat dari server: teks jagung tua + ikon, bukan merah. */
export function PesanGalat({ pesan, ulangi }: { pesan: string; ulangi?: () => void }) {
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-kartu border-2 border-jagung bg-jagung-muda p-4">
      <p className={`flex items-start gap-2 text-isi font-semibold ${teksPeringatan}`}>
        <span aria-hidden="true" className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-jagung text-kecil text-ungu">!</span>
        {pesan}
      </p>
      {ulangi && <Tombol varian="kedua" onClick={ulangi}>Coba lagi</Tombol>}
    </div>
  );
}
