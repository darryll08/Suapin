import { describe, expect, it } from "vitest"
import { ATURAN_DEFAULT } from "../../bersama/kontrak/aturan"
import { cekNaikTahap } from "../../server/logika/tahap"

describe("evaluasi tahap", () => {
  const cukup = Array.from({ length: 5 }, () => ({ stage: 1, diterima: 5 }))
  it("memerlukan lima sesi berturut-turut pada tahap yang sama", () => {
    expect(cekNaikTahap(cukup, ATURAN_DEFAULT).siapNaik).toBe(true)
    expect(cekNaikTahap(cukup.slice(1), ATURAN_DEFAULT).siapNaik).toBe(false)
    expect(cekNaikTahap([{ stage: 1, diterima: 4 }, ...cukup], ATURAN_DEFAULT).siapNaik).toBe(false)
    expect(cekNaikTahap([{ stage: 2, diterima: 8 }, ...cukup.slice(1)], ATURAN_DEFAULT).siapNaik).toBe(false)
  })
  it("membatasi tahap ke empat dan memberi saran setelah tiga sesi kosong", () => {
    expect(cekNaikTahap(cukup.map((sesi) => ({ ...sesi, stage: 4 })), { ...ATURAN_DEFAULT, stage: 4 }).siapNaik).toBe(false)
    const kosong = Array.from({ length: 3 }, () => ({ stage: 2, diterima: 0 }))
    expect(cekNaikTahap(kosong, { ...ATURAN_DEFAULT, stage: 2 }).saranTurun).toBe(true)
  })
})
