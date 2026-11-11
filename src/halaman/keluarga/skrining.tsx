// Pemilik: B (Satya). Skrining tanda bahaya `/mulai/skrining` (B3.3, UI UX 10.5). Tanpa merah, nada tenang.
import { useState } from "react";
import { useNavigate } from "react-router";
import { Kartu, KepalaHalaman, PesanGalat, Tombol } from "../../komponen/dasar.tsx";
import { wadahKeluarga } from "../../gaya/gaya.ts";
import { PERTANYAAN_SKRINING } from "./bantu.ts";
import { api } from "./data.ts";
import { useSaya } from "./tata-letak.tsx";

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
    <main className={wadahKeluarga}>
      <KepalaHalaman judul="Sebelum mulai" sub="Jawab 7 pertanyaan ini supaya program aman untuk anak." />
      <p className="mb-3 text-kecil font-semibold text-ungu-muda tabular-nums" aria-live="polite">{terjawab} dari 7 terjawab</p>
      <ol className="flex flex-col gap-3">
        {PERTANYAAN_SKRINING.map((q, i) => (
          <li key={q}>
            <Kartu as="div" className="flex flex-col gap-3 p-4">
              <p className="text-isi font-semibold">{q}</p>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={q}>
                {([false, true] as const).map((nilai) => (
                  <button key={String(nilai)} type="button" role="radio" aria-checked={jawaban[i] === nilai}
                    onClick={() => setJawaban((j) => j.map((x, k) => (k === i ? nilai : x)))}
                    className={`min-h-12 rounded-full border-2 text-isi font-semibold transition-colors ${jawaban[i] === nilai ? "border-ungu bg-ungu text-permukaan" : "border-garis bg-permukaan text-ungu"}`}>
                    {nilai ? "Ya" : "Tidak"}
                  </button>
                ))}
              </div>
            </Kartu>
          </li>
        ))}
      </ol>
      {galat && <div className="mt-4"><PesanGalat pesan={galat} /></div>}
      <Tombol className="mt-6 sm:w-full" disabled={terjawab < 7} memuat={memuat} onClick={simpan}>Simpan jawaban</Tombol>
      <p className="mt-3 text-kecil text-ungu-muda">Daftar ini draf dan sedang ditinjau dokter.</p>
    </main>
  );
}

function TandaBahaya() {
  const pindah = useNavigate();
  return (
    <main className={`${wadahKeluarga} pt-10`}>
      <div className="flex flex-col gap-4 rounded-kartu border-2 border-jagung bg-jagung-muda p-6">
        <span aria-hidden="true" className="inline-flex size-10 items-center justify-center rounded-full border-2 border-jagung-tua font-judul text-subjudul font-bold text-jagung-tua">i</span>
        <h1 className="font-judul text-judul font-bold text-jagung-tua">Sebaiknya periksa ke dokter dulu</h1>
        <p className="text-isi">Ada jawaban yang perlu dilihat dokter sebelum program makan dimulai.</p>
        <p className="text-isi">Setelah diperiksa, dokter bisa membuka program lewat link laporan dari aplikasi ini.</p>
      </div>
      <Tombol className="mt-6 sm:w-full" onClick={() => void pindah("/beranda")}>Ke beranda</Tombol>
    </main>
  );
}
