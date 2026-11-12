// Pemilik: B (Satya). Halaman masuk gabungan `/masuk`: Keluarga (kode akses), Klinik (email + kata sandi), atau Admin.
// Login klinik memakai endpoint yang sama dengan /klinik/masuk milik C (`dokterMasuk` lewat panggil()).
// `?sebagai=klinik|admin` membuka tab itu; `?kembali=/r/<token>` dipertahankan untuk dokter dari link laporan.
// Panel "Akun demo" (pola dari sibuker) hanya muncul bila server berjalan dengan DEMO=1 (`GET /api/sehat`).
// Admin = operator Suapin yang mendaftarkan klinik + dokter (`/admin`, `adminMasuk`); sandi dari ADMIN_SANDI di server.
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Isian, PesanGalat, Tombol } from "../../komponen/dasar.tsx";
import { bento, tombolSegmen, tombolTeks, wadahKeluarga, wadahSegmen } from "../../gaya/gaya.ts";
import { GalatApi, panggil } from "../../lib/panggil.ts";
import { api } from "./data.ts";
import { Logo } from "./tata-letak.tsx";

type Peran = "keluarga" | "klinik" | "admin";
const LABEL: Record<Peran, string> = { keluarga: "Keluarga", klinik: "Klinik", admin: "Admin" };

export function Masuk() {
  const [param, setParam] = useSearchParams();
  const sebagai = param.get("sebagai");
  const peran: Peran = sebagai === "klinik" || sebagai === "admin" ? sebagai : "keluarga";
  const ganti = (p: Peran) => {
    const baru = new URLSearchParams(param);
    if (p === "keluarga") baru.delete("sebagai"); else baru.set("sebagai", p);
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

        <div className={`${wadahSegmen} grid-cols-3`} role="tablist" aria-label="Masuk sebagai">
          {(["keluarga", "klinik", "admin"] as const).map((p) => (
            <button key={p} type="button" role="tab" aria-selected={peran === p} onClick={() => ganti(p)} className={tombolSegmen(peran === p)}>
              {LABEL[p]}
            </button>
          ))}
        </div>

        <section key={peran} className={`${bento} masuk flex flex-col gap-5`} role="tabpanel">
          {peran === "keluarga" ? <FormKeluarga /> : peran === "klinik" ? <FormKlinik kembali={param.get("kembali") ?? ""} /> : <FormKlinik admin />}
        </section>

        {peran === "keluarga" ? (
          <Link to="/mulai" className={`${tombolTeks} -ml-3 self-start`}>Belum punya kode? Mulai gratis</Link>
        ) : peran === "klinik" ? (
          <p className="text-kecil text-ungu-muda">Akun dokter dibuat oleh admin Suapin setelah klinik bekerja sama.</p>
        ) : (
          <p className="text-kecil text-ungu-muda">Untuk operator Suapin yang mendaftarkan klinik.</p>
        )}

        <AkunDemo kembali={param.get("kembali") ?? ""} />
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

function FormKlinik({ kembali = "", admin = false }: { kembali?: string; admin?: boolean }) {
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
      const body = { email: email.trim(), kata_sandi: sandi };
      if (admin) { await panggil("adminMasuk", { body }); void pindah("/admin", { replace: true }); return; }
      await panggil("dokterMasuk", { body });
      void pindah(/^\/r\/[A-Za-z0-9_-]{43}$/.test(kembali) ? kembali : "/klinik/pasien", { replace: true });
    } catch (err) {
      setGalat(err instanceof GalatApi && err.status === 401 ? "Email atau kata sandi salah." : err instanceof Error ? err.message : String(err));
    } finally { setMemuat(false); }
  };

  return (
    <form onSubmit={kirim} noValidate className="flex flex-col gap-5">
      <p className="text-isi">{admin ? "Kelola klinik dan akun dokter." : "Untuk dokter dan tenaga kesehatan klinik."}</p>
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

type Akun = { id: "keluarga" | "klinik" | "admin"; peran: string; nama: string; ket: string; ikon: ReactNode };

const AKUN_DEMO: Akun[] = [
  { id: "keluarga", peran: "Keluarga", nama: "Mbak Rina · Dika (4 th)", ket: "Beranda, sesi makan, laporan", ikon: <IkonRumah /> },
  { id: "klinik", peran: "Klinik", nama: "dr. Demo · dokter@demo.test", ket: "Daftar pasien, resep jadi aturan", ikon: <IkonStetoskop /> },
  { id: "admin", peran: "Admin", nama: "Operator Suapin", ket: "Daftarkan klinik dan akun dokter", ikon: <IkonGerigi /> },
];

function AkunDemo({ kembali }: { kembali: string }) {
  const pindah = useNavigate();
  const [aktif, setAktif] = useState(false);
  const [sibuk, setSibuk] = useState<Akun["id"] | null>(null);
  const [galat, setGalat] = useState("");

  useEffect(() => {
    let hidup = true;
    panggil("sehat").then((r) => { if (hidup) setAktif(r.demo); }, () => {});
    return () => { hidup = false; };
  }, []);
  if (!aktif) return null;

  const masuk = async (a: Akun) => {
    setSibuk(a.id); setGalat("");
    try {
      const sebagai = a.id === "keluarga" ? "keluarga_dika" : a.id === "klinik" ? "dokter_demo" : "admin_demo";
      await panggil("demoMasuk", { body: { sebagai } });
      if (a.id === "keluarga") void pindah("/beranda", { replace: true });
      else if (a.id === "admin") void pindah("/admin", { replace: true });
      else void pindah(/^\/r\/[A-Za-z0-9_-]{43}$/.test(kembali) ? kembali : "/klinik/pasien", { replace: true });
    } catch (e) {
      setGalat(e instanceof Error ? e.message : String(e));
    } finally { setSibuk(null); }
  };

  return (
    <section className={`${bento} masuk flex flex-col gap-4`} aria-labelledby="judul-akun-demo">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="judul-akun-demo" className="font-judul text-subjudul font-bold">Akun demo</h2>
        <span className="rounded-full bg-jagung-muda px-3 py-1 text-kecil font-semibold text-jagung-tua">Mode demo lomba</span>
      </div>
      <ul className="flex flex-col gap-2">
        {AKUN_DEMO.map((a) => (
          <li key={a.id}>
            <button type="button" onClick={() => void masuk(a)} disabled={sibuk !== null}
              className="group flex min-h-16 w-full items-center gap-3 rounded-kartu bg-latar p-3 text-left transition-[transform,background-color,box-shadow] duration-200 ease-standar hover:-translate-y-0.5 hover:bg-ungu-tint hover:shadow-kartu active:translate-y-0 active:scale-[0.98] disabled:opacity-60 motion-reduce:transform-none outline-none focus-visible:ring-4 focus-visible:ring-jagung">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-garis/60 bg-permukaan text-ungu">{a.ikon}</span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-isi font-bold">{a.peran}</span>
                <span className="text-kecil break-words text-ungu-muda">{a.nama}</span>
                <span className="text-kecil text-ungu-muda">{a.ket}</span>
              </span>
              <span className="shrink-0 rounded-full bg-ungu px-4 py-2 text-kecil font-bold text-permukaan transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none">
                {sibuk === a.id ? "…" : "Masuk"}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {galat && <PesanGalat pesan={galat} />}
      <p className="text-kecil text-ungu-muda">Satu klik langsung masuk. Daftar ini hanya muncul saat server berjalan dengan DEMO=1.</p>
    </section>
  );
}

const garisIkon = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
function IkonRumah() {
  return <svg viewBox="0 0 24 24" className="size-5" {...garisIkon} aria-hidden="true"><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-5h4v5" /></svg>;
}
function IkonStetoskop() {
  return <svg viewBox="0 0 24 24" className="size-5" {...garisIkon} aria-hidden="true"><path d="M6 3v5a4 4 0 0 0 8 0V3" /><path d="M10 12v3a5 5 0 0 0 10 0v-2" /><circle cx="20" cy="11" r="2" /></svg>;
}
function IkonGerigi() {
  return <svg viewBox="0 0 24 24" className="size-5" {...garisIkon} aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1" /></svg>;
}
