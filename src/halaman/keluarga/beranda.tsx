// Pemilik: B (Satya). Beranda `/beranda` (B3.4, UI UX 10.6).
import { Link, useSearchParams } from "react-router";
import { cariMakanan } from "../../../bersama/konten/makanan.ts";
import { JalurPaparan, KartuTahap, StikerMinggu } from "../../komponen/beranda.tsx";
import { Kartu, Memuat, PesanGalat } from "../../komponen/dasar.tsx";
import { tombolTeks, tombolUtama } from "../../gaya/gaya.ts";
import { kalimatTahap, NAMA_SAPAAN, useMuat } from "./bantu.ts";
import { api } from "./data.ts";
import { Halaman, useSaya } from "./tata-letak.tsx";

export function Beranda() {
  const { saya } = useSaya();
  const [param] = useSearchParams();
  const { data: lap, galat, memuat, ulangi } = useMuat(() => api.laporan(saya.child.id), [saya.child.id]);
  const c = saya.child;
  const sapaan = NAMA_SAPAAN[c.sapaan];

  return (
    <Halaman kanan={<Link to="/laporan" className={tombolTeks}>Laporan →</Link>}>
      <h1 className="pt-4 pb-5 font-judul text-judul font-bold">
        <span className="block truncate">Halo {sapaan} {c.nama_pengasuh},</span>
        siap makan bareng {c.panggilan}?
      </h1>

      {param.get("baru") === "1" && saya.sesi_dibuka && (
        <Kartu className="mb-4 bg-ungu-tint"><p className="text-isi font-semibold">Program dimulai. Trial 5 hari.</p></Kartu>
      )}

      {memuat && !lap ? <Memuat /> : galat ? <PesanGalat pesan={galat} ulangi={ulangi} /> : lap && (
        <div className="flex flex-col gap-5">
          <KartuTahap tahap={lap.tahap} kalimat={kalimatTahap(lap.tahap, c.panggilan, sapaan)} />
          {lap.sesi.length === 0 ? (
            <Kartu><p className="text-isi">Sesi pertama hari ini? Siapkan makanan, lalu tekan Mulai makan.</p></Kartu>
          ) : (
            <>
              <StikerMinggu terisi={lap.stiker_minggu_ini} />
              {lap.paparan.map((p) => <JalurPaparan key={p.makanan} nama={cariMakanan(p.makanan).nama} jumlah={p.jumlah} target={p.target} />)}
            </>
          )}
          {c.plan === "trial" && lap.trial_sisa_hari !== null && saya.alasan_terkunci !== "trial_habis" && (
            <p className="text-isi text-ungu-muda">{lap.trial_sisa_hari <= 0 ? "Trial berakhir hari ini" : `Sisa trial ${lap.trial_sisa_hari} hari`}</p>
          )}
          {c.plan === "trial" && lap.trial_sisa_hari === 1 && lap.sesi.length > 0 && (
            <Kartu className="flex flex-col gap-2">
              <p className="text-isi">{c.panggilan} menerima {rataDiterima(lap.sesi)} suapan per sesi. Trial sisa 1 hari.</p>
              <Link to="/langganan" className={`${tombolTeks} -ml-3 self-start`}>Lihat program 30 hari</Link>
            </Kartu>
          )}
          {c.plan === "klinik" && <p className="text-isi text-ungu-muda">Program dari dokter</p>}

          {saya.alasan_terkunci === "trial_habis" ? (
            <Link to="/langganan" className={tombolUtama}>Lanjutkan program</Link>
          ) : saya.alasan_terkunci === "tanda_bahaya" ? (
            <div className="flex flex-col gap-2 rounded-kartu border-2 border-jagung bg-jagung-muda p-5">
              <p className="font-judul text-subjudul font-bold text-jagung-tua">Sebaiknya periksa ke dokter dulu</p>
              <p className="text-isi">Setelah diperiksa, dokter bisa membuka program lewat link laporan. Bagikan laporan dari halaman Laporan.</p>
            </div>
          ) : (
            <Link to="/sesi" className={tombolUtama}>Mulai makan</Link>
          )}
        </div>
      )}
    </Halaman>
  );
}

function rataDiterima(sesi: { diterima: number }[]): string {
  const r = sesi.reduce((s, x) => s + x.diterima, 0) / Math.max(1, sesi.length);
  return r.toFixed(1).replace(".", ",").replace(",0", "");
}
