// Pemilik: B (Satya). Katalog komponen untuk cek visual (B0.3). Rute: /contoh-gaya.
import { useState } from "react";
import { wadahKeluarga } from "../../gaya/gaya.ts";
import { Isian, Kartu, KepalaHalaman, Memuat, PesanGalat, Pil, Tombol } from "../../komponen/dasar.tsx";
import { LembarTanya, StripTeks } from "../../komponen/strip-teks.tsx";

export function ContohGaya() {
  const [tanya, setTanya] = useState(false);
  const [strip, setStrip] = useState(0);

  return (
    <main className={wadahKeluarga}>
      <KepalaHalaman judul="Contoh Gaya" sub="Semua komponen dasar Suapin." kembali="/" />
      <div className="flex flex-col gap-4">
        <Kartu>
          <h2 className="mb-3 font-judul text-subjudul font-bold">Tombol</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Tombol>Mulai Sesi</Tombol>
            <Tombol varian="kedua">Lihat Laporan</Tombol>
            <Tombol varian="teks">Lewati</Tombol>
            <Tombol memuat>Menyimpan</Tombol>
            <Tombol disabled>Nonaktif</Tombol>
          </div>
        </Kartu>
        <Kartu>
          <h2 className="mb-3 font-judul text-subjudul font-bold">Isian dan Pil</h2>
          <div className="flex flex-col gap-4">
            <Isian label="Nama panggilan anak" placeholder="Dika" bantuan="Dipakai karakter untuk menyapa." />
            <Isian label="Umur (tahun)" inputMode="numeric" galat="Umur harus 3 sampai 5 tahun." defaultValue="7" />
            <div className="flex flex-wrap gap-2">
              <Pil>Tahap 1</Pil>
              <Pil nada="jagung">Trial sisa 3 hari</Pil>
              <Pil nada="netral">Brokoli 4/10</Pil>
            </div>
          </div>
        </Kartu>
        <Kartu>
          <h2 className="mb-3 font-judul text-subjudul font-bold">Keadaan</h2>
          <Memuat />
          <PesanGalat pesan="Server belum bisa dihubungi." ulangi={() => {}} />
        </Kartu>
        <Kartu>
          <h2 className="mb-3 font-judul text-subjudul font-bold">Strip dan Lembar Sesi</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Tombol varian="kedua" onClick={() => setStrip((n) => n + 1)}>Tampilkan strip</Tombol>
            <Tombol varian="kedua" onClick={() => setTanya(true)}>Tampilkan lembar tanya</Tombol>
          </div>
        </Kartu>
      </div>
      {strip > 0 && <StripTeks teks="Tunggu sebentar, biarkan Dika mengunyah." kunci={strip} />}
      {tanya && <LembarTanya pertanyaan="Suapan tadi diterima?" jawab={() => setTanya(false)} />}
    </main>
  );
}
