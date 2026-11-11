// Pemilik: B (Satya). Komponen beranda (UI UX 9.12): KartuTahap, StikerMinggu, JalurPaparan, LabelAI (9.13).
import { STIKER } from "../../bersama/konten/makanan.ts";
import { HARI_SEN_MIN } from "../halaman/keluarga/bantu.ts";
import { Kartu } from "./dasar.tsx";

export function KartuTahap({ tahap, kalimat }: { tahap: number; kalimat: string }) {
  return (
    <Kartu className="flex flex-col gap-3">
      <div className="flex items-start gap-4">
        <span className="font-judul text-[40px] leading-none font-bold tabular-nums">{tahap}</span>
        <div>
          <h2 className="font-judul text-subjudul font-bold">Tahap {tahap}</h2>
          <p className="text-isi text-ungu-muda">{kalimat}</p>
        </div>
      </div>
      <div className="flex gap-2" aria-label={`Tahap ${tahap} dari 4`}>
        {[1, 2, 3, 4].map((t) => (
          <span key={t} className={`size-3 rounded-full ${t <= tahap ? "bg-ungu" : "border-2 border-ungu-muda"}`} />
        ))}
      </div>
    </Kartu>
  );
}

export function StikerMinggu({ terisi }: { terisi: boolean[] }) {
  const hariIni = (new Date().getDay() + 6) % 7;
  return (
    <section aria-label="Stiker minggu ini">
      <h2 className="mb-2 text-isi font-semibold">Stiker minggu ini</h2>
      <ol className="flex justify-between gap-1 sm:justify-start sm:gap-2">
        {HARI_SEN_MIN.map((h, i) => (
          <li key={h} className="flex flex-col items-center gap-1">
            {terisi[i] ? (
              <img src={STIKER[i % STIKER.length]} alt={`${h}: dapat stiker`} className="size-10" />
            ) : (
              <span className="size-10 rounded-full border-2 border-dashed border-ungu-muda" aria-label={`${h}: belum`} />
            )}
            <span className="text-[13px] text-ungu-muda">{h}</span>
            <span className={`size-1.5 rounded-full ${i === hariIni ? "bg-jagung" : "bg-transparent"}`} />
          </li>
        ))}
      </ol>
    </section>
  );
}

export function JalurPaparan({ nama, jumlah, target = 10 }: { nama: string; jumlah: number; target?: number }) {
  return (
    <Kartu className="flex flex-col gap-3">
      <p className="text-isi font-semibold">
        {nama} <span className="tabular-nums">{Math.min(jumlah, target)}/{target}</span>
      </p>
      <ol className="flex items-center" aria-label={`${nama} dicoba ${jumlah} dari ${target} kali`}>
        {Array.from({ length: target }, (_, i) => (
          <li key={i} className="flex flex-1 items-center last:flex-none">
            <span className={`size-6 shrink-0 rounded-full border-2 ${i < jumlah ? "border-ungu bg-ungu" : i === jumlah ? "border-ungu" : "border-ungu-muda/60"}`} />
            {i < target - 1 && <span className={`h-0.5 flex-1 ${i < jumlah - 1 ? "bg-ungu" : "bg-ungu-muda/40"}`} />}
          </li>
        ))}
      </ol>
    </Kartu>
  );
}

export function LabelAI({ sumber }: { sumber: "ai" | "cache" | "template" }) {
  const lencana = sumber === "ai" ? "AI" : sumber === "cache" ? "AI (tersimpan)" : "Ringkasan otomatis";
  return (
    <p className="flex flex-wrap items-center gap-2 text-[13px] text-ungu-muda">
      <span>{sumber === "template" ? "Ringkasan otomatis dari data sesi" : "Dibuat oleh AI dari data sesi"}</span>
      <span className="inline-flex h-6 items-center rounded-full border border-ungu-muda px-3">{lencana}</span>
    </p>
  );
}
