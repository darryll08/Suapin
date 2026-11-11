// Pemilik: B (Satya). Paywall mock `/langganan` (B3.6, UI UX 10.12). Tanpa hitung mundur atau harga coret.
import { useState } from "react";
import { useNavigate } from "react-router";
import { Kartu, KepalaHalaman, PesanGalat, Pil, Tombol } from "../../komponen/dasar.tsx";
import { wadahKeluarga } from "../../gaya/gaya.ts";
import { api } from "./data.ts";
import { useSaya } from "./tata-letak.tsx";

const ISI = ["Sesi makan setiap hari", "Naik tahap otomatis sampai lepas layar", "Ringkasan mingguan", "Bagikan laporan ke dokter"];

export function Langganan() {
  const { saya, muatUlang } = useSaya();
  const pindah = useNavigate();
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState("");

  const aktifkan = async () => {
    setMemuat(true); setGalat("");
    try {
      await api.aktifkan("program_30");
      muatUlang();
      void pindah("/beranda", { replace: true });
    } catch (e) {
      setGalat(e instanceof Error ? e.message : String(e));
    } finally {
      setMemuat(false);
    }
  };

  return (
    <main className={wadahKeluarga}>
      {saya.alasan_terkunci === "trial_habis" && (
        <p className="pt-6 text-isi text-ungu-muda">Trial 5 hari sudah selesai. Data {saya.child.panggilan} tetap aman.</p>
      )}
      <KepalaHalaman judul="Program 30 Hari" kembali="/beranda" />
      <Kartu className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-judul text-tampilan font-bold tabular-nums">Rp 49.000</span>
          <span className="text-isi text-ungu-muda">sekali bayar</span>
          <Pil nada="jagung">Harga uji coba</Pil>
        </div>
        <ul className="flex flex-col gap-2">
          {ISI.map((x) => (
            <li key={x} className="flex items-start gap-3 text-isi">
              <span aria-hidden="true" className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-ungu text-[12px] text-permukaan">✓</span>
              {x}
            </li>
          ))}
        </ul>
      </Kartu>
      {galat && <div className="mt-4"><PesanGalat pesan={galat} /></div>}
      {saya.child.plan === "program" ? (
        <p className="mt-6 text-isi font-semibold">Program sudah aktif.</p>
      ) : (
        <>
          <Tombol className="mt-6 sm:w-full" memuat={memuat} onClick={aktifkan}>Aktifkan program</Tombol>
          <p className="mt-2 text-kecil text-ungu-muda">Mode demo lomba: tanpa pembayaran.</p>
        </>
      )}
    </main>
  );
}
