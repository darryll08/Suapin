// Pemilik: B (Satya). Skrining tanda bahaya `/mulai/skrining` (B3.3, UI UX 10.5), gaya bento.
// Tanpa merah, nada tenang. Tidak di kiri supaya jawaban paling umum mudah dijangkau.
import { useState } from "react";
import { useNavigate } from "react-router";
import { KepalaHalaman, PesanGalat, Tombol } from "../../komponen/dasar.tsx";
import { bento, tombolSegmen, wadahKeluarga, wadahSegmen } from "../../gaya/gaya.ts";
import { PERTANYAAN_SKRINING } from "./bantu.ts";
import { api } from "./data.ts";
import { Logo, useSaya } from "./tata-letak.tsx";

export function Skrining() {
  const { saya, muatUlang } = useSaya();
  const pindah = useNavigate();
  const [jawaban, setJawaban] = useState<(boolean | null)[]>(PERTANYAAN_SKRINING.map(() => null));
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState("");
  const [bahaya, setBahaya] = useState(saya.alasan_terkunci === "tanda_bahaya");
  const terjawab = jawaban.filter((j) => j !== null).length;

  const simpan = async () => {
    setMemuat(true);
    setGalat("");
    try {
      const r = await api.skrining(jawaban.map(Boolean));
      if (r.ada_tanda_bahaya) { setBahaya(true); muatUlang(); }
      else { muatUlang(); void pindah("/beranda?baru=1", { replace: true }); }
    } catch (e) {
      setGalat(e instanceof Error ? e.message : String(e));
    } finally {
      setMemuat(false);
    }
  };

  if (bahaya) return <TandaBahaya />;

  return (
    <main className={`${wadahKeluarga} pb-28`}>
      <div className="pt-3"><Logo /></div>
      <KepalaHalaman judul="Sebelum mulai" sub="Jawab 7 pertanyaan ini supaya program aman untuk anak." />

      <section className={`${bento} mb-4 flex flex-col gap-3`}>
        <p className="text-isi font-semibold tabular-nums" aria-live="polite">{terjawab} dari 7 terjawab</p>
        <div className="flex gap-1.5" aria-hidden="true">
          {jawaban.map((j, i) => <span key={i} className={`h-2 flex-1 rounded-full ${j === null ? "bg-ungu-tint" : "bg-ungu"}`} />)}
        </div>
      </section>

      <ol className="flex flex-col gap-3">
        {PERTANYAAN_SKRINING.map((q, i) => (
          <li key={q} className={`${bento} flex flex-col gap-4`}>
            <div className="flex items-start gap-3">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-ungu-tint text-kecil font-bold tabular-nums">{i + 1}</span>
              <p className="pt-1 text-isi font-semibold">{q}</p>
            </div>
            <div className={`${wadahSegmen} grid-cols-2`} role="radiogroup" aria-label={q}>
              {([false, true] as const).map((nilai) => (
                <button key={String(nilai)} type="button" role="radio" aria-checked={jawaban[i] === nilai}
                  onClick={() => setJawaban((j) => j.map((x, k) => (k === i ? nilai : x)))}
                  className={tombolSegmen(jawaban[i] === nilai)}>
                  {nilai ? "Ya" : "Tidak"}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-kecil text-ungu-muda">Daftar ini draf dan sedang ditinjau dokter.</p>
      {galat && <div className="mt-4"><PesanGalat pesan={galat} /></div>}

      <div className="fixed inset-x-0 bottom-0 border-t border-garis/40 bg-latar/80 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md">
        <div className="mx-auto max-w-[560px]">
          <Tombol className="sm:w-full" disabled={terjawab < 7} memuat={memuat} onClick={simpan}>Simpan jawaban</Tombol>
        </div>
      </div>
    </main>
  );
}

function TandaBahaya() {
  const pindah = useNavigate();
  return (
    <main className={`${wadahKeluarga} flex flex-col gap-4 pt-10`}>
      <section className="flex flex-col gap-4 rounded-bento bg-jagung-muda p-6">
        <span aria-hidden="true" className="inline-flex size-12 items-center justify-center rounded-full bg-permukaan font-judul text-subjudul font-bold text-jagung-tua">i</span>
        <h1 className="font-judul text-judul font-bold text-jagung-tua">Sebaiknya periksa ke dokter dulu</h1>
        <p className="text-isi">Ada jawaban yang perlu dilihat dokter sebelum program makan dimulai.</p>
      </section>
      <section className={`${bento} flex flex-col gap-2`}>
        <h2 className="font-judul text-isi font-bold">Langkah berikutnya</h2>
        <p className="text-isi">Setelah diperiksa, dokter bisa membuka program lewat link laporan dari aplikasi ini.</p>
      </section>
      <Tombol className="sm:w-full" onClick={() => void pindah("/beranda")}>Ke beranda</Tombol>
    </main>
  );
}
