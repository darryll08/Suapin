// Pemilik: B (Satya). Catatan setelah makan `/sesi/catatan` (B2.4, UI UX 10.10), gaya bento.
// Stiker karena mau mencoba, bukan karena habis: tidak ada pujian untuk porsi.
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { cariMakanan, STIKER } from "../../../../bersama/konten/makanan.ts";
import { CincinProgres, KartuAngka, KartuHero } from "../../../komponen/beranda.tsx";
import { PesanGalat, Tombol } from "../../../komponen/dasar.tsx";
import { bento, tombolSegmen, tombolTeks, wadahKeluarga, wadahSegmen } from "../../../gaya/gaya.ts";
import { putarKlip } from "../../../suara/pemutar.ts";
import { kalimatTahap, NAMA_SAPAAN } from "../bantu.ts";
import { api, type HasilSimpanSesi } from "../data.ts";
import { useSaya } from "../tata-letak.tsx";

type Info = HasilSimpanSesi & { diterima: number; menit: number };
type Porsi = "sedikit" | "setengah" | "habis";
type Mood = "senang" | "biasa" | "rewel";

export function Catatan() {
  const { saya, muatUlang } = useSaya();
  const pindah = useNavigate();
  const [param] = useSearchParams();
  const info = (useLocation().state ?? null) as Info | null;
  const [idSesi, setIdSesi] = useState(param.get("id"));
  const catatSaja = param.get("catat") === "1";
  const [porsi, setPorsi] = useState<Porsi | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState("");
  const sapaan = NAMA_SAPAAN[saya.child.sapaan];
  const sekali = useRef(false);

  useEffect(() => {
    if (sekali.current || catatSaja) return;
    sekali.current = true;
    putarKlip("penutup");
  }, [catatSaja]);

  const simpan = async () => {
    setMemuat(true); setGalat("");
    try {
      let id = idSesi;
      if (!id && catatSaja) {
        // Tahap 4: pengasuh memimpin; sesi dicatat tanpa suapan dari kamera.
        const kini = new Date().toISOString();
        const r = await api.simpanSesi({
          child_id: saya.child.id, menu: "umum", makanan_baru: false, mulai: kini, selesai: kini,
          durasi_detik: 0, tahap: saya.child.stage, alasan_selesai: "stop", gigitan: [],
        });
        id = r.session_id;
        setIdSesi(id);
      }
      if (id && (porsi || mood)) await api.catatan(id, { ...(porsi && { porsi }), ...(mood && { mood }) });
      muatUlang();
      void pindah("/beranda", { replace: true });
    } catch (e) {
      setGalat(e instanceof Error ? e.message : String(e));
    } finally {
      setMemuat(false);
    }
  };

  const stiker = STIKER[(new Date().getDay() + 6) % STIKER.length];

  return (
    <main className={`${wadahKeluarga} flex flex-col gap-4 pt-6`}>
      <section className="flex flex-col items-center gap-3 rounded-bento bg-jagung-muda px-6 pt-6 pb-7 text-center">
        {!catatSaja && <img src={stiker} alt="Stiker hari ini" className="pop-sekali size-36" />}
        <h1 className="font-judul text-judul font-bold">{catatSaja ? "Catat hasil makan" : "Terima kasih sudah makan bareng!"}</h1>
      </section>

      {info && (
        <div className="grid grid-cols-2 gap-4">
          <KartuAngka label="Suapan diterima" angka={info.diterima} ket="sesi ini" />
          <KartuAngka label="Lama makan" angka={info.menit} satuan="mnt" />
        </div>
      )}

      {info?.naik_tahap && (
        <KartuHero tahap={info.tahap_baru} kalimat={`Naik tahap! ${kalimatTahap(info.tahap_baru, saya.child.panggilan, sapaan)}`} />
      )}
      {info?.saran_turun_tahap && (
        <section className="flex flex-col gap-1 rounded-bento bg-jagung-muda p-5">
          <p className="text-isi">3 sesi terakhir belum ada suapan diterima. Kembali ke tahap {Math.max(1, info.tahap_baru - 1)} bisa membantu.</p>
          <p className="text-kecil text-jagung-tua">Diskusikan dengan dokter bila berlanjut.</p>
        </section>
      )}
      {info?.paparan && (
        <CincinProgres label={`${cariMakanan(info.paparan.makanan).nama} dicoba`} nilai={info.paparan.jumlah} target={10} />
      )}

      <section className={`${bento} flex flex-col gap-5`}>
        <PilihanPil judul="Berapa yang dimakan?" nilai={porsi} ubah={setPorsi}
          opsi={[["sedikit", "Sedikit"], ["setengah", "Setengah"], ["habis", "Habis"]]} />
        <PilihanPil judul="Suasana makan?" nilai={mood} ubah={setMood}
          opsi={[["senang", "Senang"], ["biasa", "Biasa"], ["rewel", "Rewel"]]} />
        <p className="text-kecil text-ungu-muda">Boleh dilewati.</p>
      </section>

      {galat && <PesanGalat pesan={galat} />}
      <Tombol memuat={memuat} onClick={simpan} className="sm:w-full">Simpan catatan</Tombol>
      {!catatSaja && <Link to="/beranda" onClick={muatUlang} className={`${tombolTeks} self-center`}>Lewati</Link>}
    </main>
  );
}

function PilihanPil<T extends string>({ judul, nilai, ubah, opsi }: { judul: string; nilai: T | null; ubah: (v: T) => void; opsi: [T, string][] }) {
  return (
    <fieldset>
      <legend className="mb-2 text-isi font-semibold">{judul}</legend>
      <div className={`${wadahSegmen} grid-cols-3`}>
        {opsi.map(([v, label]) => (
          <button key={v} type="button" aria-pressed={nilai === v} onClick={() => ubah(v)} className={tombolSegmen(nilai === v)}>
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
