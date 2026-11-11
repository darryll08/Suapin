// Pemilik: B (Satya). `/sesi`: persiapan → layar makan. Query `?sumber=kamera|slider|rekaman:<nama>|tanpa` (default kamera).
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { bacaJenisSumber } from "../../../dev/sinyal-palsu.ts";
import { Memuat, PesanGalat } from "../../../komponen/dasar.tsx";
import { wadahKeluarga } from "../../../gaya/gaya.ts";
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
  const aturan = { ...data.aturan, stage: saya.child.stage };
  if (!pilihan) return <Persiapan saya={saya} tahap={aturan.stage} mulai={mulai} />;
  return <LayarMakan saya={saya} aturan={aturan} pilihan={pilihan} sumber={sumber} wakeLock={pasangWakeLock} />;
}
