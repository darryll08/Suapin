// Pemilik: B (Satya). Pemanasan (B2.3, UI UX 10.9), ±25 detik tanpa jeda sunyi: kenalan dengan makanan, ajak lihat dan cium,
// (2 kalimat sensorik acak dari bank kata, jadi tiap sesi beda), karakter menggigit, lalu mengajak makan bareng
// dengan nama panggilan anak. Selesai → `onSelesai` (hook A: selesaiPemanasan).
import { useEffect, useRef, useState } from "react";
import type { Pose } from "../../../../bersama/kontrak/sesi.ts";
import type { IdKlip } from "../../../../bersama/konten/klip.ts";
import { Karakter } from "../../../karakter/karakter.tsx";
import type { IdTokoh } from "../../../karakter/tokoh.tsx";
import { putarBerkas, putarKlip } from "../../../suara/pemutar.ts";
import { pilihKata } from "./kata-makanan.ts";
import { urlKata } from "./panel-samping.tsx";

/** `kata` = kalimat sensorik ke-n tentang makanan hari ini (0 atau 1). */
type Babak = { sampai: number; pose: Pose; pegang: boolean; tahap: 0 | 1; klip?: IdKlip; kata?: 0 | 1; nama?: boolean };

/** Detik akhir tiap babak (tabel 10.9, dipadatkan). Klip 1,5-2,9 s (diukur), jadi jeda antar-kalimat ±0,4 s.
 *  Sapa tidak diulang di sini: engine sudah memutar `sapa_awal` saat kalibrasi. */
const BABAK: Babak[] = [
  { sampai: 3.3, pose: "enak", pegang: true, tahap: 0, klip: "kenalan_makanan" },
  { sampai: 6.2, pose: "netral", pegang: true, tahap: 0, kata: 0 },
  { sampai: 9.5, pose: "enak", pegang: true, tahap: 0, klip: "intip_makanan" },
  { sampai: 12.4, pose: "netral", pegang: true, tahap: 0, kata: 1 },
  { sampai: 15.4, pose: "enak", pegang: true, tahap: 0, klip: "cium_wangi" },
  { sampai: 17.8, pose: "menggigit", pegang: false, tahap: 1, klip: "karakter_enak" },
  { sampai: 20.8, pose: "enak", pegang: true, tahap: 1, klip: "berani_coba" },
  { sampai: 24.5, pose: "menunggu", pegang: false, tahap: 1, klip: "ajak_makan_bareng", nama: true },
];
export const LAMA_PEMANASAN_DETIK = BABAK[BABAK.length - 1].sampai;

export function Pemanasan({ makanan, tokoh, panggilan, suara, onSelesai }: {
  makanan: string; tokoh?: IdTokoh; panggilan: string; suara: boolean; onSelesai: () => void;
}) {
  const [detik, setDetik] = useState(0);
  const [kata] = useState(() => {
    const a = pilihKata(makanan, null);
    return [a, pilihKata(makanan, a)] as const;
  });
  useEffect(() => {
    const awal = performance.now();
    const t = window.setInterval(() => setDetik((performance.now() - awal) / 1000), 250);
    return () => window.clearInterval(t);
  }, []);

  const i = Math.max(0, BABAK.findIndex((b) => detik < b.sampai));
  const babak = BABAK[i];
  const selesai = detik >= LAMA_PEMANASAN_DETIK;

  // Tiap babak bersuara sekali saja (StrictMode/HMR menjalankan efek dua kali → dulu klip terdengar dobel).
  const sudah = useRef(-1);
  useEffect(() => {
    if (!suara || sudah.current === i) return;
    sudah.current = i;
    if (babak.klip) putarKlip(babak.klip);
    else if (babak.kata !== undefined) putarBerkas(urlKata(makanan, kata[babak.kata]), kata[babak.kata]);
  }, [i, suara, babak.klip, babak.kata, makanan, kata]);
  useEffect(() => { if (selesai) onSelesai(); }, [selesai, onSelesai]);

  return (
    <div className="karakter-masuk relative size-full">
      {babak.nama && (
        <p className="pudar-masuk absolute inset-x-0 -top-2 z-10 text-center font-judul text-tampilan font-bold sm:text-angka">{panggilan}</p>
      )}
      {babak.kata !== undefined && (
        <p key={babak.kata} className="pudar-masuk absolute inset-x-0 -top-2 z-10 text-center font-judul text-xl font-bold">{kata[babak.kata]}</p>
      )}
      <Karakter pose={babak.pose} mulut={babak.pose === "enak" ? 0.15 : 0} makanan={{ id: makanan, tahap: babak.tahap }}
        pegang={babak.pegang} layar="terang" tokoh={tokoh} />
    </div>
  );
}
