// Pemilik: B (Satya). Masuk dengan kode `/masuk` (B3.2, UI UX 10.4).
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Isian, KepalaHalaman, PesanGalat, Tombol } from "../../komponen/dasar.tsx";
import { bento, tombolTeks, wadahKeluarga } from "../../gaya/gaya.ts";
import { api } from "./data.ts";

export function Masuk() {
  const pindah = useNavigate();
  const [kode, setKode] = useState("");
  const [galat, setGalat] = useState("");
  const [memuat, setMemuat] = useState(false);

  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    const bersih = kode.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (bersih.length !== 12) { setGalat("Kode akses terdiri dari 12 huruf dan angka."); return; }
    setMemuat(true);
    setGalat("");
    try {
      await api.masuk(bersih);
      void pindah("/beranda", { replace: true });
    } catch (err) {
      setGalat(err instanceof Error ? err.message : String(err));
    } finally {
      setMemuat(false);
    }
  };

  return (
    <main className={wadahKeluarga}>
      <KepalaHalaman judul="Masuk dengan kode" sub="12 huruf dan angka dari saat mendaftar." kembali="/" />
      <form onSubmit={kirim} noValidate className={`${bento} flex flex-col gap-5`}>
        <Isian label="Kode akses" value={kode} onChange={(e) => setKode(e.target.value.toUpperCase())}
          autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="K7QM 2XPA 9RHT"
          className="[&_input]:font-mono [&_input]:tracking-wider" />
        {galat && <PesanGalat pesan={galat} />}
        <Tombol type="submit" memuat={memuat} className="sm:w-full">Masuk</Tombol>
      </form>
      <Link to="/mulai" className={`${tombolTeks} mt-4 -ml-3`}>Belum punya kode? Mulai gratis</Link>
    </main>
  );
}
