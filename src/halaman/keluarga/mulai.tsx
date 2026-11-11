// Pemilik: B (Satya). Daftar `/mulai` + tampilan kode akses sekali (B3.2, UI UX 10.2–10.3).
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Isian, KepalaHalaman, PesanGalat, Tombol } from "../../komponen/dasar.tsx";
import { kartu, tombolUtama, wadahKeluarga } from "../../gaya/gaya.ts";
import { NAMA_SAPAAN } from "./bantu.ts";
import { api, usiaBulan } from "./data.ts";

type Sapaan = keyof typeof NAMA_SAPAAN;

export function Mulai() {
  const pindah = useNavigate();
  const [panggilan, setPanggilan] = useState("");
  const [lahir, setLahir] = useState("");
  const [sapaan, setSapaan] = useState<Sapaan | "">("");
  const [pengasuh, setPengasuh] = useState("");
  const [galat, setGalat] = useState<Record<string, string>>({});
  const [galatServer, setGalatServer] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [kode, setKode] = useState("");

  const usia = lahir ? usiaBulan(lahir) : null;

  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    const g: Record<string, string> = {};
    if (!panggilan.trim()) g.panggilan = "Isi panggilan anak.";
    if (!lahir) g.lahir = "Isi tanggal lahir.";
    else if (new Date(lahir) > new Date()) g.lahir = "Tanggal lahir tidak boleh di masa depan.";
    if (!sapaan) g.sapaan = "Pilih siapa yang menyuapi.";
    if (!pengasuh.trim()) g.pengasuh = "Isi nama pengasuh.";
    setGalat(g);
    if (Object.keys(g).length || !sapaan) return;
    setMemuat(true);
    setGalatServer("");
    try {
      const r = await api.buatAnak({ panggilan: panggilan.trim(), tanggal_lahir: lahir, sapaan, nama_pengasuh: pengasuh.trim() });
      setKode(r.kode_akses);
    } catch (err) {
      setGalatServer(err instanceof Error ? err.message : String(err));
    } finally {
      setMemuat(false);
    }
  };

  if (kode) return <KodeAkses kode={kode} lanjut={() => void pindah("/mulai/skrining", { replace: true })} />;

  return (
    <main className={wadahKeluarga}>
      <KepalaHalaman judul="Kenalan dulu" sub="Sekitar 1 menit. Data ini hanya untuk menyapa di aplikasi." kembali="/" />
      <form onSubmit={kirim} noValidate className="flex flex-col gap-5 pb-24">
        <Isian label="Panggilan anak" bantuan="Nama yang biasa dipakai di rumah" value={panggilan} maxLength={40}
          onChange={(e) => setPanggilan(e.target.value)} galat={galat.panggilan} autoComplete="off" />
        <div className="flex flex-col gap-2">
          <Isian label="Tanggal lahir" type="date" value={lahir} max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setLahir(e.target.value)} galat={galat.lahir} />
          {usia !== null && (usia < 36 || usia > 71) && !galat.lahir && (
            <p className="flex items-start gap-2 text-kecil text-ungu-muda">
              <span aria-hidden="true" className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-ungu-muda text-[12px] font-bold">i</span>
              Program dirancang untuk usia 3–5 tahun. Anda tetap bisa lanjut.
            </p>
          )}
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-isi font-semibold">Siapa yang menyuapi?</legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(NAMA_SAPAAN) as Sapaan[]).map((s) => (
              <button key={s} type="button" aria-pressed={sapaan === s} onClick={() => setSapaan(s)}
                className={`min-h-12 rounded-full border-2 px-5 text-isi font-semibold transition-colors ${sapaan === s ? "border-ungu bg-ungu text-permukaan" : "border-garis bg-permukaan text-ungu"}`}>
                {NAMA_SAPAAN[s]}
              </button>
            ))}
          </div>
          {galat.sapaan && <p className="text-kecil text-jagung-tua">{galat.sapaan}</p>}
          {sapaan && sapaan !== "mbak" && (
            <p className="text-kecil text-ungu-muda">Suara karakter untuk sapaan ini menyusul. Sementara memakai sapaan Mbak.</p>
          )}
        </fieldset>
        <Isian label="Nama pengasuh" value={pengasuh} maxLength={40} onChange={(e) => setPengasuh(e.target.value)}
          galat={galat.pengasuh} autoComplete="off" />
        {galatServer && <PesanGalat pesan={galatServer} />}
        <div className="fixed inset-x-0 bottom-0 bg-latar/95 px-4 py-3 shadow-lembar">
          <div className="mx-auto max-w-[560px]">
            <Tombol type="submit" memuat={memuat} className="sm:w-full">Lanjut ke skrining</Tombol>
          </div>
        </div>
      </form>
    </main>
  );
}

function KodeAkses({ kode, lanjut }: { kode: string; lanjut: () => void }) {
  const [tersalin, setTersalin] = useState(false);
  const [disimpan, setDisimpan] = useState(false);
  const tampil = kode.match(/.{1,4}/g)?.join(" ") ?? kode;
  const salin = async () => {
    try { await navigator.clipboard.writeText(kode); } catch { /* tetap tampil */ }
    setTersalin(true);
    setTimeout(() => setTersalin(false), 2000);
  };
  return (
    <main className={wadahKeluarga}>
      <KepalaHalaman judul="Simpan kode ini" />
      <div className={`${kartu} flex flex-col items-center gap-4`}>
        <p className="font-mono text-tampilan font-bold tracking-wider break-all text-center" aria-label={`Kode akses ${kode.split("").join(" ")}`}>{tampil}</p>
        <Tombol varian="kedua" onClick={salin}>{tersalin ? "✓ Tersalin" : "Salin kode"}</Tombol>
      </div>
      <p className="mt-4 text-isi">Pakai kode ini untuk membuka Suapin di HP lain.</p>
      <p className="text-kecil text-ungu-muda">Kode hanya tampil sekali.</p>
      <label className="mt-6 flex min-h-12 items-center gap-3 text-isi font-semibold">
        <input type="checkbox" className="size-6 accent-ungu" checked={disimpan} onChange={(e) => setDisimpan(e.target.checked)} />
        Sudah saya simpan
      </label>
      <button type="button" className={`${tombolUtama} mt-4 sm:w-full`} disabled={!disimpan} onClick={lanjut}>Lanjut ke skrining</button>
    </main>
  );
}
