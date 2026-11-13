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

const NAMA_TAHAP = ["Karakter memandu", "Pengasuh jadi contoh", "Layar hitam", "Tanpa layar"];

function PilihTahapDemo({ tahap, pilih }: { tahap: number; pilih: (t: number) => void }) {
  return (
    <div className={`${wadahKeluarga} pt-4`}>
      <div className="rounded-2xl border border-dashed border-garis bg-permukaan p-3">
        <p className="mb-2 text-kecil text-ungu-muda">Mode demo: simulasi tahap lepas layar (di layar makan: tombol 1-4)</p>
        <div className="flex flex-wrap gap-2">
          {NAMA_TAHAP.map((nama, i) => (
            <button key={nama} type="button" onClick={() => pilih(i + 1)} aria-pressed={tahap === i + 1}
              className={`rounded-full px-3 py-1.5 text-kecil font-bold ${tahap === i + 1 ? "bg-ungu text-latar" : "bg-ungu-tint text-ungu"}`}>
              {i + 1}. {nama}
            </button>
          ))}
        </div>
      </div>
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
