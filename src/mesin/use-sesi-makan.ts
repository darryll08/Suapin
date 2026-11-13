// Pemilik: A (Darryl). A2.3: hook penghubung engine sesi ke layar sesi (B).
// Hook tidak memanggil API: B mengirim `hasil` ke POST /api/sessions lewat panggil().
// Keadaan engine disimpan di ref; layar di-render ulang paling banyak ±30 kali per detik.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SesiSelesai, TampilanSesi } from "../../bersama/kontrak/sesi.ts";
import { sumberKamera, type SumberKamera, type SumberSinyal } from "../deteksi/sumber-kamera.ts";
import { DAFTAR_REKAMAN, GETAR_PALSU, sumberRekaman, sumberSlider, type JenisSumber, type SumberSlider } from "../dev/sinyal-palsu.ts";
import { bacaAmbang } from "./ambang.ts";
import { hasilSesi, next, sesiAwal, tampilan as bacaTampilan, type AturanSesi, type Kejadian, type Keadaan, type Konteks, type Perintah, type Tombol } from "./sesi.ts";
import { saklarTahap } from "./tahap.ts";

export type OpsiSesiMakan = {
  aturan: AturanSesi;
  sisiPengasuh: "kiri" | "kanan";
  /** null = tanpa kamera: hasil suapan dari tombol Ya/Tidak pengasuh, karakter tidak meniru. */
  sumber: JenisSumber | null;
  /** Ref elemen <video> pratinjau; dibaca saat mulai(), jadi aman meski elemen baru terpasang setelah render. */
  video: { readonly current: HTMLVideoElement | null };
  anak: { child_id: string; menu: string; makanan_baru: boolean };
};

const DETIK_MS = 250;
const RENDER_MS = 33;

export function useSesiMakan(o: OpsiSesiMakan) {
  const [tampilan, setTampilan] = useState<TampilanSesi | null>(null);
  const [hasil, setHasil] = useState<SesiSelesai | null>(null);
  const [galat, setGalat] = useState("");
  const [fps, setFps] = useState(0);
  const opsi = useRef(o);
  useEffect(() => { opsi.current = o; });

  // Slider dibuat sebelum mulai supaya PanelSlider bisa tampil lebih dulu.
  const slider: SumberSlider | null = useMemo(() => (o.sumber?.jenis === "slider" ? sumberSlider() : null), [o.sumber?.jenis]);

  const keadaan = useRef<Keadaan | null>(null);
  const konteks = useRef<Konteks | null>(null);
  const sumber = useRef<SumberSinyal | null>(null);
  const kamera = useRef<SumberKamera | null>(null);
  const interval = useRef(0);
  const mulaiIso = useRef("");
  const renderTerakhir = useRef(0);
  const sudahMulai = useRef(false);
  const hidup = useRef(true);
  // Jeda: kejadian berhenti dikirim ke engine, lalu waktu engine digeser sebesar lama jeda supaya timer
  // (batas waktu sesi, tunggu menolak, jeda kunyah) tidak ikut berjalan selama sesi dijeda.
  const jedaSejak = useRef<number | null>(null);
  const jedaTotal = useRef(0);
  const [sedangJeda, setSedangJeda] = useState(false);
  const elVideo = useRef<HTMLVideoElement | null>(null); // disimpan sendiri: ref <video> sudah null saat unmount

  const berhenti = useCallback(() => {
    window.clearInterval(interval.current);
    sumber.current?.berhenti();
    sumber.current = null;
    kamera.current = null;
    // Jaring pengaman: semua track yang masih menempel di <video> dimatikan, supaya kamera tidak tetap menyala.
    const el = elVideo.current;
    if (el?.srcObject instanceof MediaStream) { el.srcObject.getTracks().forEach((t) => t.stop()); el.srcObject = null; }
  }, []);

  const terapkan = useCallback((perintah: Perintah[]) => {
    for (const p of perintah) {
      if (p.jenis === "baselineBoleh") kamera.current?.baselineBoleh(p.nilai);
      else kamera.current?.kalibrasi(p.aktif);
    }
  }, []);

  const kirim = useCallback((asli: Kejadian) => {
    if (jedaSejak.current !== null) return;
    const geser = jedaTotal.current;
    const e: Kejadian = !geser ? asli : asli.jenis === "sinyal" ? { ...asli, s: { ...asli.s, t: asli.s.t - geser } } : { ...asli, t: asli.t - geser };
    const lama = keadaan.current;
    const kx = konteks.current;
    if (!lama || !kx || lama.status === "SELESAI") return;
    kx.getarDiam = kamera.current?.getarDiam() ?? GETAR_PALSU;
    const r = next(lama, e, kx);
    keadaan.current = r.keadaan;
    terapkan(r.perintah);
    const k = r.keadaan;
    const t = performance.now() - geser;
    // Diagnosis lapangan (/sesi?debug=1): angka kunyah terakhir dibaca layar debug.
    (window as { __suapinDebug?: unknown }).__suapinDebug = {
      status: k.status, kunyahAktif: k.kunyahAktif, siklus3s: k.kunyah.siklus.filter((x) => x > t - 3_000).length,
      sejakSiklus: k.kunyah.terakhir === null ? null : Math.round(t - k.kunyah.terakhir), getar: kx.getarDiam,
      rahang: k.buffer.at(-1)?.rahang ?? null, pitch: k.buffer.at(-1)?.pitch ?? null,
    };
    const penting = k.status !== lama.status || k.klip !== lama.klip || k.teks !== lama.teks || k.gigitan !== lama.gigitan;
    if (penting || t - renderTerakhir.current >= RENDER_MS) {
      renderTerakhir.current = t;
      setTampilan(bacaTampilan(k, kx));
    }
    if (k.status === "SELESAI") {
      berhenti();
      setHasil(hasilSesi(k, kx, { ...opsi.current.anak, mulaiIso: mulaiIso.current, selesaiIso: new Date().toISOString() }));
    }
  }, [berhenti, terapkan]);

  const mulai = useCallback(async () => {
    if (sudahMulai.current) return;
    sudahMulai.current = true;
    const { aturan, sisiPengasuh, sumber: jenis, video } = opsi.current;
    const videoEl = video.current;
    elVideo.current = videoEl;
    const ambang = bacaAmbang();
    konteks.current = {
      aturan,
      saklar: saklarTahap(aturan.stage),
      ambang: jenis ? ambang : { ...ambang, hasilDariKamera: false, kunyahDariKamera: false },
      getarDiam: GETAR_PALSU,
    };
    const buka = async () => {
      let s: SumberSinyal | null = null;
      if (jenis?.jenis === "kamera") {
        if (!videoEl) throw new Error("Elemen video belum siap.");
        kamera.current = sumberKamera({ video: videoEl, sisiPengasuh, ambang: () => konteks.current!.ambang });
        s = kamera.current;
      } else if (jenis?.jenis === "slider") s = slider;
      else if (jenis?.jenis === "rekaman") s = sumberRekaman(DAFTAR_REKAMAN[jenis.nama]);
      sumber.current = s;

      // Kamera dan model dimuat dulu, baru engine mulai, supaya kalibrasi 3 detik tidak habis saat model dimuat.
      try {
        await s?.mulai((sinyal) => kirim({ jenis: "sinyal", s: sinyal }));
      } catch (e) {
        // Kamera gagal: sesi tetap jalan dengan tombol pengasuh sebagai penentu hasil.
        setGalat(e instanceof Error ? e.message : String(e));
        sumber.current = null;
        kamera.current = null;
        konteks.current = { ...konteks.current!, ambang: { ...konteks.current!.ambang, hasilDariKamera: false, kunyahDariKamera: false } };
      }
      return s;
    };
    const s = await buka();
    // StrictMode/HMR: cleanup sempat menghentikan sumber saat kamera dimuat, lalu komponen dipasang lagi. Buka ulang.
    if (hidup.current && s && sumber.current === null && kamera.current === null && konteks.current.ambang.hasilDariKamera) await buka();

    if (!hidup.current) { berhenti(); return; } // halaman ditutup saat kamera dimuat
    mulaiIso.current = new Date().toISOString();
    const awal = sesiAwal(performance.now());
    keadaan.current = awal.keadaan;
    terapkan(awal.perintah);
    setTampilan(bacaTampilan(awal.keadaan, konteks.current));
    interval.current = window.setInterval(() => {
      kirim({ jenis: "detik", t: performance.now() });
      if (kamera.current) setFps(kamera.current.fps());
    }, DETIK_MS);
  }, [berhenti, kirim, slider, terapkan]);

  useEffect(() => {
    hidup.current = true;
    return () => { hidup.current = false; berhenti(); };
  }, [berhenti]);

  return {
    tampilan,
    hasil,
    /** Pesan galat kamera. Sesi tetap berjalan dalam mode tanpa kamera. */
    galat,
    fps,
    /** Sumber slider untuk PanelSlider bila `sumber = { jenis: "slider" }`. */
    slider,
    mulai,
    tekan: useCallback((tombol: Tombol) => kirim({ jenis: "tombol", tombol, t: performance.now() }), [kirim]),
    selesaiPemanasan: useCallback(() => kirim({ jenis: "pemanasan_selesai", t: performance.now() }), [kirim]),
    pilihWajahDiTitik: useCallback((x: number, y: number) => kamera.current?.pilihWajahDiTitik(x, y), []),
    sedangJeda,
    /** Jeda/lanjutkan sesi: engine membeku (tanpa sinyal, tanpa timer). */
    jeda: useCallback((aktif: boolean) => {
      if (aktif && jedaSejak.current === null) jedaSejak.current = performance.now();
      if (!aktif && jedaSejak.current !== null) { jedaTotal.current += performance.now() - jedaSejak.current; jedaSejak.current = null; }
      setSedangJeda(aktif);
    }, []),
  };
}
