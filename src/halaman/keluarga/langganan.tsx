// Pemilik: B (Satya). Paywall mock `/langganan` (B3.6, UI UX 10.12), gaya bento. Tanpa hitung mundur atau harga coret.
import { useState } from "react";
import { useNavigate } from "react-router";
import { KepalaHalaman, PesanGalat } from "../../komponen/dasar.tsx";
import { bento, tombolHero, wadahKeluarga } from "../../gaya/gaya.ts";
import { api } from "./data.ts";
import { useSaya } from "./tata-letak.tsx";

const ISI = ["Sesi makan setiap hari", "Naik tahap otomatis sampai lepas layar", "Ringkasan mingguan", "Bagikan laporan ke dokter"];

export function Langganan() {
  const { saya, muatUlang } = useSaya();
  const pindah = useNavigate();
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState("");
  const aktif = saya.child.plan === "program";

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
    <main className={`${wadahKeluarga} flex flex-col gap-4`}>
      <KepalaHalaman judul="Program 30 Hari" kembali="/beranda"
        sub={saya.alasan_terkunci === "trial_habis" ? `Trial 5 hari sudah selesai. Data ${saya.child.panggilan} tetap aman.` : undefined} />

      <section className="flex flex-col gap-5 rounded-bento bg-ungu p-6 text-latar shadow-kartu">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-kecil font-semibold text-latar/80">Sekali bayar</p>
          <span className="rounded-full bg-jagung-muda px-3 py-1 text-kecil font-semibold text-jagung-tua">Harga uji coba</span>
        </div>
        <p className="font-judul text-[44px] leading-[52px] font-bold tabular-nums">Rp 49.000</p>
        {aktif ? (
          <p className="rounded-full bg-latar/15 px-5 py-3 text-isi font-semibold">Program sudah aktif.</p>
        ) : (
          <div className="flex flex-col gap-2">
            <button type="button" className={tombolHero} disabled={memuat} aria-busy={memuat || undefined} onClick={aktifkan}>
              {memuat ? "Mengaktifkan…" : "Aktifkan program"}
            </button>
            <p className="text-kecil text-latar/80">Mode demo lomba: tanpa pembayaran.</p>
          </div>
        )}
      </section>

      <section className={`${bento} flex flex-col gap-3`}>
        <h2 className="font-judul text-subjudul font-bold">Isi program</h2>
        <ul className="flex flex-col gap-3">
          {ISI.map((x) => (
            <li key={x} className="flex items-center gap-3 text-isi">
              <span aria-hidden="true" className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-ungu-tint text-kecil font-bold">✓</span>
              {x}
            </li>
          ))}
        </ul>
      </section>
      {galat && <PesanGalat pesan={galat} />}
    </main>
  );
}
