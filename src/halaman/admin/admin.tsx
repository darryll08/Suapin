// Pemilik: B (Satya). Halaman `/admin` untuk operator Suapin (jalur B2B2C):
// mendaftarkan akun klinik dan dokter (email + sandi sementara), membuat sandi baru, dan menonaktifkan dokter.
// Sandi sementara hanya tampil sekali; server menyimpan hash-nya saja. Admin masuk lewat form /masuk biasa.
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import type { Keluaran } from "../../../bersama/kontrak/api";
import { Isian, Memuat, PesanGalat, Pil, Tombol } from "../../komponen/dasar.tsx";
import { bento, tombolTeks } from "../../gaya/gaya.ts";
import { GalatApi, panggil, usePanggil } from "../../lib/panggil.ts";
import { Logo } from "../keluarga/tata-letak.tsx";
import { Angka, Avatar, Ikon, panel, ubin } from "../klinik/tata-letak.tsx";

type Klinik = Keluaran<"adminAkun">["klinik"][number];
type Dokter = Klinik["dokter"][number];
type Rahasia = { untuk: string; ket: string; nilai: string };

const pesan = (e: unknown) =>
  e instanceof GalatApi && e.status === 409 ? "Email ini sudah dipakai akun lain." : e instanceof Error ? e.message : String(e);

export function Admin() {
  const pindah = useNavigate();
  const { data, galat, memuat, ulang } = usePanggil("adminAkun");
  const sehat = usePanggil("sehat");
  const [rahasia, setRahasia] = useState<Rahasia | null>(null);
  const [keluar, setKeluar] = useState(false);

  if (galat instanceof GalatApi && galat.status === 401) return <Navigate to="/masuk" replace />;

  const selesai = (s: Rahasia) => { setRahasia(s); ulang(); window.scrollTo({ top: 0 }); };
  const keluarAdmin = async () => {
    setKeluar(true);
    try { await panggil("adminKeluar"); void pindah("/masuk", { replace: true }); }
    finally { setKeluar(false); }
  };
  const totalDokter = data?.klinik.reduce((n, k) => n + k.dokter.length, 0) ?? 0;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 pb-12">
      <header className="flex items-center justify-between gap-3 pt-3">
        <div className="flex items-center gap-3"><Logo ke="/admin" /><Pil nada="jagung">Admin</Pil></div>
        <div className="flex min-w-0 items-center gap-2">
          {data && <span className="hidden min-w-0 items-center gap-2 rounded-full border border-garis/60 bg-permukaan py-1 pr-4 pl-1 sm:flex">
            <Avatar nama="Admin" kecil /><span className="truncate text-kecil font-bold">{data.admin_email}</span>
          </span>}
          <button type="button" disabled={keluar} onClick={() => void keluarAdmin()} title="Keluar" className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full border border-garis/60 bg-permukaan px-4 text-kecil font-bold text-ungu transition-colors hover:bg-ungu-tint disabled:opacity-50 outline-none focus-visible:ring-4 focus-visible:ring-jagung">
            <Ikon nama="keluar" className="size-4" />{keluar ? "Keluar…" : "Keluar"}
          </button>
        </div>
      </header>

      <section className="flex flex-col gap-4 rounded-bento bg-ungu p-5 text-permukaan sm:p-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-judul text-judul font-bold">Akun klinik</h1>
          <p className="text-isi text-latar/85">
            Daftarkan klinik setelah kerja sama disepakati. Klinik dan dokter masuk dengan email + sandi sementara dari sini.
          </p>
        </div>
      </section>
      {data && <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Angka ikon="map" label="Klinik" nilai={data.klinik.length} />
        <Angka ikon="stetoskop" label="Dokter" nilai={totalDokter} />
        <Angka ikon="anak" label="Pasien" nilai={data.klinik.reduce((n, k) => n + k.jumlah_pasien, 0)} />
      </div>}

      {rahasia && <KotakRahasia data={rahasia} tutup={() => setRahasia(null)} />}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <FormKlinikBaru selesai={selesai} />

        <section className="flex flex-col gap-4" aria-labelledby="judul-daftar-klinik">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="judul-daftar-klinik" className="font-judul text-subjudul font-bold">Klinik terdaftar</h2>
            {data && <span className="text-kecil text-ungu-muda">{data.klinik.length} klinik · {totalDokter} dokter</span>}
          </div>
          {memuat && !data && <Memuat teks="Memuat akun…" />}
          {galat && <PesanGalat pesan={galat.message} ulangi={ulang} />}
          {data && !data.klinik.length && <p className={bento}>Belum ada klinik. Daftarkan klinik pertama di formulir.</p>}
          {data?.klinik.map((k) => <KartuKlinik key={k.id} klinik={k} selesai={selesai} ulang={ulang} />)}
        </section>
      </div>

      {sehat.data?.demo && (
        <section className={`${bento} flex flex-wrap items-center justify-between gap-3`}>
          <div>
            <h2 className="font-judul text-subjudul font-bold">Alat demo</h2>
            <p className="text-kecil text-ungu-muda">Panel ambang deteksi dan reset data demo.</p>
          </div>
          <Link to="/dev/ambang" className={tombolTeks}>Buka panel ambang</Link>
        </section>
      )}
    </main>
  );
}

function KotakRahasia({ data, tutup }: { data: Rahasia; tutup: () => void }) {
  const [disalin, setDisalin] = useState(false);
  const salin = async () => {
    try { await navigator.clipboard.writeText(data.nilai); setDisalin(true); } catch { setDisalin(false); }
  };
  return (
    <section role="status" className="flex flex-col gap-3 rounded-bento border-2 border-jagung bg-jagung-muda p-5">
      <h2 className="font-judul text-subjudul font-bold">Sandi sementara untuk {data.untuk}</h2>
      <p className="text-isi">{data.ket} Kirim lewat jalur aman. Hanya tampil sekali.</p>
      <div className="flex flex-wrap items-center gap-3">
        <code className="rounded-xl bg-permukaan px-4 py-3 font-mono text-subjudul tracking-wider">{data.nilai}</code>
        <Tombol varian="kedua" onClick={() => void salin()} className="min-h-12">{disalin ? "Tersalin" : "Salin"}</Tombol>
        <button type="button" onClick={tutup} className={tombolTeks}>Sudah dicatat</button>
      </div>
    </section>
  );
}

function FormKlinikBaru({ selesai }: { selesai: (s: Rahasia) => void }) {
  const [klinik, setKlinik] = useState("");
  const [kota, setKota] = useState("");
  const [email, setEmail] = useState("");
  const [galat, setGalat] = useState("");
  const [memuat, setMemuat] = useState(false);

  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    if (!klinik.trim() || !email.trim()) { setGalat("Isi nama klinik dan email akun klinik."); return; }
    setMemuat(true); setGalat("");
    try {
      const r = await panggil("adminKlinikBuat", { body: { nama_klinik: klinik.trim(), kota: kota.trim() || undefined, email: email.trim() } });
      selesai({ untuk: klinik.trim(), ket: `Masuk di /masuk dengan email ${email.trim().toLowerCase()}.`, nilai: r.sandi_sementara });
      setKlinik(""); setKota(""); setEmail("");
    } catch (err) { setGalat(pesan(err)); } finally { setMemuat(false); }
  };

  return (
    <form onSubmit={kirim} noValidate className={`${bento} flex flex-col gap-4`} aria-labelledby="judul-klinik-baru">
      <h2 id="judul-klinik-baru" className="font-judul text-subjudul font-bold">Daftarkan klinik</h2>
      <Isian label="Nama klinik" value={klinik} onChange={(e) => setKlinik(e.target.value)} maxLength={80} />
      <Isian label="Kota" value={kota} onChange={(e) => setKota(e.target.value)} maxLength={80} />
      <Isian label="Email akun klinik" type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} />
      <p className="text-kecil text-ungu-muda">Dokter ditambahkan setelah klinik terdaftar, masing-masing dengan email sendiri.</p>
      {galat && <PesanGalat pesan={galat} />}
      <Tombol type="submit" memuat={memuat} className="sm:w-full">Daftarkan</Tombol>
    </form>
  );
}

function KartuKlinik({ klinik, selesai, ulang }: { klinik: Klinik; selesai: (s: Rahasia) => void; ulang: () => void }) {
  const [tambah, setTambah] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState("");
  const sandiKlinik = async () => {
    if (!window.confirm(`Buat sandi baru untuk ${klinik.nama}? Sandi lama langsung tidak berlaku.`)) return;
    setSibuk(true); setGalat("");
    try {
      const r = await panggil("adminKlinikSandi", { params: { id: klinik.id } });
      selesai({ untuk: klinik.nama, ket: `Email ${klinik.email ?? "-"}.`, nilai: r.sandi_sementara });
    } catch (e) { setGalat(pesan(e)); } finally { setSibuk(false); }
  };
  return (
    <article className={`${panel} flex flex-col gap-3`}>
      <div className="flex items-center gap-3">
        <Avatar nama={klinik.nama} />
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="text-isi font-bold">{klinik.nama}</h3>
          <span className="text-kecil [overflow-wrap:anywhere] text-ungu-muda">{[klinik.kota, klinik.email ?? "Belum punya akun klinik"].filter(Boolean).join(" · ")}</span>
        </div>
        <span className="flex shrink-0 gap-1.5">
          <span className="flex flex-col items-center rounded-isian bg-latar px-3 py-1.5 leading-tight"><span className="font-judul text-subjudul font-bold tabular-nums">{klinik.dokter.length}</span><span className="text-mini text-ungu-muda">dokter</span></span>
          <span className="flex flex-col items-center rounded-isian bg-latar px-3 py-1.5 leading-tight"><span className="font-judul text-subjudul font-bold tabular-nums">{klinik.jumlah_pasien}</span><span className="text-mini text-ungu-muda">pasien</span></span>
        </span>
      </div>
      {klinik.email && <button type="button" disabled={sibuk} onClick={() => void sandiKlinik()} className={`${tombolTeks} -ml-3 self-start`}>
        {sibuk ? "Membuat…" : "Sandi klinik baru"}</button>}
      {galat && <PesanGalat pesan={galat} />}
      {!!klinik.dokter.length && <ul className={`${ubin} flex flex-col divide-y divide-garis/50 py-1`}>
        {klinik.dokter.map((d) => <BarisDokter key={d.id} dokter={d} selesai={selesai} ulang={ulang} />)}
      </ul>}
      {tambah
        ? <FormDokterBaru clinicId={klinik.id} batal={() => setTambah(false)} selesai={(s) => { setTambah(false); selesai(s); }} />
        : <button type="button" onClick={() => setTambah(true)} className={`${tombolTeks} -ml-3 self-start`}>Tambah dokter</button>}
    </article>
  );
}

function BarisDokter({ dokter, selesai, ulang }: { dokter: Dokter; selesai: (s: Rahasia) => void; ulang: () => void }) {
  const [sibuk, setSibuk] = useState<"sandi" | "status" | null>(null);
  const [galat, setGalat] = useState("");
  const jalankan = async (jenis: "sandi" | "status") => {
    if (jenis === "sandi" && !window.confirm(`Buat sandi baru untuk ${dokter.nama}? Sandi lama langsung tidak berlaku.`)) return;
    setSibuk(jenis); setGalat("");
    try {
      if (jenis === "sandi") {
        const r = await panggil("adminDokterSandi", { params: { id: dokter.id } });
        selesai({ untuk: dokter.nama, ket: `Email ${dokter.email ?? "-"}.`, nilai: r.sandi_sementara });
      } else {
        await panggil("adminDokterStatus", { params: { id: dokter.id }, body: { aktif: !dokter.aktif } });
        ulang();
      }
    } catch (e) { setGalat(pesan(e)); } finally { setSibuk(null); }
  };
  return (
    <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
      <Avatar nama={dokter.nama} kecil />
      <div className="flex min-w-0 flex-col">
        <span className="flex flex-wrap items-center gap-2 font-semibold">
          {dokter.nama}
          {!dokter.aktif && <Pil nada="jagung">Nonaktif</Pil>}
        </span>
        <span className="text-kecil [overflow-wrap:anywhere] text-ungu-muda">{dokter.email ?? "Belum punya email"} · {dokter.spesialis ?? "Tenaga kesehatan"} · {dokter.jumlah_pasien} pasien</span>
        {galat && <PesanGalat pesan={galat} />}
      </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-1 pl-9 sm:pl-0">
        <button type="button" disabled={sibuk !== null} onClick={() => void jalankan("sandi")} className={tombolTeks}>
          {sibuk === "sandi" ? "Membuat…" : "Sandi baru"}
        </button>
        <button type="button" disabled={sibuk !== null} onClick={() => void jalankan("status")} className={tombolTeks}>
          {sibuk === "status" ? "Menyimpan…" : dokter.aktif ? "Nonaktifkan" : "Aktifkan"}
        </button>
      </div>
    </li>
  );
}

function FormDokterBaru({ clinicId, batal, selesai }: { clinicId: string; batal: () => void; selesai: (s: Rahasia) => void }) {
  const [nama, setNama] = useState("");
  const [spesialis, setSpesialis] = useState("");
  const [email, setEmail] = useState("");
  const [galat, setGalat] = useState("");
  const [memuat, setMemuat] = useState(false);
  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !email.trim()) { setGalat("Isi nama dan email dokter."); return; }
    setMemuat(true); setGalat("");
    try {
      const r = await panggil("adminDokterBuat", { body: { clinic_id: clinicId, nama: nama.trim(), spesialis: spesialis.trim() || undefined, email: email.trim() } });
      selesai({ untuk: nama.trim(), ket: `Masuk di /masuk dengan email ${email.trim().toLowerCase()}.`, nilai: r.sandi_sementara });
    } catch (err) { setGalat(pesan(err)); } finally { setMemuat(false); }
  };
  return (
    <form onSubmit={kirim} noValidate className="flex flex-col gap-3 rounded-kartu bg-latar p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Isian label="Nama dokter" value={nama} onChange={(e) => setNama(e.target.value)} maxLength={80} placeholder="dr. …" />
        <Isian label="Spesialis atau peran" value={spesialis} onChange={(e) => setSpesialis(e.target.value)} maxLength={80} />
        <Isian label="Email dokter" type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} className="sm:col-span-2" />
      </div>
      {galat && <PesanGalat pesan={galat} />}
      <div className="flex flex-wrap gap-2">
        <Tombol type="submit" memuat={memuat} className="min-h-12">Tambah</Tombol>
        <button type="button" onClick={batal} className={tombolTeks}>Batal</button>
      </div>
    </form>
  );
}
