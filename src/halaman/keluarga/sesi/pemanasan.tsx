// Pemilik: B (Satya). Pemanasan (B2.3, UI UX 10.9), versi MVP ±38 detik: karakter kenalan dengan makanan,
// lalu mengajak makan bareng dengan nama panggilan anak. Selesai → `onSelesai` (hook A: selesaiPemanasan).
import { useEffect, useState } from "react";
import type { Pose } from "../../../../bersama/kontrak/sesi.ts";
import { Karakter } from "../../../karakter/karakter.tsx";
import type { IdTokoh } from "../../../karakter/tokoh.tsx";
import { putarKlip } from "../../../suara/pemutar.ts";

type Babak = { sampai: number; pose: Pose; pegang: boolean; tahap: 0 | 1; klip?: "kenalan_makanan" | "karakter_enak" | "ajak_makan_bareng"; nama?: boolean };

/** Detik akhir tiap babak (tabel 10.9, dipadatkan). */
const BABAK: Babak[] = [
  { sampai: 3, pose: "netral", pegang: true, tahap: 0 },
  { sampai: 12, pose: "enak", pegang: true, tahap: 0, klip: "kenalan_makanan" },
  { sampai: 18, pose: "netral", pegang: true, tahap: 0 },
  { sampai: 21, pose: "menggigit", pegang: false, tahap: 1, klip: "karakter_enak" },
  { sampai: 29, pose: "enak", pegang: true, tahap: 1 },
  { sampai: 38, pose: "menunggu", pegang: false, tahap: 1, klip: "ajak_makan_bareng", nama: true },
];
export const LAMA_PEMANASAN_DETIK = BABAK[BABAK.length - 1].sampai;

export function Pemanasan({ makanan, tokoh, panggilan, suara, onSelesai }: {
  makanan: string; tokoh?: IdTokoh; panggilan: string; suara: boolean; onSelesai: () => void;
}) {
  const [detik, setDetik] = useState(0);
  useEffect(() => {
    const awal = performance.now();
    const t = window.setInterval(() => setDetik((performance.now() - awal) / 1000), 250);
    return () => window.clearInterval(t);
  }, []);

  const i = Math.max(0, BABAK.findIndex((b) => detik < b.sampai));
  const babak = BABAK[i];
  const selesai = detik >= LAMA_PEMANASAN_DETIK;

  useEffect(() => {
    if (suara && babak.klip) putarKlip(babak.klip);
  }, [i, suara, babak.klip]);
  useEffect(() => { if (selesai) onSelesai(); }, [selesai, onSelesai]);

  return (
    <div className="karakter-masuk relative size-full">
      {babak.nama && (
        <p className="pudar-masuk absolute inset-x-0 -top-2 z-10 text-center font-judul text-tampilan font-bold sm:text-angka">{panggilan}</p>
      )}
      <Karakter pose={babak.pose} mulut={babak.pose === "enak" ? 0.15 : 0} makanan={{ id: makanan, tahap: babak.tahap }}
        pegang={babak.pegang} layar="terang" tokoh={tokoh} />
    </div>
  );
}
