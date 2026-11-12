// Pemilik: B (Satya). Layar makan `/sesi` (B2.2, UI UX 10.8). Engine dan kamera dari hook A (`useSesiMakan`).
// Tata letak dicerminkan sesuai `sisiPengasuh`: Suap, Lanjut, pratinjau di sisi pengasuh; Stop di sisi jauh.
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { TEKS } from "../../../../bersama/konten/teks.ts";
import type { SesiSelesai } from "../../../../bersama/kontrak/sesi.ts";
import { PanelSlider } from "../../../dev/panel-slider.tsx";
import type { JenisSumber } from "../../../dev/sinyal-palsu.ts";
import { Karakter } from "../../../karakter/karakter.tsx";
import { LembarBawah } from "../../../komponen/lembar.tsx";
import { Memuat, Tombol } from "../../../komponen/dasar.tsx";
import { LembarTanya, StripTeks } from "../../../komponen/strip-teks.tsx";
import { useSesiMakan } from "../../../mesin/use-sesi-makan.ts";
import { saklarTahap } from "../../../mesin/tahap.ts";
import type { AturanSesi, Tombol as TombolEngine } from "../../../mesin/sesi.ts";
import { useKlip } from "../../../suara/use-klip.ts";
import { api, type Saya } from "../data.ts";
import { Pemanasan } from "./pemanasan.tsx";
import type { PilihanSesi } from "./persiapan.tsx";

export const KUNCI_TERTUNDA = "tm_sesi_tertunda";

type Props = {
  saya: Saya;
  aturan: AturanSesi;
  pilihan: PilihanSesi;
  sumber: JenisSumber | null;
  wakeLock: () => Promise<void>;
};

export function LayarMakan({ saya, aturan, pilihan, sumber, wakeLock }: Props) {
  const pindah = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const sesi = useSesiMakan({
    aturan, sisiPengasuh: pilihan.sisi, sumber, video: videoRef,
    anak: { child_id: saya.child.id, menu: pilihan.menu, makanan_baru: pilihan.makananBaru },
  });
  const v = sesi.tampilan;
  const saklar = saklarTahap(aturan.stage);
  const kanan = pilihan.sisi === "kanan";
  const hitam = v?.layar === "hitam";
  const [konfirmStop, setKonfirmStop] = useState(false);
  const [darurat, setDarurat] = useState(false);
  const [koreksi, setKoreksi] = useState(false);
  const [galatKameraDitutup, setGalatKameraDitutup] = useState(false);
  const [kembaliKeTab, setKembaliKeTab] = useState(false);
  const [galatSimpan, setGalatSimpan] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);
  const tanpaKamera = sumber === null || !!sesi.galat;
  const pakaiKamera = sumber?.jenis === "kamera" && !sesi.galat;

  useKlip(v?.klip, { suara: saklar.suara, sapaan: saya.child.sapaan });

  // Mulai sekali setelah elemen video terpasang.
  const dimulai = useRef(false);
  useEffect(() => {
    if (dimulai.current) return;
    dimulai.current = true;
    void sesi.mulai();
  }, [sesi]);

  const tekan = useCallback((t: TombolEngine) => {
    if (t === "suap" && "vibrate" in navigator) navigator.vibrate(20);
    sesi.tekan(t);
  }, [sesi]);

  // Pintasan laptop: Spasi = Suap, L = Lanjut, Esc = Stop.
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") { e.preventDefault(); tekan("suap"); }
      else if (e.key === "l" || e.key === "L") tekan("lanjut");
      else if (e.key === "Escape") setKonfirmStop((x) => !x);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [tekan]);

  // Kembali ke tab: tanya lanjut atau akhiri.
  useEffect(() => {
    const k = () => { if (document.visibilityState === "visible" && v && v.status !== "SELESAI") setKembaliKeTab(true); };
    document.addEventListener("visibilitychange", k);
    return () => document.removeEventListener("visibilitychange", k);
  }, [v]);

  const simpan = useCallback(async (hasil: SesiSelesai) => {
    setMenyimpan(true);
    setGalatSimpan("");
    try { sessionStorage.setItem(KUNCI_TERTUNDA, JSON.stringify(hasil)); } catch { /* abaikan */ }
    try {
      const r = await api.simpanSesi(hasil);
      try { sessionStorage.removeItem(KUNCI_TERTUNDA); } catch { /* abaikan */ }
      const diterima = hasil.gigitan.filter((g) => g.hasil === "diterima").length;
      void pindah(`/sesi/catatan?id=${encodeURIComponent(r.session_id)}`, {
        replace: true, state: { ...r, diterima, menit: Math.max(1, Math.round(hasil.durasi_detik / 60)) },
      });
    } catch (e) {
      setGalatSimpan(e instanceof Error ? e.message : String(e));
    } finally {
      setMenyimpan(false);
    }
  }, [pindah]);

  const disimpan = useRef(false);
  useEffect(() => {
    if (sesi.hasil && !disimpan.current) { disimpan.current = true; void simpan(sesi.hasil); }
  }, [sesi.hasil, simpan]);

  if (sesi.hasil) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-latar px-4 text-center">
        {menyimpan || !galatSimpan ? <Memuat teks="Menyimpan hasil makan…" /> : (
          <>
            <div className="size-40"><Karakter pose="netral" mulut={0} makanan={null} layar="terang" tokoh={pilihan.tokoh} /></div>
            <p className="font-judul text-judul font-bold">Hasil makan belum tersimpan.</p>
            <p className="text-kecil text-jagung-tua">{galatSimpan}</p>
            <Tombol onClick={() => void simpan(sesi.hasil!)}>Coba simpan lagi</Tombol>
          </>
        )}
      </main>
    );
  }

  const status = v?.status;
  const tampilKarakter = !hitam && (saklar.layar !== "giliran_saja" || status === "GILIRAN_KARAKTER" || status === "DITERIMA" || status === "PEMANASAN");
  const teks = v?.teks ? (v.teks.id === "saran_ngemut" ? aturan.ngemut_hint : TEKS[v.teks.id].isi) : null;
  const gigitanAkhir = v?.gigitan.at(-1);
  const sisiP = kanan ? "right-4" : "left-4";
  const sisiJauh = kanan ? "left-4" : "right-4";

  return (
    // Di HP (tegak maupun miring): layar penuh. Di laptop/tablet (varian `bingkai` di token.css:
    // lebar ≥ 640 DAN tinggi ≥ 600): panel tegak setinggi layar, lebar max(560 px, 76dvh) supaya karakter
    // tetap ±70% tinggi layar untuk juri yang melihat dari 1–3 m (UI UX 2.1, 10.8).
    // `translateZ(0)` membuat lembar bawah dan layar darurat (`fixed`) tetap di dalam bingkai.
    <div className={`fixed inset-0 bingkai:flex bingkai:items-center bingkai:justify-center bingkai:p-4 ${hitam ? "bg-black" : "bg-ungu-tint"}`}>
    <main className={`relative size-full overflow-hidden [container-type:size] [transform:translateZ(0)] bingkai:h-full bingkai:w-full bingkai:max-w-[max(560px,76dvh)] bingkai:rounded-[40px] ${hitam ? "bg-black text-latar" : "bg-latar text-ungu bingkai:shadow-[0_20px_60px_rgb(75_46_90/0.25)]"}`}>
      {/* Karakter di tengah, ≥ 60% tinggi layar */}
      <div className="absolute inset-0 flex items-center justify-center pt-6 pb-36">
        <div className="aspect-square h-[min(70cqh,92cqw)] max-h-full">
          {!v ? <Memuat teks="Menyiapkan teman makan…" />
            : status === "PEMANASAN" ? (
              <Pemanasan makanan={pilihan.menu} tokoh={pilihan.tokoh} panggilan={saya.child.panggilan} suara={saklar.suara} onSelesai={sesi.selesaiPemanasan} />
            ) : tampilKarakter ? (
              <Karakter pose={v.pose} mulut={v.mulutKarakter} layar="terang" tokoh={pilihan.tokoh}
                makanan={{ id: pilihan.menu, tahap: v.makananTahap }} />
            ) : !hitam && <div className="size-full rounded-full bg-jagung-muda/70" style={{ transform: "scale(0.86)" }} />}
        </div>
      </div>

      {/* Lapisan redup layar penuh (JEDA_KUNYAH, KEMUNGKINAN_NGEMUT) */}
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 bg-black transition-opacity duration-[400ms] ${v?.layar === "redup" ? "opacity-60" : "opacity-0"}`} />

      {/* Stop: pojok atas sisi jauh. Di panel bingkai, radius 24 = 40 (panel) − 16 (jarak tepi) supaya sudutnya sejajar. */}
      <button type="button" title="Stop (Esc)" onClick={() => setKonfirmStop(true)}
        className={`absolute top-4 ${sisiJauh} min-h-12 rounded-tombol bingkai:rounded-[24px] border-2 px-4 text-kecil font-bold ${hitam ? "border-latar/40 text-latar opacity-35" : "border-ungu bg-permukaan"}`}>
        ■ Stop
      </button>

      {/* Pratinjau kamera: pojok atas sisi pengasuh. Video tetap terpasang (kamera jalan) walau disembunyikan di tahap 3. */}
      <div className={`absolute top-4 ${sisiP} ${hitam || !pakaiKamera ? "pointer-events-none opacity-0" : ""}`}>
        <video ref={videoRef} muted playsInline aria-label="Pratinjau kamera, ketuk wajah anak bila salah pilih"
          className={`h-32 w-24 rounded-tombol bingkai:rounded-[24px] border-2 bg-ungu-tint object-cover sm:h-[120px] sm:w-40 ${status === "TIDAK_TERLIHAT" ? "border-jagung" : "border-latar"}`}
          style={{ transform: "scaleX(-1)" }}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            sesi.pilihWajahDiTitik(1 - (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
          }} />
        {status === "KALIBRASI" && (
          <span className="pointer-events-none absolute inset-0 m-auto size-16 rounded-full border-2 border-dashed border-latar" />
        )}
      </div>
      {tanpaKamera && !hitam && (
        <span className={`absolute top-5 ${sisiP} rounded-full bg-ungu-tint px-3 py-1.5 text-kecil font-semibold`}>Tanpa kamera</span>
      )}

      {status === "PEMANASAN" && (
        <LewatiPemanasan className={`absolute top-20 ${sisiP} sm:top-40`} lewati={() => tekan("lewati_pemanasan")} />
      )}

      {sesi.slider && (
        <details className={`absolute top-20 ${sisiJauh} max-w-64 rounded-kartu bg-permukaan/95 p-2 text-kecil`}>
          <summary className="cursor-pointer font-semibold">Slider sinyal (dev)</summary>
          <PanelSlider sumber={sesi.slider} />
        </details>
      )}

      {/* Lanjut + Suap: pojok bawah sisi pengasuh */}
      <div className={`absolute bottom-[max(1rem,env(safe-area-inset-bottom))] ${sisiP} flex items-end gap-3 ${kanan ? "flex-row" : "flex-row-reverse"}`}>
        {(status === "JEDA_KUNYAH" || status === "GILIRAN_KARAKTER") && !hitam && (
          <button type="button" title="Lanjut (L)" disabled={status === "GILIRAN_KARAKTER"} onClick={() => tekan("lanjut")}
            className="mb-2 min-h-12 rounded-tombol border-2 border-ungu bg-permukaan px-4 text-kecil font-bold disabled:opacity-40">
            Lanjut
          </button>
        )}
        <TombolSuap menilai={status === "MENILAI"} redup={hitam} onClick={() => tekan("suap")} />
      </div>

      {/* Koreksi suapan terakhir: bawah, di sisi jauh supaya tidak menutupi Suap */}
      {gigitanAkhir && !hitam && status !== "PEMANASAN" && (
        <button type="button" onClick={() => setKoreksi(true)}
          className={`absolute bottom-[max(1rem,env(safe-area-inset-bottom))] ${sisiJauh} min-h-12 rounded-tombol bg-permukaan/90 px-3 text-kecil font-semibold underline-offset-4 hover:underline`}>
          Tadi {gigitanAkhir.hasil === "diterima" ? "diterima" : gigitanAkhir.hasil === "ngemut" ? "ngemut" : "ditolak"} ▾
        </button>
      )}

      {/* Strip teks: di atas tombol bawah */}
      {teks && !v?.teks?.tanya && (
        <StripTeks teks={teks} gelap={hitam} className="absolute inset-x-0 bottom-36 sm:bottom-40" />
      )}

      {sesi.galat && !galatKameraDitutup && (
        <LembarBawah judul="Kamera tidak bisa dipakai">
          <p className="text-isi">{sesi.galat}</p>
          <p className="text-kecil text-ungu-muda">Sesi tetap jalan. Setelah Suap, jawab "Tadi masuk?" dengan Ya atau Tidak.</p>
          <Tombol onClick={() => setGalatKameraDitutup(true)} className="sm:w-full">Lanjut tanpa kamera</Tombol>
        </LembarBawah>
      )}

      {v?.teks?.tanya && (
        <LembarTanya pertanyaan={TEKS[v.teks.id].isi.replace(/\s*Ya \/ Tidak$/, "")} jawab={(ya) => tekan(ya ? "ya" : "tidak")} />
      )}

      {koreksi && (
        <LembarBawah judul="Ubah suapan terakhir" tutup={() => setKoreksi(false)}>
          <div className="grid grid-cols-2 gap-3">
            <Tombol varian="kedua" className="sm:w-full" onClick={() => { tekan("koreksi_ditolak"); setKoreksi(false); }}>Ubah jadi ditolak</Tombol>
            <Tombol className="sm:w-full" onClick={() => { tekan("koreksi_diterima"); setKoreksi(false); }}>Ubah jadi diterima</Tombol>
          </div>
        </LembarBawah>
      )}

      {konfirmStop && !darurat && (
        <LembarBawah judul="Akhiri makan sekarang?" tutup={() => setKonfirmStop(false)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Tombol className="sm:w-full" onClick={() => { setKonfirmStop(false); tekan("stop"); }}>Akhiri makan</Tombol>
            <Tombol varian="kedua" className="sm:w-full" onClick={() => setKonfirmStop(false)}>Lanjut makan</Tombol>
          </div>
          <button type="button" onClick={() => setDarurat(true)}
            className="flex min-h-12 items-center justify-center gap-2 text-isi font-semibold text-jagung-tua underline-offset-4 hover:underline">
            <span aria-hidden="true" className="inline-flex size-5 items-center justify-center rounded-full bg-jagung text-kecil text-ungu">!</span>
            Darurat: anak tersedak
          </button>
        </LembarBawah>
      )}

      {darurat && (
        <div role="alertdialog" aria-label="Darurat" className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-latar p-6 text-center text-ungu">
          <p className="max-w-[480px] font-judul text-judul font-bold">
            Jika anak tersedak dan tidak bisa bernapas, segera minta bantuan medis atau hubungi 119.
          </p>
          <a href="tel:119" className="inline-flex min-h-14 w-full max-w-[320px] items-center justify-center rounded-tombol bg-ungu px-5 text-tombol font-bold text-permukaan">Telepon 119</a>
          <Tombol varian="teks" onClick={() => { setDarurat(false); setKonfirmStop(false); tekan("darurat"); }}>Tutup</Tombol>
        </div>
      )}

      {kembaliKeTab && (
        <LembarBawah judul="Lanjutkan makan?">
          <div className="grid grid-cols-2 gap-3">
            <Tombol varian="kedua" className="sm:w-full" onClick={() => { setKembaliKeTab(false); tekan("stop"); }}>Akhiri</Tombol>
            <Tombol className="sm:w-full" onClick={() => { setKembaliKeTab(false); void wakeLock(); }}>Lanjut</Tombol>
          </div>
        </LembarBawah>
      )}
    </main>
    </div>
  );
}

function TombolSuap({ menilai, redup, onClick }: { menilai: boolean; redup: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-label="Suap" title="Suap (Spasi)" onClick={onClick}
      className={`relative flex size-28 flex-col items-center justify-center rounded-full text-ungu shadow-[0_6px_16px_rgb(0_0_0/0.18)] transition-transform duration-[120ms] active:scale-[0.94] focus-visible:ring-4 focus-visible:ring-ungu sm:size-32 ${redup ? "bg-jagung/35" : "bg-jagung"}`}>
      {menilai && (
        <span aria-hidden="true" className="absolute -inset-1 rounded-full border-4 border-jagung-muda border-t-ungu motion-safe:animate-[suap-putar_1s_linear_infinite]" />
      )}
      <svg viewBox="0 0 24 24" className="size-10" aria-hidden="true">
        <g transform="rotate(40 12 12)">
          <ellipse cx="12" cy="7" rx="4.2" ry="5.2" fill="currentColor" />
          <rect x="11" y="11" width="2" height="11" rx="1" fill="currentColor" />
        </g>
      </svg>
      <span className={`text-isi font-bold ${redup ? "text-latar" : ""}`}>Suap</span>
    </button>
  );
}

function LewatiPemanasan({ className, lewati }: { className: string; lewati: () => void }) {
  const [tampil, setTampil] = useState(false);
  useEffect(() => { const t = window.setTimeout(() => setTampil(true), 5000); return () => window.clearTimeout(t); }, []);
  if (!tampil) return null;
  return (
    <button type="button" onClick={lewati} className={`${className} pudar-masuk min-h-12 rounded-tombol bg-permukaan/90 px-4 text-kecil font-semibold`}>
      Lewati
    </button>
  );
}
