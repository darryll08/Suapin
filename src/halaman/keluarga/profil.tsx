// Pemilik: B (Satya). Profil `/profil` (tab ketiga menu bawah, 13 Nov): anak + program, notifikasi, akun (Keluar).
// Notifikasi dipindah dari lonceng kanan atas Beranda ke sini, mengikuti pola Talkly.
import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { KepalaHalaman, Tombol } from "../../komponen/dasar.tsx";
import { BagianNotifikasi } from "../../komponen/lonceng.tsx";
import { bento, wadahKeluarga } from "../../gaya/gaya.ts";
import { panggil } from "../../lib/panggil.ts";
import { formatTanggal, formatUsia, NAMA_SAPAAN, namaDenganSapaan } from "./bantu.ts";
import { useSaya } from "./tata-letak.tsx";

const NAMA_PLAN = { trial: "Trial 5 hari", expired: "Trial selesai", program: "Program 30 Hari", lanjutan: "Program lanjutan", klinik: "Program dari dokter" } as const;

export function Profil() {
  const { saya } = useSaya();
  const c = saya.child;
  const pindah = useNavigate();
  const [keluar, setKeluar] = useState(false);

  const sampai = c.plan === "trial" ? c.trial_until : saya.paket_sampai;
  const ketPlan = sampai && c.plan !== "klinik" ? `${c.plan === "trial" ? "Berakhir" : "Aktif sampai"} ${formatTanggal(sampai)}` : null;

  const keluarDariHp = async () => {
    setKeluar(true);
    try { await panggil("keluar"); void pindah("/masuk", { replace: true }); }
    finally { setKeluar(false); }
  };

  return (
    <main className={`${wadahKeluarga} flex flex-col gap-4`}>
      <KepalaHalaman judul="Profil" />

      <Seksi judul={c.panggilan}>
        <Baris label="Usia" isi={formatUsia(c.usia_bulan)} />
        <Baris label="Pengasuh" isi={namaDenganSapaan(NAMA_SAPAAN[c.sapaan], c.nama_pengasuh)} />
        <Baris label="Tahap" isi={`Tahap ${c.stage} dari 4`} />
      </Seksi>

      <Seksi judul="Program">
        <Link to="/langganan" className="-mx-3 flex min-h-14 items-center justify-between gap-3 rounded-kartu px-3 outline-none hover:bg-ungu-tint focus-visible:ring-4 focus-visible:ring-jagung">
          <span className="flex flex-col">
            <span className="font-semibold">{NAMA_PLAN[c.plan]}</span>
            {ketPlan && <span className="text-kecil text-ungu-muda">{ketPlan}</span>}
          </span>
          <span aria-hidden="true" className="text-subjudul text-ungu-muda">›</span>
        </Link>
      </Seksi>

      <Seksi judul="Notifikasi">
        <BagianNotifikasi />
      </Seksi>

      <Seksi judul="Akun">
        {c.email && <Baris label="Email" isi={c.email} />}
        <Tombol varian="kedua" memuat={keluar} onClick={() => void keluarDariHp()} className="mt-2 sm:w-full">Keluar dari HP ini</Tombol>
      </Seksi>
    </main>
  );
}

function Seksi({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <section className={`${bento} flex flex-col gap-2`}>
      <h2 className="font-judul text-subjudul font-bold">{judul}</h2>
      {children}
    </section>
  );
}

function Baris({ label, isi }: { label: string; isi: string }) {
  return (
    <p className="flex items-baseline justify-between gap-4 border-b border-garis/40 py-2 last:border-0">
      <span className="text-ungu-muda">{label}</span>
      <span className="min-w-0 truncate text-right font-semibold">{isi}</span>
    </p>
  );
}
