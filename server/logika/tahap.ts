import type { Aturan } from "../../bersama/kontrak/aturan"

export function cekNaikTahap(
  sesiTerakhir: readonly { stage: number; diterima: number }[],
  aturan: Aturan,
) {
  const tahapIni = sesiTerakhir.filter((sesi) => sesi.stage === aturan.stage)
  const { sessions, min_accepted_bites } = aturan.advance_rule
  const calonNaik = tahapIni.slice(0, sessions)
  const calonTurun = tahapIni.slice(0, 3)
  return {
    siapNaik: aturan.stage < 4 && calonNaik.length === sessions &&
      calonNaik.every((sesi) => sesi.diterima >= min_accepted_bites),
    saranTurun: aturan.stage > 1 && calonTurun.length === 3 &&
      calonTurun.every((sesi) => sesi.diterima === 0),
  }
}
