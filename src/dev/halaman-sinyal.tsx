// Pemilik: A (Darryl). /dev/sinyal: menjalankan sumber palsu (slider atau rekaman) dan menampilkan sinyal + status kunyah.
// Dipakai B untuk mengembangkan karakter tanpa kamera, dan oleh A untuk memeriksa rekaman gerbang.
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import type { Sinyal } from "../../bersama/kontrak/sinyal.ts";
import { bacaAmbang } from "../mesin/ambang.ts";
import { kunyahAwal, langkahKunyah } from "../mesin/kunyah.ts";
import { PanelSlider } from "./panel-slider.tsx";
import { DAFTAR_REKAMAN, GETAR_PALSU, bacaJenisSumber, sumberRekaman, sumberSlider } from "./sinyal-palsu.ts";

export function HalamanSinyal() {
  const [param, setParam] = useSearchParams();
  const jenis = bacaJenisSumber(param.get("sumber") ?? "slider");
  const kunciSumber = jenis.jenis === "rekaman" ? `rekaman:${jenis.nama}` : "slider";
  const slider = useMemo(() => sumberSlider(), []);
  const terakhir = useRef<{ s: Sinyal | null; aktif: boolean }>({ s: null, aktif: false });
  const [tampil, setTampil] = useState<{ s: Sinyal | null; aktif: boolean }>({ s: null, aktif: false });
  const [putaran, setPutaran] = useState(0);
  const [galat, setGalat] = useState("");

  useEffect(() => {
    const ambang = bacaAmbang();
    let k = kunyahAwal();
    const j = bacaJenisSumber(kunciSumber);
    const sumber = j.jenis === "rekaman" ? sumberRekaman(DAFTAR_REKAMAN[j.nama]) : slider;
    sumber
      .mulai((s) => {
        const h = langkahKunyah(k, s, GETAR_PALSU, ambang);
        k = h.k;
        terakhir.current = { s, aktif: h.aktif };
      })
      .catch((e: unknown) => setGalat(e instanceof Error ? e.message : String(e)));
    const interval = window.setInterval(() => setTampil({ ...terakhir.current }), 100);
    return () => {
      sumber.berhenti();
      window.clearInterval(interval);
    };
    // `putaran` memutar ulang rekaman dari awal.
  }, [kunciSumber, putaran, slider]);

  const s = tampil.s;
  const bar = (v: number, maks: number) => `${Math.round(Math.min(1, Math.abs(v) / maks) * 100)}%`;
  const pilihan = ["slider", ...Object.keys(DAFTAR_REKAMAN).map((n) => `rekaman:${n}`)];

  return (
    <main className="mx-auto grid max-w-3xl gap-4 p-4 text-ungu">
      <div>
        <h1 className="text-subjudul font-bold">Sinyal palsu</h1>
        <p className="text-kecil text-ungu-muda">Sumber yang sama bisa dipakai di sesi: <code>/sesi?sumber={kunciSumber}</code></p>
      </div>
      <label className="grid gap-1 text-kecil">
        <span className="font-medium text-ungu-muda">Sumber</span>
        <select
          className="min-h-12 rounded-xl border border-ungu-muda bg-permukaan px-3"
          value={kunciSumber}
          onChange={(e) => setParam({ sumber: e.target.value })}
        >
          {pilihan.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </label>

      {galat && <p role="alert" className="rounded-xl border-l-4 border-jagung bg-jagung-muda p-3 text-kecil text-jagung-tua">{galat}</p>}
      {jenis.jenis === "slider" ? (
        <PanelSlider sumber={slider} />
      ) : (
        <button type="button" className="min-h-12 justify-self-start rounded-2xl bg-ungu px-4 font-semibold text-latar" onClick={() => setPutaran((p) => p + 1)}>
          Putar ulang rekaman
        </button>
      )}

      <section className="grid gap-2 rounded-2xl border border-ungu-muda/25 bg-permukaan p-4 text-kecil" aria-live="off">
        {([["mulut", s?.mulut ?? 0, 1], ["rahang", s?.rahang ?? 0, 0.1], ["yaw", s?.yaw ?? 0, 60]] as const).map(([k, v, maks]) => (
          <div key={k} className="grid grid-cols-[4rem_1fr_4rem] items-center gap-2">
            <span>{k}</span>
            <div className="h-3 rounded-full bg-ungu-tint">
              <div className="h-3 rounded-full bg-jagung" style={{ width: bar(v, maks) }} />
            </div>
            <span className="text-right font-mono tabular-nums">{v.toFixed(k === "yaw" ? 1 : 3)}</span>
          </div>
        ))}
        <p className="font-mono">
          terlihat: {String(s?.terlihat ?? false)} · nangis: {String(s?.nangis ?? false)} · kunyah aktif: {tampil.aktif ? "ya" : "tidak"}
        </p>
      </section>
    </main>
  );
}
