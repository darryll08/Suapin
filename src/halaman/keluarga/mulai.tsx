// Pemilik: B (Satya). Daftar `/mulai` (B3.2, UI UX 10.2–10.3), gaya bento. Akun keluarga = email + kata sandi (min 8).
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Isian, KepalaHalaman, PesanGalat, Tombol } from "../../komponen/dasar.tsx";
import { bento, tombolSegmen, tombolTeks, wadahKeluarga, wadahSegmen } from "../../gaya/gaya.ts";
import { GalatApi } from "../../lib/panggil.ts";
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
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [terlihat, setTerlihat] = useState(false);

  const usia = lahir ? usiaBulan(lahir) : null;

  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    const g: Record<string, string> = {};
    if (!panggilan.trim()) g.panggilan = "Isi panggilan anak.";
    if (!lahir) g.lahir = "Isi tanggal lahir.";
    else if (new Date(lahir) > new Date()) g.lahir = "Tanggal lahir tidak boleh di masa depan.";
    if (!sapaan) g.sapaan = "Pilih siapa yang menyuapi.";
    if (!pengasuh.trim()) g.pengasuh = "Isi nama pengasuh.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) g.email = "Isi email yang aktif, contoh nama@gmail.com.";
    if (sandi.length < 8) g.sandi = "Kata sandi minimal 8 karakter.";
    setGalat(g);
    if (Object.keys(g).length || !sapaan) return;
    setMemuat(true);
    setGalatServer("");
    try {
      await api.buatAnak({ panggilan: panggilan.trim(), tanggal_lahir: lahir, sapaan, nama_pengasuh: pengasuh.trim(),
        email: email.trim(), kata_sandi: sandi });
      void pindah("/mulai/skrining", { replace: true });
    } catch (err) {
      setGalatServer(err instanceof GalatApi && err.status === 409 ? "Email ini sudah terdaftar. Masuk dengan email tersebut atau pakai email lain."
        : err instanceof Error ? err.message : String(err));
    } finally {
      setMemuat(false);
    }
  };

  return (
    <main className={wadahKeluarga}>
      <KepalaHalaman judul="Kenalan dulu" sub="Sekitar 1 menit. Data ini hanya untuk menyapa di aplikasi." kembali="/" />
      <form onSubmit={kirim} noValidate className="flex flex-col gap-4 pb-24">
        <section className={`${bento} flex flex-col gap-5`}>
          <h2 className="font-judul text-subjudul font-bold">Tentang anak</h2>
          <Isian label="Panggilan anak" bantuan="Nama yang biasa dipakai di rumah" value={panggilan} maxLength={40}
            onChange={(e) => setPanggilan(e.target.value)} galat={galat.panggilan} autoComplete="off" />
          <div className="flex flex-col gap-2">
            <Isian label="Tanggal lahir" type="date" value={lahir} max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setLahir(e.target.value)} galat={galat.lahir} />
            {usia !== null && (usia < 36 || usia > 71) && !galat.lahir && (
              <p className="flex items-start gap-2 rounded-kartu bg-ungu-tint p-3 text-kecil">
                <span aria-hidden="true" className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-ungu text-[12px] font-bold">i</span>
                Program dirancang untuk usia 3–5 tahun. Anda tetap bisa lanjut.
              </p>
            )}
          </div>
        </section>
        <section className={`${bento} flex flex-col gap-5`}>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-3 font-judul text-subjudul font-bold">Siapa yang menyuapi?</legend>
            <div className={`${wadahSegmen} grid-cols-4`}>
              {(Object.keys(NAMA_SAPAAN) as Sapaan[]).map((s) => (
                <button key={s} type="button" aria-pressed={sapaan === s} onClick={() => setSapaan(s)} className={tombolSegmen(sapaan === s)}>
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
        </section>
        <section className={`${bento} flex flex-col gap-5`}>
          <div className="flex flex-col gap-1">
            <h2 className="font-judul text-subjudul font-bold">Akun</h2>
            <p className="text-kecil text-ungu-muda">Untuk masuk lagi di HP lain dan menerima pengingat.</p>
          </div>
          <Isian label="Email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false}
            value={email} maxLength={120} onChange={(e) => setEmail(e.target.value)} galat={galat.email} />
          <div className="flex flex-col gap-1">
            <Isian label="Kata sandi" bantuan="Minimal 8 karakter" type={terlihat ? "text" : "password"} autoComplete="new-password"
              value={sandi} maxLength={72} onChange={(e) => setSandi(e.target.value)} galat={galat.sandi} />
            <button type="button" onClick={() => setTerlihat((t) => !t)} className={`${tombolTeks} -ml-3 self-start text-kecil`}>
              {terlihat ? "Sembunyikan" : "Tampilkan"} kata sandi
            </button>
          </div>
        </section>
        {galatServer && <PesanGalat pesan={galatServer} />}
        <div className="fixed inset-x-0 bottom-0 border-t border-garis/40 bg-latar/80 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md">
          <div className="mx-auto max-w-[560px]">
            <Tombol type="submit" memuat={memuat} className="sm:w-full">Lanjut ke skrining</Tombol>
          </div>
        </div>
      </form>
    </main>
  );
}
