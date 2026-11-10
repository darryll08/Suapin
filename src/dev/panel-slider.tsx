// Pemilik: A (Darryl). Panel kendali sumber slider. Dipakai /dev/sinyal dan boleh dipasang B di /sesi?sumber=slider.
import { useState } from "react";
import type { NilaiSlider, SumberSlider } from "./sinyal-palsu.ts";

const RENTANG: { kunci: "mulut" | "rahang" | "yaw"; min: number; max: number; langkah: number }[] = [
  { kunci: "mulut", min: 0, max: 1, langkah: 0.01 },
  { kunci: "rahang", min: -0.1, max: 0.1, langkah: 0.002 },
  { kunci: "yaw", min: -60, max: 60, langkah: 1 },
];

export function PanelSlider({ sumber }: { sumber: SumberSlider }) {
  const [n, setN] = useState<NilaiSlider>(sumber.nilai());
  const ubah = (sebagian: Partial<NilaiSlider>) => {
    sumber.atur(sebagian);
    setN(sumber.nilai());
  };
  const tombol = "min-h-12 rounded-2xl border border-ungu-muda bg-permukaan px-4 text-kecil font-semibold text-ungu";

  return (
    <fieldset className="grid gap-3 rounded-2xl border border-ungu-muda/25 bg-permukaan p-4 text-kecil text-ungu">
      <legend className="px-1 font-semibold">Sinyal palsu</legend>
      {RENTANG.map(({ kunci, min, max, langkah }) => (
        <label key={kunci} className="grid grid-cols-[4rem_1fr_3.5rem] items-center gap-2">
          <span>{kunci}</span>
          <input
            type="range" min={min} max={max} step={langkah} value={n[kunci]}
            onChange={(e) => ubah({ [kunci]: Number(e.target.value) })}
            className="accent-ungu"
          />
          <span className="text-right font-mono tabular-nums">{n[kunci].toFixed(kunci === "yaw" ? 0 : 3)}</span>
        </label>
      ))}
      <div className="flex flex-wrap gap-4">
        {(["nangis", "terlihat"] as const).map((k) => (
          <label key={k} className="flex min-h-12 items-center gap-2">
            <input type="checkbox" checked={n[k]} onChange={(e) => ubah({ [k]: e.target.checked })} className="size-5 accent-ungu" />
            {k}
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={tombol} onClick={() => sumber.bukaTutup()}>Buka-tutup</button>
        <button type="button" className={tombol} onClick={() => sumber.kunyah5Detik()}>Kunyah 5 detik</button>
        <button type="button" className={tombol} onClick={() => ubah({ yaw: -35 })}>Menoleh menjauh</button>
        <button type="button" className={tombol} onClick={() => ubah({ mulut: 0, rahang: 0, yaw: 0, nangis: false, terlihat: true })}>Reset</button>
      </div>
    </fieldset>
  );
}
