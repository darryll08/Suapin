// Pemilik: B (Satya). Lonceng notifikasi keluarga (beranda): pengingat lama tidak sesi, trial/paket hampir habis atau habis.
// Panel berisi daftar notifikasi + saklar Web Push untuk HP ini. Saat DEMO=1 ada tombol kirim contoh (untuk video/juri).
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { pil, tombolIkon, tombolTeks } from "../gaya/gaya.ts";
import { panggil, usePanggil } from "../lib/panggil.ts";
import { matikanPush, nyalakanPush, statusPush, type StatusPush } from "../lib/push.ts";
import { Tombol } from "./dasar.tsx";
import { beritahu } from "./notifikasi.tsx";

const WAKTU = new Intl.RelativeTimeFormat("id", { numeric: "auto" });
function sejak(iso: string) {
  const menit = Math.round((Date.parse(iso) - Date.now()) / 60000);
  if (Math.abs(menit) < 60) return WAKTU.format(menit, "minute");
  const jam = Math.round(menit / 60);
  return Math.abs(jam) < 24 ? WAKTU.format(jam, "hour") : WAKTU.format(Math.round(jam / 24), "day");
}

export function Lonceng() {
  const { data, ulang } = usePanggil("notifikasiDaftar");
  const sehat = usePanggil("sehat");
  const [buka, setBuka] = useState(false);
  const [push, setPush] = useState<StatusPush | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const wadah = useRef<HTMLDivElement>(null);

  useEffect(() => { void statusPush().then(setPush, () => setPush("tidak_didukung")); }, []);
  useEffect(() => {
    if (!buka) return;
    const tutup = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !wadah.current?.contains(e.target as Node)) setBuka(false);
    };
    document.addEventListener("mousedown", tutup);
    document.addEventListener("keydown", tutup);
    return () => { document.removeEventListener("mousedown", tutup); document.removeEventListener("keydown", tutup); };
  }, [buka]);

  const belum = data?.belum_dibaca ?? 0;
  const alih = () => {
    const baru = !buka;
    setBuka(baru);
    if (baru && belum) void panggil("notifikasiBaca").then(ulang, () => {});
  };
  const saklar = async () => {
    if (!data?.kunci_publik && push !== "aktif") return;
    setSibuk(true);
    try {
      const s = push === "aktif" ? await matikanPush() : await nyalakanPush(data!.kunci_publik!);
      setPush(s);
      if (s === "aktif") beritahu({ nada: "sukses", judul: "Notifikasi HP menyala", pesan: "Pengingat makan akan muncul walau Suapin ditutup." });
      if (s === "ditolak") beritahu({ nada: "info", judul: "Izin notifikasi ditolak", pesan: "Buka pengaturan situs di browser untuk mengizinkan." });
    } catch {
      beritahu({ nada: "galat", judul: "Notifikasi belum bisa dinyalakan", pesan: "Pastikan membuka Suapin lewat https, lalu coba lagi." });
    } finally { setSibuk(false); }
  };
  const contoh = async () => {
    setSibuk(true);
    try {
      const r = await panggil("demoNotifikasi", { body: { jenis: "pengingat" } });
      ulang();
      beritahu({ nada: "sukses", judul: r.terkirim_push ? "Contoh pengingat terkirim ke HP" : "Contoh pengingat dibuat",
        pesan: r.terkirim_push ? undefined : "Nyalakan notifikasi HP supaya muncul di layar kunci." });
    } finally { setSibuk(false); }
  };

  return (
    <div ref={wadah} className="relative">
      <button type="button" onClick={alih} aria-expanded={buka} aria-haspopup="dialog"
        aria-label={belum ? `Notifikasi, ${belum} belum dibaca` : "Notifikasi"} title="Notifikasi" className={`${tombolIkon} relative`}>
        <IkonLonceng />
        {belum > 0 && <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-jagung px-1 text-mini font-bold text-ungu">{belum > 9 ? "9+" : belum}</span>}
      </button>
      {buka && (
        <div role="dialog" aria-label="Notifikasi"
          className="pudar-masuk fixed inset-x-4 top-[4.5rem] z-40 flex max-h-[75dvh] flex-col overflow-hidden rounded-bento border border-garis/60 bg-permukaan shadow-lembar sm:absolute sm:inset-x-auto sm:right-0 sm:top-14 sm:w-[380px]">
          <div className="flex items-center justify-between gap-2 border-b border-garis/50 px-5 py-3">
            <h2 className="font-judul text-subjudul font-bold">Notifikasi</h2>
            <button type="button" onClick={() => setBuka(false)} className={tombolTeks}>Tutup</button>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto p-3">
            <KartuPush status={push} adaKunci={!!data?.kunci_publik} sibuk={sibuk} saklar={() => void saklar()} />
            {sehat.data?.demo && <button type="button" disabled={sibuk} onClick={() => void contoh()} className={`${tombolTeks} self-start text-kecil`}>Kirim contoh pengingat (demo)</button>}
            {!data?.notifikasi.length && <p className="px-2 py-4 text-isi text-ungu-muda">Belum ada notifikasi.</p>}
            <ul className="flex flex-col gap-2">
              {data?.notifikasi.map((n) => (
                <li key={n.id}>
                  <Link to={n.tautan} onClick={() => setBuka(false)}
                    className={`flex flex-col gap-1 rounded-kartu p-3 outline-none hover:bg-ungu-tint focus-visible:ring-4 focus-visible:ring-jagung ${n.dibaca ? "" : "bg-latar"}`}>
                    <span className="flex items-start justify-between gap-2">
                      <span className="font-semibold">{n.judul}</span>
                      {!n.dibaca && <span className={`${pil} min-h-6 shrink-0 bg-jagung-muda px-2 text-jagung-tua`}>Baru</span>}
                    </span>
                    <span className="text-kecil">{n.isi}</span>
                    <span className="text-kecil text-ungu-muda">{sejak(n.dibuat)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function KartuPush({ status, adaKunci, sibuk, saklar }: { status: StatusPush | null; adaKunci: boolean; sibuk: boolean; saklar: () => void }) {
  if (status === null) return null;
  const teks: Record<StatusPush, string> = {
    aktif: "Notifikasi HP menyala. Pengingat muncul walau Suapin ditutup.",
    mati: "Nyalakan supaya pengingat makan dan info paket muncul di HP, walau Suapin ditutup.",
    ditolak: "Izin notifikasi ditolak. Izinkan lewat pengaturan situs di browser.",
    perlu_pasang: "Di iPhone, pasang Suapin ke Layar Utama dulu (Bagikan → Tambah ke Layar Utama), lalu buka dari ikonnya.",
    tidak_didukung: "Browser ini belum mendukung notifikasi. Notifikasi tetap tampil di sini.",
  };
  return (
    <div className="flex flex-col gap-3 rounded-kartu bg-ungu-tint p-4">
      <p className="text-kecil">{teks[status]}</p>
      {(status === "mati" || status === "aktif") && adaKunci && (
        <Tombol varian={status === "aktif" ? "kedua" : "utama"} memuat={sibuk} onClick={saklar} className="min-h-12 sm:w-full">
          {status === "aktif" ? "Matikan notifikasi HP" : "Nyalakan notifikasi HP"}
        </Tombol>
      )}
    </div>
  );
}

function IkonLonceng() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
