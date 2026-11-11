import { afterAll, beforeAll, expect, it } from "vitest"
import { API } from "../../bersama/kontrak/api"
import type { SesiSelesai } from "../../bersama/kontrak/sesi"
import { bantu } from "./bantu"

let uji: Awaited<ReturnType<typeof bantu>>
beforeAll(async () => { uji = await bantu() })
afterAll(() => uji?.tutup())

it.each([
  { jalur: "mandiri", klinik: false, tahapAkhir: 2 },
  { jalur: "klinik", klinik: true, tahapAkhir: 1 },
])("menerapkan aturan naik tahap di jalur $jalur", async ({ klinik, tahapAkhir }) => {
  const daftar = await uji.req("/api/children", "POST", {
    panggilan: "Anak Uji", tanggal_lahir: "2022-08-01", sapaan: "bu", nama_pengasuh: "Ibu Uji",
  })
  expect(daftar.status).toBe(200)
  const { child_id } = API.anakBuat.res.parse(await daftar.json())
  const keluarga = uji.sebagai(daftar.headers.getSetCookie()[0]!.split(";")[0]!)
  const dokter = uji.sebagai(uji.dokter)
  expect((await keluarga("/api/screenings", "POST", { jawaban: Array(7).fill(false) })).status).toBe(200)

  if (klinik) {
    const bagi = await keluarga("/api/reports/share", "POST")
    const { token } = API.laporanBagikan.res.parse(await bagi.json())
    expect((await dokter("/api/clinic/claim/" + token, "POST")).status).toBe(200)
  }

  const awal = Date.now() - 10 * 60_000
  for (let i = 0; i < 5; i++) {
    const mulai = awal + i * 60_000
    const sesi: SesiSelesai = {
      child_id, menu: "umum", makanan_baru: false, mulai: new Date(mulai).toISOString(),
      selesai: new Date(mulai + 30_000).toISOString(), durasi_detik: 30, tahap: 1, alasan_selesai: "stop",
      gigitan: Array.from({ length: 5 }, (_, detik) => ({ detik, hasil: "diterima", dikoreksi: false })),
    }
    const respons = await keluarga("/api/sessions", "POST", sesi)
    expect(respons.status).toBe(200)
    expect(API.sesiSimpan.res.parse(await respons.json())).toMatchObject({
      naik_tahap: !klinik && i === 4, tahap_baru: i === 4 ? tahapAkhir : 1,
    })
  }

  const idUrl = "/api/children/" + child_id + "/rules"
  expect(await (await keluarga(idUrl)).json()).toMatchObject({ aturan: { stage: tahapAkhir } })
  if (klinik) {
    const detail = await dokter("/api/clinic/patients/" + child_id)
    expect(API.pasienDetail.res.parse(await detail.json())).toMatchObject({
      siap_naik_tahap: true, child: { stage: 1 },
    })
  }
})
