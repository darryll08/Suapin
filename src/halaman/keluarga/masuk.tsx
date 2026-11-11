// Pemilik: B (Satya). Halaman masuk gabungan `/masuk`: pilihan Keluarga (kode akses) atau Klinik (email + kata sandi).
// Login klinik memakai endpoint yang sama dengan /klinik/masuk milik C (`dokterMasuk` lewat panggil()).
// `?sebagai=klinik` membuka tab klinik; `?kembali=/r/<token>` dipertahankan untuk dokter dari link laporan.
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Isian, PesanGalat, Tombol } from "../../komponen/dasar.tsx";
import { bento, tombolSegmen, tombolTeks, wadahKeluarga, wadahSegmen } from "../../gaya/gaya.ts";
import { GalatApi, panggil } from "../../lib/panggil.ts";
import { api } from "./data.ts";
import { Logo } from "./tata-letak.tsx";

type Peran = "keluarga" | "klinik";

export function Masuk() {
  const [param, setParam] = useSearchParams();
  const peran: Peran = param.get("sebagai") === "klinik" ? "klinik" : "keluarga";
  const ganti = (p: Peran) => {
    const baru = new URLSearchParams(param);
    if (p === "klinik") baru.set("sebagai", "klinik"); else baru.delete("sebagai");
    setParam(baru, { replace: true });
  };

  return (
    <main className={`${wadahKeluarga} flex min-h-dvh flex-col`}>
      <div className="pt-3"><Logo ke="/" /></div>
      <div className="flex flex-1 flex-col gap-6 pt-10 pb-8 sm:pt-16">
        <header className="flex flex-col gap-1">
          <h1 className="font-judul text-judul font-bold">Masuk ke Suapin</h1>
          <p className="text-isi text-ungu-muda">Pilih siapa yang masuk.</p>
        </header>

        <div className={`${wadahSegmen} grid-cols-2`} role="tablist" aria-label="Masuk sebagai">
          {(["keluarga", "klinik"] as const).map((p) => (
            <button key={p} type="button" role="tab" aria-selected={peran === p} onClick={() => ganti(p)} className={tombolSegmen(peran === p)}>
              {p === "keluarga" ? "Keluarga" : "Klinik"}
            </button>
          ))}
        </div>

        <section key={peran} className={`${bento} masuk flex flex-col gap-5`} role="tabpanel">
          {peran === "keluarga" ? <FormKeluarga /> : <FormKlinik kembali={param.get("kembali") ?? ""} />}
        </section>

        {peran === "keluarga" ? (
          <Link to="/mulai" className={`${tombolTeks} -ml-3 self-start`}>Belum punya kode? Mulai gratis</Link>
        ) : (
          <p className="text-kecil text-ungu-muda">Akun demo lomba.</p>
        )}
      </div>
    </main>
  );
}

function FormKeluarga() {
  const pindah = useNavigate();
  const [kode, setKode] = useState("");
  const [galat, setGalat] = useState("");
  const [memuat, setMemuat] = useState(false);

  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    const bersih = kode.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (bersih.length !== 12) { setGalat("Kode akses terdiri dari 12 huruf dan angka."); return; }
    setMemuat(true); setGalat("");
    try {
      await api.masuk(bersih);
      void pindah("/beranda", { replace: true });
    } catch (err) {
      setGalat(err instanceof GalatApi && err.status === 401 ? "Kode tidak dikenal. Periksa lagi huruf dan angkanya." : err instanceof Error ? err.message : String(err));
    } finally { setMemuat(false); }
  };

  return (
    <form onSubmit={kirim} noValidate className="flex flex-col gap-5">
      <p className="text-isi">Masukkan kode akses 12 huruf dan angka dari saat mendaftar.</p>
      <Isian label="Kode akses" value={kode} onChange={(e) => setKode(e.target.value.toUpperCase())}
        autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="K7QM 2XPA 9RHT"
        className="[&_input]:font-mono [&_input]:tracking-wider" />
      {galat && <PesanGalat pesan={galat} />}
      <Tombol type="submit" memuat={memuat} className="sm:w-full">Masuk</Tombol>
    </form>
  );
}

function FormKlinik({ kembali }: { kembali: string }) {
  const pindah = useNavigate();
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [terlihat, setTerlihat] = useState(false);
  const [galat, setGalat] = useState("");
  const [memuat, setMemuat] = useState(false);

  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !sandi) { setGalat("Isi email dan kata sandi."); return; }
    setMemuat(true); setGalat("");
    try {
      await panggil("dokterMasuk", { body: { email: email.trim(), kata_sandi: sandi } });
      void pindah(/^\/r\/[A-Za-z0-9_-]{43}$/.test(kembali) ? kembali : "/klinik/pasien", { replace: true });
    } catch (err) {
      setGalat(err instanceof GalatApi && err.status === 401 ? "Email atau kata sandi salah." : err instanceof Error ? err.message : String(err));
    } finally { setMemuat(false); }
  };

  return (
    <form onSubmit={kirim} noValidate className="flex flex-col gap-5">
      <p className="text-isi">Untuk dokter dan tenaga kesehatan klinik.</p>
      <Isian label="Email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
      <div className="flex flex-col gap-1">
        <Isian label="Kata sandi" type={terlihat ? "text" : "password"} autoComplete="current-password" value={sandi} onChange={(e) => setSandi(e.target.value)} />
        <button type="button" onClick={() => setTerlihat((t) => !t)} className={`${tombolTeks} -ml-3 self-start text-kecil`}>
          {terlihat ? "Sembunyikan" : "Tampilkan"} kata sandi
        </button>
      </div>
      {galat && <PesanGalat pesan={galat} />}
      <Tombol type="submit" memuat={memuat} className="sm:w-full">{memuat ? "Memeriksa…" : "Masuk"}</Tombol>
    </form>
  );
}
