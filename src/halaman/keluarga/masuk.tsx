// Pemilik: B (Satya). Halaman masuk `/masuk`: satu form email + kata sandi untuk semua peran.
// Server menentukan perannya: keluarga → /beranda, dokter → /dokter, klinik → /klinik, admin → /admin.
// `?kembali=/r/<token>` dipertahankan untuk dokter yang datang dari link laporan keluarga.
// Panel "Akun demo" hanya muncul bila server berjalan dengan DEMO=1 (`GET /api/sehat`).
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Isian, PesanGalat, Tombol } from "../../komponen/dasar.tsx";
import { bento, tombolTeks, wadahKeluarga } from "../../gaya/gaya.ts";
import { GalatApi, panggil } from "../../lib/panggil.ts";
import { api } from "./data.ts";
import { Logo } from "./tata-letak.tsx";

const kembaliAman = (k: string) => /^\/r\/[A-Za-z0-9_-]{43}$/.test(k) ? k : "";
const TUJUAN = { keluarga: "/beranda", dokter: "/dokter", klinik: "/klinik", admin: "/admin" } as const;

export function Masuk() {
  const [param] = useSearchParams();
  const kembali = kembaliAman(param.get("kembali") ?? "");

  return (
    <main className={`${wadahKeluarga} flex min-h-dvh flex-col`}>
      <div className="pt-3"><Logo ke="/" /></div>
      <div className="flex flex-1 flex-col gap-6 pt-10 pb-8 sm:pt-16">
        <header className="flex flex-col gap-1">
          <h1 className="font-judul text-judul font-bold">Masuk ke Suapin</h1>
          <p className="text-isi text-ungu-muda">Untuk keluarga, dokter, dan klinik.</p>
        </header>

        <section className={`${bento} masuk flex flex-col gap-5`}>
          <FormMasuk kembali={kembali} />
        </section>

        <div className="flex flex-col gap-1">
          <Link to="/mulai" className={`${tombolTeks} -ml-3 self-start`}>Belum punya akun? Mulai gratis</Link>
          <p className="text-kecil text-ungu-muda">Akun dokter dan klinik dibuat oleh admin Suapin setelah klinik bekerja sama.</p>
        </div>

        <AkunDemo kembali={kembali} />
      </div>
    </main>
  );
}

function FormMasuk({ kembali }: { kembali: string }) {
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
      const { peran } = await api.masuk(email.trim(), sandi);
      void pindah(peran === "dokter" && kembali ? kembali : TUJUAN[peran], { replace: true });
    } catch (err) {
      setGalat(err instanceof GalatApi && err.status === 401 ? "Email atau kata sandi salah." : err instanceof Error ? err.message : String(err));
    } finally { setMemuat(false); }
  };

  return (
    <form onSubmit={kirim} noValidate className="flex flex-col gap-5">
      <Isian label="Email" type="email" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false}
        value={email} onChange={(e) => setEmail(e.target.value)} />
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

type Akun = { id: "keluarga_dika" | "dokter_demo" | "klinik_demo" | "admin_demo"; ke: string; peran: string; nama: string; ket: string; ikon: ReactNode };

const AKUN_DEMO: Akun[] = [
  { id: "keluarga_dika", ke: "/beranda", peran: "Keluarga", nama: "keluarga@demo.test · Dika (4 th)", ket: "Beranda, sesi makan, laporan", ikon: <IkonRumah /> },
  { id: "dokter_demo", ke: "/dokter", peran: "Dokter", nama: "dokter@demo.test · dr. Demo", ket: "Anak yang dipegang, resep jadi aturan", ikon: <IkonStetoskop /> },
  { id: "klinik_demo", ke: "/klinik", peran: "Klinik", nama: "klinik@demo.test", ket: "Dokter, pasien per dokter, jadwal", ikon: <IkonGedung /> },
  { id: "admin_demo", ke: "/admin", peran: "Admin", nama: "admin@demo.test · Operator Suapin", ket: "Daftarkan klinik dan dokter", ikon: <IkonGerigi /> },
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
      await panggil("demoMasuk", { body: { sebagai: a.id } });
      void pindah(a.id === "dokter_demo" && kembali ? kembali : a.ke, { replace: true });
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
function IkonGedung() {
  return <svg viewBox="0 0 24 24" className="size-5" {...garisIkon} aria-hidden="true"><path d="M4 21V5l8-2v18" /><path d="M12 9h8v12" /><path d="M2 21h20M8 8v.01M8 12v.01M8 16v.01M16 13v.01M16 17v.01" /></svg>;
}
function IkonGerigi() {
  return <svg viewBox="0 0 24 24" className="size-5" {...garisIkon} aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1" /></svg>;
}
