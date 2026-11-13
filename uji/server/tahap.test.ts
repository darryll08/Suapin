import { describe, expect, it } from "vitest"
import { ATURAN_DEFAULT } from "../../bersama/kontrak/aturan"
import { cekNaikTahap } from "../../server/logika/tahap"

const s = (diterima: number, ditolak: number, stage = 1) => ({ stage, diterima, ditolak })

describe("evaluasi tahap", () => {
  it("tahap 1 butuh 8 sesi dan 3 sesi terakhir berturut-turut >= 70%", () => {
    const bagus = Array.from({ length: 8 }, () => s(7, 3))
    expect(cekNaikTahap(bagus, ATURAN_DEFAULT).siapNaik).toBe(true)
    expect(cekNaikTahap(bagus.slice(1), ATURAN_DEFAULT).siapNaik).toBe(false) // baru 7 sesi
    expect(cekNaikTahap([s(5, 5), ...bagus], ATURAN_DEFAULT).siapNaik).toBe(false) // terakhir 50% memutus streak
    expect(cekNaikTahap([s(3, 0), s(7, 3), s(7, 3), ...bagus], ATURAN_DEFAULT).siapNaik).toBe(false) // 3 dari 3 < 5 ditawarkan
  })
  it("akumulasi: sesi lama yang buruk tidak menghalangi bila streak terbaru bagus", () => {
    const riwayat = [s(8, 2), s(7, 3), s(9, 1), ...Array.from({ length: 6 }, () => s(2, 8))]
    const h = cekNaikTahap(riwayat, ATURAN_DEFAULT)
    expect(h.siapNaik).toBe(true)
    expect(h.progres).toMatchObject({ sesi: 9, sesi_target: 8, streak: 3, streak_target: 3, diterima: 36 })
  })
  it("tahap 2 memakai minimal sesi tahap 2-3, tahap 4 tanpa progres, saran turun setelah 3 sesi kosong", () => {
    const lima = Array.from({ length: 5 }, () => s(8, 2, 2))
    expect(cekNaikTahap(lima, { ...ATURAN_DEFAULT, stage: 2 }).siapNaik).toBe(true)
    expect(cekNaikTahap(lima.map((x) => ({ ...x, stage: 4 })), { ...ATURAN_DEFAULT, stage: 4 })).toMatchObject({ siapNaik: false, progres: null })
    const kosong = Array.from({ length: 3 }, () => s(0, 5, 2))
    expect(cekNaikTahap(kosong, { ...ATURAN_DEFAULT, stage: 2 }).saranTurun).toBe(true)
  })
})
