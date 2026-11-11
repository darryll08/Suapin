// Pemilik: B (Satya). Beranda `/beranda` (B3.4, UI UX 10.6), tata letak bento (inspo 11 Nov):
// kartu hero tahap + Mulai makan → angka minggu ini + cincin makanan baru → grafik pil 7 hari dengan stiker.
import { Link, useSearchParams } from "react-router";
import { cariMakanan } from "../../../bersama/konten/makanan.ts";
import { CincinProgres, GrafikPil, KartuAngka, KartuHero } from "../../komponen/beranda.tsx";
import { Memuat, PesanGalat } from "../../komponen/dasar.tsx";
import { bento, tombolIkon } from "../../gaya/gaya.ts";
import { HARI_SEN_MIN, kalimatTahap, NAMA_SAPAAN, namaDenganSapaan, tanggalLokal, tanggalMingguIni, totalPerHari, useMuat } from "./bantu.ts";
import { api } from "./data.ts";
import { Halaman, useSaya } from "./tata-letak.tsx";

const tombolHero =
  "inline-flex min-h-14 w-full items-center justify-between gap-3 rounded-full bg-jagung pl-6 pr-2 font-judul text-tombol font-bold text-ungu " +
  "transition-transform duration-150 active:scale-[0.98] outline-none focus-visible:ring-4 focus-visible:ring-latar";

export function Beranda() {
  const { saya } = useSaya();
  const [param] = useSearchParams();
  const { data: lap, galat, memuat, ulangi } = useMuat(() => api.laporan(saya.child.id), [saya.child.id]);
  const c = saya.child;
  const sapaan = NAMA_SAPAAN[c.sapaan];

  return (
    <Halaman kanan={<Link to="/laporan" aria-label="Laporan" title="Laporan" className={tombolIkon}><IkonGrafik /></Link>}>
      <header className="pt-4 pb-5">
        <p className="truncate text-isi text-ungu-muda">Halo {namaDenganSapaan(sapaan, c.nama_pengasuh)},</p>
        <h1 className="font-judul text-judul font-bold">Siap makan bareng {c.panggilan}?</h1>
      </header>

      {param.get("baru") === "1" && saya.sesi_dibuka && (
        <p className="mb-4 rounded-bento bg-ungu-tint px-5 py-3 text-isi font-semibold">Program dimulai. Trial 5 hari.</p>
      )}

      {memuat && !lap ? <Memuat /> : galat ? <PesanGalat pesan={galat} ulangi={ulangi} /> : lap && (
        <div className="flex flex-col gap-4">
          <KartuHero tahap={lap.tahap} kalimat={kalimatTahap(lap.tahap, c.panggilan, sapaan)}>
            {saya.alasan_terkunci === "trial_habis" ? (
              <Link to="/langganan" className={tombolHero}>Lanjutkan program <Panah /></Link>
            ) : saya.alasan_terkunci === "tanda_bahaya" ? (
              <div className="rounded-kartu bg-jagung-muda p-4 text-ungu">
                <p className="font-judul text-subjudul font-bold text-jagung-tua">Sebaiknya periksa ke dokter dulu</p>
                <p className="text-isi">Setelah diperiksa, dokter bisa membuka program lewat link laporan.</p>
              </div>
            ) : (
              <Link to="/sesi" className={tombolHero}>Mulai makan <Panah /></Link>
            )}
          </KartuHero>

          {lap.sesi.length === 0 ? (
            <section className={bento}>
              <p className="text-isi">Sesi pertama hari ini? Siapkan makanan, lalu tekan Mulai makan.</p>
            </section>
          ) : (
            <Ringkas sesi={lap.sesi} stiker={lap.stiker_minggu_ini} paparan={lap.paparan} panggilan={c.panggilan} />
          )}

          <BarisPlan plan={c.plan} sisa={lap.trial_sisa_hari} terkunci={saya.alasan_terkunci === "trial_habis"} />
        </div>
      )}
    </Halaman>
  );
}

function Ringkas({ sesi, stiker, paparan, panggilan }: {
  sesi: { tanggal: string; diterima: number; ditolak: number }[];
  stiker: boolean[];
  paparan: { makanan: string; jumlah: number; target: number }[];
  panggilan: string;
}) {
  const minggu = totalPerHari(sesi, tanggalMingguIni());
  const hariIni = tanggalLokal(new Date());
  const totalMinggu = minggu.reduce((a, h) => a + h.diterima, 0);
  const p = paparan[0];
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <KartuAngka label="Suapan diterima" angka={totalMinggu} ket="minggu ini" />
        {p ? (
          <CincinProgres label={cariMakanan(p.makanan).nama} nilai={p.jumlah} target={p.target} />
        ) : (
          <KartuAngka label="Hari makan" angka={minggu.filter((h) => h.ada).length} satuan="/7" ket="minggu ini" />
        )}
      </div>
      <section className={`${bento} flex flex-col gap-3`}>
        <h2 className="font-judul text-subjudul font-bold">Minggu ini</h2>
        <GrafikPil judul={`Suapan ${panggilan} yang diterima per hari minggu ini`} tampilDitolak={false} tinggi={110}
          batang={minggu.map((h, i) => ({ label: HARI_SEN_MIN[i], diterima: h.diterima, ditolak: h.ditolak, ada: h.ada, sorot: h.tanggal === hariIni, stiker: stiker[i] }))} />
      </section>
    </>
  );
}

function BarisPlan({ plan, sisa, terkunci }: { plan: string; sisa: number | null; terkunci: boolean }) {
  if (plan === "klinik") return <p className="self-start rounded-full bg-ungu-tint px-4 py-2 text-kecil font-semibold">Program dari dokter</p>;
  if (plan !== "trial" || sisa === null || terkunci) return null;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="rounded-full bg-jagung-muda px-4 py-2 text-kecil font-semibold text-jagung-tua">
        {sisa <= 0 ? "Trial berakhir hari ini" : `Sisa trial ${sisa} hari`}
      </span>
      {sisa <= 1 && <Link to="/langganan" className="text-kecil font-semibold underline underline-offset-4">Lihat program 30 hari</Link>}
    </div>
  );
}

function Panah() {
  return (
    <span className="inline-flex size-10 items-center justify-center rounded-full bg-ungu text-latar" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M7 17L17 7M9 7h8v8" /></svg>
    </span>
  );
}

function IkonGrafik() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M6 20V12M12 20V5M18 20v-9" />
    </svg>
  );
}
