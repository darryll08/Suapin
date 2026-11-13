// Pemilik: B (Satya). Komponen beranda dan laporan, gaya bento (inspo 11 Nov):
// KartuHero, KartuAngka, GrafikPil, CincinProgres, LabelAI. Tanpa merah; nilai kosong/ditolak memakai arsiran.
import type { ReactNode } from "react";
import { STIKER } from "../../bersama/konten/makanan.ts";
import { bento } from "../gaya/gaya.ts";

/** Kartu utama ubi ungu: tahap aktif + aksi. Teks nasi di atas ungu 11,9:1. */
export function KartuHero({ tahap, kalimat, children }: { tahap: number; kalimat: string; children?: ReactNode }) {
  return (
    <section className="flex flex-col gap-5 rounded-bento bg-ungu p-6 text-latar">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-kecil font-semibold text-latar/80">Program lepas layar</p>
          <h2 className="font-judul text-judul font-bold">Tahap {tahap}</h2>
          <p className="text-isi text-latar/90">{kalimat}</p>
        </div>
        <span className="font-judul text-raksasa font-bold tabular-nums text-jagung" aria-hidden="true">{tahap}</span>
      </div>
      <div className="flex gap-1.5" role="img" aria-label={`Tahap ${tahap} dari 4`}>
        {[1, 2, 3, 4].map((t) => (
          <span key={t} className={`h-2 flex-1 rounded-full ${t <= tahap ? "bg-jagung" : "bg-latar/25"}`} />
        ))}
      </div>
      {children}
    </section>
  );
}

/** Angka besar + label kecil. */
export function KartuAngka({ label, angka, satuan, ket }: { label: string; angka: string | number; satuan?: string; ket?: string }) {
  return (
    <section className={`${bento} flex flex-col gap-1`}>
      <p className="text-kecil font-semibold text-ungu-muda">{label}</p>
      <p className="font-judul text-angka font-bold tabular-nums">
        {angka}{satuan && <span className="ml-1 text-isi font-semibold text-ungu-muda">{satuan}</span>}
      </p>
      {ket && <p className="text-kecil text-ungu-muda">{ket}</p>}
    </section>
  );
}

export type BatangPil = { label: string; diterima: number; ditolak: number; ada: boolean; sorot?: boolean; stiker?: boolean };

/**
 * Grafik bar berbentuk pil. Bagian bawah ubi ungu = diterima, bagian atas arsiran = ditolak,
 * pil putus-putus pendek = hari tanpa sesi. Warna bukan satu-satunya pembeda (arsiran + legenda).
 */
export function GrafikPil({ batang, judul, tampilDitolak = true, tinggi = 140 }: {
  batang: BatangPil[]; judul: string; tampilDitolak?: boolean; tinggi?: number;
}) {
  const maks = Math.max(1, ...batang.map((b) => b.diterima + (tampilDitolak ? b.ditolak : 0)));
  const ringkas = batang.map((b) => `${b.label}: ${b.ada ? `${b.diterima} diterima${tampilDitolak ? `, ${b.ditolak} ditolak` : ""}` : "tanpa sesi"}`).join("; ");
  const rapat = batang.length > 7;
  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="sr-only">{judul}. {ringkas}</figcaption>
      <div className={`flex items-end justify-between ${rapat ? "gap-1" : "gap-2"}`} style={{ height: tinggi }} aria-hidden="true">
        {batang.map((b, i) => {
          const total = b.diterima + (tampilDitolak ? b.ditolak : 0);
          const h = b.ada ? Math.max(24, (total / maks) * tinggi) : 24;
          const hTerima = b.ada && total > 0 ? (b.diterima / total) * h : 0;
          return (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              {b.sorot && b.ada && <span className="text-kecil font-bold tabular-nums">{b.diterima}</span>}
              <div className={`flex w-full ${b.ada ? "max-w-9" : "max-w-6"} flex-col overflow-hidden rounded-full ${b.ada ? (tampilDitolak && b.ditolak ? "arsir border border-ungu-muda" : "") : "border-2 border-dashed border-ungu-muda"} ${b.sorot ? "ring-2 ring-jagung-tua ring-offset-2 ring-offset-permukaan" : ""}`}
                style={{ height: h }}>
                <span className="mt-auto block w-full rounded-full bg-ungu" style={{ height: hTerima }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className={`flex justify-between ${rapat ? "gap-1" : "gap-2"}`} aria-hidden="true">
        {batang.map((b, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            {b.stiker !== undefined && (
              b.stiker
                ? <img src={STIKER[i % STIKER.length]} alt="" className="size-7" />
                : <span className="size-7 rounded-full border-2 border-dashed border-ungu-muda" />
            )}
            <span className={`text-kecil ${b.sorot ? "font-bold text-ungu" : "text-ungu-muda"}`}>{b.label}</span>
          </div>
        ))}
      </div>
      {tampilDitolak && (
        <div className="flex flex-wrap gap-4 text-kecil text-ungu-muda" aria-hidden="true">
          <span className="inline-flex items-center gap-2"><span className="size-3 rounded-full bg-ungu" />Diterima</span>
          <span className="inline-flex items-center gap-2"><span className="arsir size-3 rounded-full border border-ungu-muda" />Ditolak</span>
          <span className="inline-flex items-center gap-2"><span className="size-3 rounded-full border-2 border-dashed border-ungu-muda" />Tanpa sesi</span>
        </div>
      )}
    </figure>
  );
}

/** Cincin progres (mis. makanan baru dicoba 4/10). */
export function CincinProgres({ nilai, target, label, ket = "kali dicoba" }: { nilai: number; target: number; label: string; ket?: string }) {
  const r = 34, k = 2 * Math.PI * r;
  const isi = Math.min(1, nilai / target);
  return (
    <section className={`${bento} flex flex-col gap-2`}>
      <p className="text-kecil font-semibold text-ungu-muda">{label}</p>
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 84 84" className="size-21 shrink-0 -rotate-90" role="img" aria-label={`${label}: ${nilai} dari ${target}, ${ket}`}>
          <circle cx="42" cy="42" r={r} fill="none" stroke="var(--color-ungu-tint)" strokeWidth="10" />
          <circle cx="42" cy="42" r={r} fill="none" stroke="var(--color-ungu)" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${k * isi} ${k}`} />
        </svg>
        <p className="font-judul text-tampilan leading-none font-bold tabular-nums">
          {Math.min(nilai, target)}<span className="text-isi text-ungu-muda">/{target}</span>
        </p>
      </div>
      <p className="text-kecil text-ungu-muda">{ket}</p>
    </section>
  );
}

export function LabelAI({ sumber }: { sumber: "ai" | "cache" | "template" }) {
  const lencana = sumber === "ai" ? "AI" : sumber === "cache" ? "AI (tersimpan)" : "Ringkasan otomatis";
  return (
    <p className="flex flex-wrap items-center gap-2 text-kecil text-ungu-muda">
      <span>{sumber === "template" ? "Ringkasan otomatis dari data sesi" : "Dibuat oleh AI dari data sesi"}</span>
      <span className="inline-flex h-6 items-center rounded-full border border-ungu-muda px-3">{lencana}</span>
    </p>
  );
}

type Progres = { sesi: number; sesi_target: number; streak: number; streak_target: number; persen_target: number; diterima: number;
  siap_naik: boolean; min_ditawarkan: number; sesi_terakhir: { diterima: number; ditawarkan: number; bagus: boolean }[] };

/** Tracker menuju tahap berikutnya: cukup sesi (paparan) + sesi bagus berturut-turut (>= persen diterima). */
export function TrackerTahap({ tahap, progres, gelap = false }: { tahap: number; progres: Progres | null; gelap?: boolean }) {
  const redup = gelap ? "text-latar/75" : "text-ungu-muda";
  const kosong = gelap ? "bg-latar/20" : "bg-ungu-tint";
  if (!progres) return <p className={`text-kecil ${redup}`}>Tahap terakhir: makan bersama tanpa layar.</p>;
  const persenSesi = Math.min(100, Math.round((progres.sesi / Math.max(1, progres.sesi_target)) * 100));
  // Sesi terakhir, terlama di kiri.
  const sesi = [...progres.sesi_terakhir].reverse();
  return (
    <div className={`grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2.5 rounded-kartu p-4 ${gelap ? "bg-latar/10" : "bg-ungu-tint/50"}`}>
      <p className="col-span-3 text-isi font-bold">{progres.siap_naik ? `Siap naik ke tahap ${tahap + 1}` : `Menuju tahap ${tahap + 1}`}</p>
      <span className={`text-kecil ${redup}`}>Sesi</span>
      <div className={`h-2 rounded-full ${kosong}`}><div className="h-2 rounded-full bg-jagung" style={{ width: `${persenSesi}%` }} /></div>
      <span className="text-kecil font-semibold tabular-nums">{Math.min(progres.sesi, progres.sesi_target)}/{progres.sesi_target}</span>
      <span className={`text-kecil ${redup}`}>≥ {progres.persen_target}%</span>
      <ol className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${progres.streak_target}, minmax(0, 1fr))` }} aria-label={`Sesi terakhir, bagus bila minimal ${progres.persen_target}% suapan diterima`}>
        {Array.from({ length: progres.streak_target }, (_, i) => {
          const x = sesi[i];
          const persen = x && x.ditawarkan > 0 ? Math.round((x.diterima / x.ditawarkan) * 100) : null;
          return (
            <li key={i} title={x ? `${x.diterima}/${x.ditawarkan} suapan` : "belum ada sesi"}
              className={`inline-flex h-6 items-center justify-center rounded-full text-[11px] font-bold tabular-nums ${x?.bagus ? "bg-jagung text-ungu" : `${kosong} ${redup}`}`}>
              {persen === null ? "–" : `${persen}%`}
            </li>
          );
        })}
      </ol>
      <span className="text-kecil font-semibold tabular-nums">{progres.streak}/{progres.streak_target}</span>
    </div>
  );
}

const NAMA_TAHAP_TRACKER = ["Karakter memandu", "Pengasuh jadi contoh", "Layar hitam", "Tanpa layar"];
const tglPendek = (iso: string) => new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

/** Riwayat perjalanan tahap 1–4: selesai, sedang berjalan, belum. */
export function RiwayatTahap({ tahap, riwayat }: { tahap: number; riwayat: { tahap: number; sesi: number; diterima: number; mulai: string; terakhir: string }[] }) {
  return (
    <ol className="flex flex-col gap-2">
      {[1, 2, 3, 4].map((t) => {
        const r = riwayat.find((x) => x.tahap === t);
        const status = t < tahap ? "selesai" : t === tahap ? "sekarang" : "belum";
        return (
          <li key={t} className="flex items-center gap-3">
            <span className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full text-kecil font-bold ${status === "selesai" ? "bg-ungu text-latar" : status === "sekarang" ? "bg-jagung text-ungu" : "bg-ungu-tint text-ungu-muda"}`}>
              {status === "selesai" ? "✓" : t}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className={`text-isi font-semibold ${status === "belum" ? "text-ungu-muda" : ""}`}>Tahap {t} · {NAMA_TAHAP_TRACKER[t - 1]}</span>
              <span className="text-kecil text-ungu-muda">
                {r ? `${tglPendek(r.mulai)}${status === "sekarang" ? " – sekarang" : ` – ${tglPendek(r.terakhir)}`} · ${r.sesi} sesi · ${r.diterima} suapan` : status === "sekarang" ? "Sedang berjalan" : "Belum"}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
