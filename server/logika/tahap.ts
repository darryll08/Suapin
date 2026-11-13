import type { Aturan } from "../../bersama/kontrak/aturan"

/** Sesi dihitung bagus bila >= persen% suapan diterima dari minimal sekian suapan ditawarkan (bukan 1 dari 1). */
export const MIN_DITAWARKAN = 5

type SesiTahap = { stage: number; diterima: number; ditolak: number }

/**
 * Naik tahap = cukup paparan (minimal sesi di tahap ini) DAN stabil (`streak` sesi terakhir berturut-turut bagus).
 * Dasar: paparan berulang 8–10 kali; pola kriteria penguasaan "N% selama beberapa sesi berturut-turut" di terapi
 * makan berbasis perilaku. Ambang 70% = asumsi desain untuk konteks rumah, dapat diatur dokter.
 * `sesiTerakhir` urut terbaru dulu.
 */
export function cekNaikTahap(sesiTerakhir: readonly SesiTahap[], aturan: Aturan) {
  const tahapIni = sesiTerakhir.filter((sesi) => sesi.stage === aturan.stage)
  const { sessions, first_stage_sessions, percent, streak } = aturan.advance_rule
  const bagus = (s: SesiTahap) =>
    s.diterima + s.ditolak >= MIN_DITAWARKAN && s.diterima * 100 >= percent * (s.diterima + s.ditolak)
  let berturut = 0
  while (berturut < tahapIni.length && bagus(tahapIni[berturut])) berturut++
  const sesi_target = aturan.stage === 1 ? first_stage_sessions : sessions
  const siapNaik = aturan.stage < 4 && tahapIni.length >= sesi_target && berturut >= streak
  const calonTurun = tahapIni.slice(0, 3)
  return {
    siapNaik,
    saranTurun: aturan.stage > 1 && calonTurun.length === 3 && calonTurun.every((sesi) => sesi.diterima === 0),
    progres: aturan.stage >= 4 ? null : {
      sesi: tahapIni.length, sesi_target, streak: Math.min(berturut, streak), streak_target: streak,
      persen_target: percent, diterima: tahapIni.reduce((n, s) => n + s.diterima, 0), siap_naik: siapNaik,
      min_ditawarkan: MIN_DITAWARKAN,
      sesi_terakhir: tahapIni.slice(0, streak).map((s) => ({ diterima: s.diterima, ditawarkan: s.diterima + s.ditolak, bagus: bagus(s) })),
    },
  }
}
