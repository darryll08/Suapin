// Pemilik: B (Satya). Toast notifikasi di dalam app: proses gagal, error tak terduga, koneksi putus/tersambung.
// Dipanggil dari mana saja lewat `beritahu()`; `panggil()` otomatis memberi tahu bila server/jaringan bermasalah.
// Tanpa merah (UI UX 3): galat = jagung muda + garis jagung. Muncul sekali (pudar-masuk), tanpa animasi terus-menerus.
import { useEffect, useState } from "react";

type Nada = "galat" | "info" | "sukses";
export type Pemberitahuan = { id: number; nada: Nada; judul: string; pesan?: string };

let urut = 0;
const pendengar = new Set<(daftar: Pemberitahuan[]) => void>();
let daftar: Pemberitahuan[] = [];
const terakhir = new Map<string, number>();

function siarkan() { for (const f of pendengar) f(daftar); }
export function tutupPemberitahuan(id: number) {
  daftar = daftar.filter((p) => p.id !== id);
  siarkan();
}
/** Tampilkan toast. Pesan yang sama dalam 4 detik tidak ditampilkan dua kali. */
export function beritahu(p: Omit<Pemberitahuan, "id">) {
  const kunci = p.nada + p.judul;
  if (Date.now() - (terakhir.get(kunci) ?? 0) < 4000) return;
  terakhir.set(kunci, Date.now());
  const id = ++urut;
  daftar = [...daftar.slice(-2), { ...p, id }];
  siarkan();
  setTimeout(() => tutupPemberitahuan(id), p.nada === "galat" ? 8000 : 5000);
}

const GAYA: Record<Nada, string> = {
  galat: "border-jagung bg-jagung-muda text-ungu",
  info: "border-garis bg-permukaan text-ungu",
  sukses: "border-ungu bg-ungu-tint text-ungu",
};
const IKON: Record<Nada, string> = { galat: "!", info: "i", sukses: "✓" };

export function PusatPemberitahuan() {
  const [isi, setIsi] = useState<Pemberitahuan[]>(daftar);
  useEffect(() => {
    pendengar.add(setIsi);
    const putus = () => beritahu({ nada: "galat", judul: "Koneksi internet terputus", pesan: "Data sesi tetap tersimpan di HP dan dikirim saat tersambung lagi." });
    const sambung = () => beritahu({ nada: "sukses", judul: "Tersambung lagi" });
    const tolak = (e: PromiseRejectionEvent) => {
      if (e.reason instanceof DOMException && e.reason.name === "AbortError") return;
      beritahu({ nada: "galat", judul: "Ada proses yang tidak berjalan", pesan: "Coba ulangi. Kalau masih sama, muat ulang halaman." });
    };
    const galat = () => beritahu({ nada: "galat", judul: "Terjadi kesalahan di aplikasi", pesan: "Muat ulang halaman bila tampilan tidak berubah." });
    window.addEventListener("offline", putus);
    window.addEventListener("online", sambung);
    window.addEventListener("unhandledrejection", tolak);
    window.addEventListener("error", galat);
    return () => {
      pendengar.delete(setIsi);
      window.removeEventListener("offline", putus);
      window.removeEventListener("online", sambung);
      window.removeEventListener("unhandledrejection", tolak);
      window.removeEventListener("error", galat);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-auto sm:top-4 sm:items-end">
      {isi.map((p) => (
        <div key={p.id} role={p.nada === "galat" ? "alert" : "status"}
          className={`pudar-masuk pointer-events-auto flex w-full max-w-[400px] items-start gap-3 rounded-kartu border-2 p-3 pl-4 shadow-lembar ${GAYA[p.nada]}`}>
          <span aria-hidden="true" className={`mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-kecil font-bold ${p.nada === "galat" ? "bg-jagung text-ungu" : "bg-ungu text-permukaan"}`}>{IKON[p.nada]}</span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 py-0.5">
            <p className={`text-isi font-semibold ${p.nada === "galat" ? "text-jagung-tua" : ""}`}>{p.judul}</p>
            {p.pesan && <p className="text-kecil">{p.pesan}</p>}
          </div>
          <button type="button" onClick={() => tutupPemberitahuan(p.id)} aria-label="Tutup pemberitahuan"
            className="-my-1 -mr-1 inline-flex size-12 shrink-0 items-center justify-center rounded-full text-subjudul text-ungu-muda hover:bg-latar/60 outline-none focus-visible:ring-4 focus-visible:ring-jagung">×</button>
        </div>
      ))}
    </div>
  );
}
