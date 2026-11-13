// Pemilik: A (Darryl). /dev/kamera: uji kamera + alat gerbang go/no-go (A0.4, A1.5).
// Video hanya diproses di browser. Rekaman yang diunduh berisi angka sinyal saja, tanpa gambar.
import { useEffect, useRef, useState } from "react";
import type { RekamanSinyal, Sinyal } from "../../bersama/kontrak/sinyal.ts";
import { sumberKamera, type SumberKamera } from "../deteksi/sumber-kamera.ts";
import { TANDA_YAW_KANAN_ANAK } from "../deteksi/sinyal.ts";
import { bacaAmbang } from "../mesin/ambang.ts";
import { kunyahAwal, langkahKunyah } from "../mesin/kunyah.ts";
import { UJI_GERBANG, nilaiPercobaan, statistikLamaBuka, unduhJson, type Percobaan } from "./gerbang.ts";

type Sisi = "kiri" | "kanan";
const SISI_KUNCI = "tm_sisi_pengasuh";
const bacaSisi = (): Sisi => {
  try { return localStorage.getItem(SISI_KUNCI) === "kiri" ? "kiri" : "kanan"; } catch { return "kanan"; }
};
const TAMPIL_MS = 250;
const SIMPAN_MS = 15 * 60 * 1000; // sinyal 15 menit terakhir disimpan di memori untuk menilai percobaan

export function HalamanKamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sumberRef = useRef<SumberKamera | null>(null);
  const sinyalRef = useRef<Sinyal[]>([]);
  const kunyahRef = useRef({ aktif: false, siklus: 0 });
  const rekamRef = useRef<Sinyal[] | null>(null);
  const suapRekamRef = useRef<number[]>([]); // waktu Suap selama merekam, ikut diunduh sebagai *.suap.json

  const [ambang] = useState(bacaAmbang);
  const [sisi, setSisi] = useState<Sisi>(bacaSisi);
  const [status, setStatus] = useState<"memuat" | "jalan" | "galat">("memuat");
  const [galat, setGalat] = useState("");
  const [tampil, setTampil] = useState({ s: null as Sinyal | null, fps: 0, wajah: 0, jawOpen: null as number | null, yaw: null as number | null, kunyah: false });
  const [kalibrasi, setKalibrasi] = useState(false);
  const [uji, setUji] = useState<string>(UJI_GERBANG[0]);
  const [penguji, setPenguji] = useState("Darryl");
  const [log, setLog] = useState<Percobaan[]>([]);
  const [merekam, setMerekam] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(SISI_KUNCI, sisi); } catch { /* penyimpanan diblokir: pilihan berlaku sampai halaman ditutup */ }
    let batal = false;
    let k = kunyahAwal();
    const sumber = sumberKamera({ video: videoRef.current!, sisiPengasuh: sisi, ambang: () => ambang });
    sumberRef.current = sumber;
    sumber
      .mulai((s) => {
        const buf = sinyalRef.current;
        buf.push(s);
        while (buf.length && buf[0].t < s.t - SIMPAN_MS) buf.shift();
        rekamRef.current?.push(s);
        const h = langkahKunyah(k, s, sumber.getarDiam(), ambang);
        if (h.k.terakhir !== k.terakhir) kunyahRef.current.siklus++;
        k = h.k;
        kunyahRef.current.aktif = h.aktif;
        sumber.baselineBoleh(!h.aktif);
      })
      .then(() => { if (!batal) setStatus("jalan"); })
      .catch((e: unknown) => {
        if (batal) return;
        setGalat(e instanceof Error ? e.message : String(e));
        setStatus("galat");
      });
    const interval = window.setInterval(() => {
      const m = sumber.mentah();
      setTampil({ s: sinyalRef.current.at(-1) ?? null, fps: sumber.fps(), wajah: m.wajah, jawOpen: m.jawOpen, yaw: m.yaw, kunyah: kunyahRef.current.aktif });
    }, TAMPIL_MS);
    return () => {
      batal = true;
      window.clearInterval(interval);
      sumber.berhenti();
      sumberRef.current = null;
    };
  }, [sisi, ambang]);

  const mulaiKalibrasi = () => {
    sumberRef.current?.kalibrasi(true);
    setKalibrasi(true);
    window.setTimeout(() => { sumberRef.current?.kalibrasi(false); setKalibrasi(false); }, 3000);
  };

  // Suap: catat waktu, nilai jendela 12 detik setelahnya (+3 detik sebelum) begitu jendela lewat.
  const suap = () => {
    const tSuap = performance.now();
    if (rekamRef.current) suapRekamRef.current.push(tSuap);
    const siklusAwal = kunyahRef.current.siklus;
    window.setTimeout(() => {
      setLog((l) => [...l, {
        no: l.length + 1, uji, penguji, tSuap,
        ...nilaiPercobaan(sinyalRef.current, tSuap, ambang.terbuka),
        siklusKunyah: kunyahRef.current.siklus - siklusAwal,
      }]);
    }, 12_000);
  };

  // Spasi = Suap, supaya satu orang bisa menguji sendiri (satu tangan sendok, satu tangan keyboard).
  useEffect(() => {
    const tekan = (e: KeyboardEvent) => {
      if (e.code !== "Space" || status !== "jalan") return;
      if ((e.target as HTMLElement).closest("input, select, textarea")) return;
      e.preventDefault(); // tombol yang sedang fokus (mis. Rekam sinyal) tidak ikut terklik
      (document.activeElement as HTMLElement | null)?.blur();
      suap();
    };
    window.addEventListener("keydown", tekan);
    return () => window.removeEventListener("keydown", tekan);
  });

  const rekam = () => {
    if (!rekamRef.current) { rekamRef.current = []; suapRekamRef.current = []; setMerekam(true); return; }
    const isi: RekamanSinyal = {
      versi: 1, fps: ambang.fpsMaks,
      catatan: `Gerbang: ${uji} · penguji ${penguji} · sisi pengasuh ${sisi} · ${new Date().toISOString()}`,
      sinyal: rekamRef.current,
    };
    rekamRef.current = null;
    setMerekam(false);
    const slug = uji.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const nama = `gerbang-${slug}-${penguji.toLowerCase()}-${Date.now()}`;
    unduhJson(`${nama}.json`, isi);
    // Waktu Suap disimpan terpisah (kontrak RekamanSinyal tidak punya kolomnya); dibaca uji/mesin/akurasi.ts.
    unduhJson(`${nama}.suap.json`, { uji, penguji, sisi, suap: suapRekamRef.current });
  };

  const statistik = statistikLamaBuka(log.filter((p) => p.uji === UJI_GERBANG[1]).map((p) => p.lamaBukaDetik));
  const s = tampil.s;
  const tombol = "min-h-12 rounded-2xl border border-ungu-muda bg-permukaan px-4 text-kecil font-semibold";
  const angka: [string, string][] = [
    ["Status", status === "memuat" ? "Menyiapkan kamera dan model…" : status === "jalan" ? "Jalan" : "Galat"],
    ["FPS deteksi", tampil.fps.toFixed(1) + (status === "jalan" && tampil.fps < 15 ? "  (di bawah target 15)" : "")],
    ["Jumlah wajah", String(tampil.wajah)],
    ["jawOpen mentah", tampil.jawOpen?.toFixed(3) ?? "-"],
    ["Yaw mentah (derajat)", tampil.yaw?.toFixed(1) ?? "-"],
    ["mulut", s ? s.mulut.toFixed(3) : "-"],
    ["rahang", s ? s.rahang.toFixed(4) : "-"],
    ["yaw (+ = ke pengasuh)", s ? s.yaw.toFixed(1) : "-"],
    ["pitch / angguk (derajat)", s?.pitch?.toFixed(1) ?? "-"],
    ["nangis / terlihat", s ? `${s.nangis} / ${s.terlihat}` : "-"],
    ["Kunyah aktif", tampil.kunyah ? "ya" : "tidak"],
  ];

  return (
    <main className="mx-auto grid max-w-5xl gap-4 p-4 text-ungu">
      <div>
        <h1 className="text-subjudul font-bold">Uji kamera dan gerbang</h1>
        <p className="text-kecil text-ungu-muda">Video hanya diproses di browser ini, tidak direkam dan tidak dikirim. Rekaman yang diunduh berisi angka saja.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[360px_1fr]">
        <div className="grid content-start gap-3">
          <video
            ref={videoRef}
            className="aspect-[4/3] w-full cursor-crosshair rounded-2xl bg-ungu-tint object-cover"
            style={{ transform: "scaleX(-1)" }}
            muted playsInline
            aria-label="Pratinjau kamera, ketuk wajah anak bila salah pilih"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              sumberRef.current?.pilihWajahDiTitik((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
            }}
          />
          <div className="flex flex-wrap items-center gap-2 text-kecil" role="radiogroup" aria-label="Sisi duduk pengasuh">
            <span className="text-ungu-muda">Pengasuh di</span>
            {(["kiri", "kanan"] as const).map((v) => (
              <button key={v} type="button" role="radio" aria-checked={sisi === v} onClick={() => { if (v !== sisi) { setSisi(v); setStatus("memuat"); } }}
                className={`${tombol} ${sisi === v ? "border-2 border-ungu bg-ungu-tint" : ""}`}>
                {v} anak
              </button>
            ))}
          </div>
          <button type="button" className={tombol} onClick={mulaiKalibrasi} disabled={kalibrasi || status !== "jalan"}>
            {kalibrasi ? "Kalibrasi… lihat lurus ke kamera" : "Kalibrasi 3 detik"}
          </button>
          <p className="text-kecil text-ungu-muda">
            Cek tanda yaw: anak menoleh ke kanannya sendiri → yaw mentah harus {TANDA_YAW_KANAN_ANAK > 0 ? "positif" : "negatif"}.
            Bila terbalik, ubah <code>TANDA_YAW_KANAN_ANAK</code> di <code>src/deteksi/sinyal.ts</code> dan catat di docs/gerbang.md.
          </p>
        </div>

        <div className="grid content-start gap-3">
          {status === "galat" && (
            <p role="alert" className="rounded-xl border-l-4 border-jagung bg-jagung-muda p-3 text-kecil text-jagung-tua">{galat}</p>
          )}
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-kecil">
            {angka.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-ungu-muda">{k}</dt>
                <dd className="font-mono tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="h-3 w-full rounded-full bg-ungu-tint" aria-hidden>
            <div className="h-3 rounded-full bg-jagung" style={{ width: `${Math.round((s?.mulut ?? 0) * 100)}%` }} />
          </div>
        </div>
      </div>

      <section className="grid gap-3 rounded-2xl border border-ungu-muda/25 bg-permukaan p-4 text-kecil">
        <h2 className="font-bold">Percobaan gerbang</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1">
            <span className="text-ungu-muda">Uji</span>
            <select className="min-h-12 rounded-xl border border-ungu-muda bg-permukaan px-3" value={uji} onChange={(e) => setUji(e.target.value)}>
              {UJI_GERBANG.map((u) => <option key={u}>{u}</option>)}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-ungu-muda">Penguji</span>
            <input className="min-h-12 w-32 rounded-xl border border-ungu-muda bg-permukaan px-3" value={penguji} onChange={(e) => setPenguji(e.target.value)} />
          </label>
          <button type="button" onClick={suap} disabled={status !== "jalan"}
            className="size-24 rounded-full bg-jagung text-tombol font-bold text-ungu shadow-lg active:scale-95 disabled:opacity-50">
            Suap
          </button>
          <button type="button" onClick={rekam} disabled={status !== "jalan"} className={tombol}>
            {merekam ? "Berhenti & unduh rekaman" : "Rekam sinyal"}
          </button>
          <button type="button" onClick={() => unduhJson(`log-gerbang-${Date.now()}.json`, log)} disabled={!log.length} className={tombol}>
            Unduh log
          </button>
        </div>
        <p className="text-ungu-muda">Tekan Suap saat sendok disodorkan. Hasil percobaan muncul 12 detik kemudian. Hasil diterima/menolak dinilai engine (A2.2); tabel ini mencatat angka mentahnya.</p>

        {statistik && (
          <p className="font-mono">
            Lama buka (uji sendok, n={statistik.n}): min {statistik.min.toFixed(2)} · median {statistik.median.toFixed(2)} · p90 {statistik.p90.toFixed(2)} detik → usulan batasBukaDetik {statistik.usulanBatas}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono tabular-nums">
            <thead className="text-ungu-muda">
              <tr>{["#", "Uji", "Penguji", "Lama buka (s)", "Mulut maks", "Yaw min", "Yaw maks", "Siklus kunyah", "Hilang (s)"].map((h) => <th key={h} className="py-1 pr-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {log.map((p) => (
                <tr key={p.no} className="border-t border-garis">
                  <td className="py-1 pr-3">{p.no}</td>
                  <td className="py-1 pr-3 font-sans">{p.uji}</td>
                  <td className="py-1 pr-3 font-sans">{p.penguji}</td>
                  <td className="py-1 pr-3">{p.lamaBukaDetik.toFixed(2)}</td>
                  <td className="py-1 pr-3">{p.mulutMaks.toFixed(2)}</td>
                  <td className="py-1 pr-3">{p.yawMin.toFixed(1)}</td>
                  <td className="py-1 pr-3">{p.yawMaks.toFixed(1)}</td>
                  <td className="py-1 pr-3">{p.siklusKunyah}</td>
                  <td className="py-1 pr-3">{p.hilangDetik.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
