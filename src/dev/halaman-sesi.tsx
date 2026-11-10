// Pemilik: A (Darryl). /dev/sesi: satu sesi penuh dari engine dengan tampilan angka (A2.3).
// Query: ?sumber=kamera|slider|rekaman:<nama>|tanpa (default rekaman:contoh), ?tahap=1..4, ?sisi=kiri|kanan.
// Layar sungguhan (karakter, suara) dibangun B di /sesi memakai hook yang sama.
import { useRef, useState } from "react";
import { useSearchParams } from "react-router";
import type { Tombol } from "../mesin/sesi.ts";
import { useSesiMakan } from "../mesin/use-sesi-makan.ts";
import { PanelSlider } from "./panel-slider.tsx";
import { bacaJenisSumber } from "./sinyal-palsu.ts";

const TOMBOL: [Tombol, string][] = [
  ["suap", "Suap"], ["lanjut", "Lanjut"], ["ya", "Ya"], ["tidak", "Tidak"], ["lewati_pemanasan", "Lewati pemanasan"],
  ["koreksi_diterima", "Tadi diterima"], ["koreksi_ditolak", "Tadi ditolak"], ["stop", "Stop"], ["darurat", "Darurat"],
];

export function HalamanSesi() {
  const [param] = useSearchParams();
  const nilai = param.get("sumber") ?? "rekaman:contoh";
  const jenis = nilai === "tanpa" ? null : bacaJenisSumber(nilai);
  const tahap = Math.min(4, Math.max(1, Number(param.get("tahap")) || 1));
  const sisi = param.get("sisi") === "kiri" ? "kiri" : "kanan";
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mulai, setMulai] = useState(false);

  const sesi = useSesiMakan({
    aturan: { max_minutes: 30, end_after_refusal_minutes: 15, stage: tahap, ngemut_hint: "Tunggu sebentar, tawarkan minum sedikit, jangan dipaksa menelan" },
    sisiPengasuh: sisi,
    sumber: jenis,
    video: videoRef,
    anak: { child_id: "anak-uji", menu: "brokoli", makanan_baru: true },
  });
  const v = sesi.tampilan;
  const tombol = "min-h-12 rounded-2xl border border-ungu-muda bg-permukaan px-4 text-kecil font-semibold disabled:opacity-40";

  return (
    <main className="mx-auto grid max-w-4xl gap-4 p-4 text-ungu">
      <div>
        <h1 className="text-subjudul font-bold">Uji sesi</h1>
        <p className="text-kecil text-ungu-muda">
          Sumber <code>{nilai}</code> · tahap {tahap} · pengasuh di {sisi} · ganti lewat query <code>?sumber=&amp;tahap=&amp;sisi=</code>
        </p>
      </div>

      {jenis?.jenis === "kamera" && (
        <video ref={videoRef} className="aspect-[4/3] w-64 rounded-2xl bg-ungu-tint object-cover" style={{ transform: "scaleX(-1)" }} muted playsInline
          aria-label="Pratinjau kamera" onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            sesi.pilihWajahDiTitik((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
          }} />
      )}
      {sesi.slider && <PanelSlider sumber={sesi.slider} />}
      {sesi.galat && (
        <p role="alert" className="rounded-xl border-l-4 border-jagung bg-jagung-muda p-3 text-kecil text-jagung-tua">
          {sesi.galat} Sesi lanjut tanpa kamera: hasil suapan dari tombol Ya/Tidak.
        </p>
      )}

      {!mulai ? (
        <button type="button" className="min-h-14 justify-self-start rounded-2xl bg-ungu px-6 text-tombol font-semibold text-latar"
          onClick={() => { setMulai(true); void sesi.mulai(); }}>
          Mulai sesi
        </button>
      ) : (
        <div className="flex flex-wrap gap-2">
          {TOMBOL.map(([t, label]) => (
            <button key={t} type="button" className={tombol} disabled={!v || v.status === "SELESAI"} onClick={() => sesi.tekan(t)}>{label}</button>
          ))}
          <button type="button" className={tombol} disabled={v?.status !== "PEMANASAN"} onClick={sesi.selesaiPemanasan}>Pemanasan selesai</button>
        </div>
      )}

      {v && (
        <section className="grid gap-2 rounded-2xl border border-ungu-muda/25 bg-permukaan p-4 text-kecil">
          <p className="text-subjudul font-bold">{v.status}</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono tabular-nums">
            {([
              ["pose", v.pose], ["layar", v.layar], ["makananTahap", String(v.makananTahap)],
              ["teks", v.teks ? `${v.teks.id}${v.teks.tanya ? " (tanya)" : ""}` : "-"],
              ["klip", v.klip ? `${v.klip.id} #${v.klip.nonce}` : "-"],
              ["detikBerjalan", v.detikBerjalan.toFixed(1)], ["tahap", String(v.tahap)], ["fps", sesi.fps.toFixed(1)],
            ] as const).map(([k, isi]) => (
              <div key={k} className="contents"><dt className="font-sans text-ungu-muda">{k}</dt><dd>{isi}</dd></div>
            ))}
          </dl>
          <div className="grid grid-cols-[6rem_1fr] items-center gap-2">
            <span>mulutKarakter</span>
            <div className="h-3 rounded-full bg-ungu-tint"><div className="h-3 rounded-full bg-jagung" style={{ width: `${Math.round(v.mulutKarakter * 100)}%` }} /></div>
          </div>
          <p>Suapan: {v.gigitan.length ? v.gigitan.map((g) => `${g.detik}s ${g.hasil}${g.dikoreksi ? "*" : ""}`).join(" · ") : "-"}</p>
        </section>
      )}

      {sesi.hasil && (
        <section className="grid gap-2 text-kecil">
          <h2 className="font-bold">Hasil untuk POST /api/sessions</h2>
          <pre className="overflow-x-auto rounded-2xl bg-ungu-tint p-3">{JSON.stringify(sesi.hasil, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}
