// Pemilik: B (Satya). `/sesi`: persiapan → layar makan. Query `?sumber=kamera|slider|rekaman:<nama>|tanpa` (default kamera).
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { bacaJenisSumber } from "../../../dev/sinyal-palsu.ts";
import { Memuat, PesanGalat } from "../../../komponen/dasar.tsx";
import { wadahKeluarga } from "../../../gaya/gaya.ts";
import { panggil } from "../../../lib/panggil.ts";
import { bukaAudio, muatSemua } from "../../../suara/pemutar.ts";
import { useMuat } from "../bantu.ts";
import { api } from "../data.ts";
import { useSaya } from "../tata-letak.tsx";
import { LayarMakan } from "./layar-makan.tsx";
import { Persiapan, type PilihanSesi } from "./persiapan.tsx";

type Kunci = { release: () => Promise<void> };
type NavWakeLock = Navigator & { wakeLock?: { request: (j: "screen") => Promise<Kunci> } };

export function HalamanSesiMakan() {
  const { saya } = useSaya();
  const [param] = useSearchParams();
  const nilai = param.get("sumber") ?? "kamera";
  const sumber = nilai === "tanpa" ? null : bacaJenisSumber(nilai);
  const { data, galat, memuat, ulangi } = useMuat(() => api.aturan(saya.child.id), [saya.child.id]);
  const [pilihan, setPilihan] = useState<PilihanSesi | null>(null);
  const kunci = useRef<Kunci | null>(null);
  // Mode demo lomba (server DEMO=1): tahap bisa dipindah instan untuk simulasi lepas layar, tanpa menunggu
  // naik otomatis. Di persiapan lewat tombol, di layar makan lewat tombol 1-4 (tidak terlihat di video).
  const [demo, setDemo] = useState(false);
  const [tahapDemo, setTahapDemo] = useState<number | null>(null);
  useEffect(() => {
    let hidup = true;
    panggil("sehat").then((r) => { if (hidup) setDemo(r.demo); }, () => {});
    return () => { hidup = false; };
  }, []);
  useEffect(() => {
    if (!demo) return;
    const k = (e: KeyboardEvent) => { if (/^[1-4]$/.test(e.key) && !(e.target instanceof HTMLInputElement)) setTahapDemo(Number(e.key)); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [demo]);

  // Wake Lock (K9): dipasang saat mulai, dipasang ulang saat tab terlihat lagi, dilepas saat keluar.
  const pasangWakeLock = useCallback(async () => {
    try { kunci.current = (await (navigator as NavWakeLock).wakeLock?.request("screen")) ?? null; } catch { /* tidak didukung */ }
  }, []);
  useEffect(() => {
    if (!pilihan) return;
    const k = () => { if (document.visibilityState === "visible") void pasangWakeLock(); };
    document.addEventListener("visibilitychange", k);
    return () => {
      document.removeEventListener("visibilitychange", k);
      void kunci.current?.release().catch(() => {});
      kunci.current = null;
    };
  }, [pilihan, pasangWakeLock]);

  const mulai = async (p: PilihanSesi) => {
    bukaAudio(); // harus di gestur ketukan (K8)
    await Promise.race([muatSemua(), new Promise((r) => setTimeout(r, 4000))]);
    await pasangWakeLock();
    setPilihan(p);
  };

  if (galat) return <div className={`${wadahKeluarga} pt-10`}><PesanGalat pesan={galat} ulangi={ulangi} /></div>;
  if (memuat || !data) return <Memuat />;
  const aturan = { ...data.aturan, stage: tahapDemo ?? saya.child.stage };
  // Tahap 4 tidak punya layar makan: langsung ke "pengasuh memimpin, lalu catat".
  if (!pilihan || aturan.stage >= 4) {
    return (
      <>
        {demo && <PilihTahapDemo tahap={aturan.stage} pilih={setTahapDemo} />}
        <Persiapan key={aturan.stage} saya={saya} tahap={aturan.stage} mulai={mulai} />
      </>
    );
  }
  // key: ganti tahap di tengah sesi = layar makan dimulai ulang dengan saklar tahap baru.
  return <>{param.get("debug") === "1" && <PanelDebug />}<LayarMakan key={aturan.stage} saya={saya} aturan={aturan} pilihan={pilihan} sumber={sumber} wakeLock={pasangWakeLock} /></>;
}

const NAMA_TAHAP = ["Karakter Memandu", "Pengasuh Jadi Contoh", "Layar Hitam", "Tanpa Layar"];

/** Layar mini per tahap: terang + karakter, karakter samar, hitam, lalu tanpa layar (piring saja). */
function LayarMini({ t, aktif }: { t: number; aktif: boolean }) {
  const garis = aktif ? "#FAF6EE" : "#4B2E5A";
  return (
    <svg viewBox="0 0 48 40" className="h-9 w-11" aria-hidden="true">
      {t < 4 ? (
        <>
          <rect x="4" y="3" width="40" height="28" rx="6" fill={t === 3 ? "#1d1220" : aktif ? "#6E5A78" : "#FFFDF8"} stroke={garis} strokeWidth="2.5" />
          {t < 3 && <circle cx="24" cy="17" r="7" fill="#E0A526" opacity={t === 1 ? 1 : 0.35} />}
          {t < 3 && <path d="M21 18 q3 3 6 0" stroke="#4B2E5A" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity={t === 1 ? 1 : 0.35} />}
          <path d="M18 36 h12" stroke={garis} strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="24" cy="26" rx="18" ry="7" fill={aktif ? "#6E5A78" : "#FFFDF8"} stroke={garis} strokeWidth="2.5" />
          <circle cx="24" cy="22" r="5" fill="#E0A526" />
        </>
      )}
    </svg>
  );
}

function PilihTahapDemo({ tahap, pilih }: { tahap: number; pilih: (t: number) => void }) {
  return (
    <div className={`${wadahKeluarga} pt-4`}>
      <section className="relative overflow-hidden rounded-bento bg-ungu-tint/60 p-4 ring-1 ring-ungu/10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="label-atas rounded-full bg-jagung px-2.5 py-1 text-ungu">Mode Demo</span>
            <h2 className="font-judul text-isi font-bold">Simulasi Lepas Layar</h2>
          </div>
          <span className="flex items-center gap-1 text-mini text-ungu-muda">
            Di layar makan tekan
            {[1, 2, 3, 4].map((n) => <kbd key={n} className="rounded-md bg-permukaan px-1.5 font-isi text-mini font-bold text-ungu shadow-[0_1px_0_var(--color-garis)]">{n}</kbd>)}
          </span>
        </div>
        <ol className="relative grid grid-cols-2 gap-2 sm:grid-cols-4">
          {/* Garis penghubung: layar makin redup dari kiri ke kanan. */}
          <span aria-hidden="true" className="absolute top-1/2 right-6 left-6 hidden h-0.5 -translate-y-1/2 bg-gradient-to-r from-jagung via-ungu-muda to-ungu/20 sm:block" />
          {NAMA_TAHAP.map((nama, i) => {
            const t = i + 1, aktif = tahap === t;
            return (
              <li key={nama} className="relative">
                <button type="button" onClick={() => pilih(t)} aria-pressed={aktif}
                  className={`flex w-full flex-col items-center gap-1 rounded-kartu px-2 py-3 text-center transition-transform active:translate-y-0.5 ${aktif ? "bg-ungu text-latar shadow-[0_3px_0_#2E1B38]" : "bg-permukaan text-ungu shadow-[0_2px_0_var(--color-garis)] hover:-translate-y-0.5"}`}>
                  <LayarMini t={t} aktif={aktif} />
                  <span className={`label-atas ${aktif ? "text-jagung" : "text-jagung-tua"}`}>Tahap {t}</span>
                  <span className="text-kecil leading-tight font-semibold">{nama}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

function PanelDebug() {
  const [isi, setIsi] = useState("");
  useEffect(() => {
    const id = window.setInterval(() => {
      const d = (window as { __suapinDebug?: Record<string, unknown> }).__suapinDebug;
      setIsi(d ? Object.entries(d).map(([k, v]) => `${k}: ${typeof v === "number" ? v.toFixed(4) : String(v)}`).join(" · ") : "menunggu");
    }, 250);
    return () => window.clearInterval(id);
  }, []);
  return <pre className="pointer-events-none fixed top-2 inset-x-2 z-40 rounded bg-black/70 p-2 whitespace-pre-wrap font-mono text-[11px] leading-tight text-white">{isi}</pre>;
}
