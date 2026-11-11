import { afterAll, beforeAll, expect, it } from "vitest"
import { eq } from "drizzle-orm"
import { API } from "../../bersama/kontrak/api"
import { DIKA, jalankanSeed } from "../../server/db/seed"
import { session_notes } from "../../server/db/skema"
import type { Llm } from "../../server/llm/klien"
import { contohResep } from "../../server/llm/resep"
import { bantu } from "./bantu"

let uji: Awaited<ReturnType<typeof bantu>>
beforeAll(async () => { uji = await bantu() })
afterAll(() => uji?.tutup())

it("skrining membuka sesi, simpan dan retry tidak menggandakan paparan", async () => {
  const res = await uji.req("/api/children", "POST",
    { panggilan: "Uji", tanggal_lahir: "2022-09-01", sapaan: "bu", nama_pengasuh: "Ibu Uji" })
  expect(res.status).toBe(200)
  const anak = API.anakBuat.res.parse(await res.json())
  const cookie = res.headers.getSetCookie()[0]!.split(";")[0]!
  const keluarga = uji.sebagai(cookie)
  expect(await (await keluarga("/api/saya")).json()).toMatchObject({ alasan_terkunci: "skrining_belum" })
  expect(await (await keluarga("/api/screenings", "POST", { jawaban: [true, ...Array(6).fill(false)] })).json())
    .toMatchObject({ ada_tanda_bahaya: true })
  expect(await (await keluarga("/api/saya")).json()).toMatchObject({ alasan_terkunci: "tanda_bahaya" })
  expect((await keluarga("/api/screenings", "POST", { jawaban: Array(7).fill(false) })).status).toBe(200)
  expect(await (await keluarga("/api/saya")).json()).toMatchObject({ sesi_dibuka: true })
  const waktu = new Date(Math.floor(Date.now() / 1000) * 1000).toISOString()
  const payload = { child_id: anak.child_id, menu: "brokoli", makanan_baru: true, mulai: waktu,
    selesai: waktu, durasi_detik: 0, tahap: 1, alasan_selesai: "stop",
    gigitan: [{ detik: 0, hasil: "diterima", dikoreksi: false }] }
  const pertama = await keluarga("/api/sessions", "POST", payload)
  expect(pertama.status).toBe(200)
  const simpan = API.sesiSimpan.res.parse(await pertama.json())
  expect(simpan.paparan).toEqual({ makanan: "brokoli", jumlah: 1 })
  const waktuTanpaPecahan = waktu.replace(".000Z", "Z")
  const retry = await keluarga("/api/sessions", "POST", { ...payload, mulai: waktuTanpaPecahan })
  expect(await retry.json()).toMatchObject({ session_id: simpan.session_id })
  const urlCatatan = "/api/sessions/" + simpan.session_id + "/notes"
  expect((await keluarga(urlCatatan, "POST", { porsi: "setengah" })).status).toBe(204)
  expect((await keluarga(urlCatatan, "POST", { mood: "biasa" })).status).toBe(204)
  expect(await uji.db.select().from(session_notes).where(eq(session_notes.session_id, simpan.session_id)).get())
    .toMatchObject({ porsi: "setengah", mood: "biasa" })
  expect(await (await keluarga("/api/children/" + anak.child_id + "/report")).json())
    .toMatchObject({ paparan: [{ makanan: "brokoli", jumlah: 1 }], sesi: [{ id: simpan.session_id, durasi: 0 }] })
})

it("bagikan, klaim, baca resep dari cache, konfirmasi, lalu keluarga mendapat aturan dokter", async () => {
  const keluarga = uji.sebagai(uji.dika)
  const dokter = uji.sebagai(uji.dokter)
  const share = API.laporanBagikan.res.parse(await (await keluarga("/api/reports/share", "POST")).json())
  expect(share.token).toMatch(/^[\w-]{43}$/)
  const anonim = await (await uji.req("/api" + share.url)).json()
  expect(anonim.child).toEqual({ panggilan: "Dika", usia_bulan: 50 })
  expect(anonim).not.toHaveProperty("pasien_saya")
  expect((await dokter("/api/clinic/claim/" + share.token, "POST")).status).toBe(200)
  expect(await (await dokter("/api/clinic/patients")).json()).toMatchObject({ pasien: [{ id: DIKA }] })
  const teks = contohResep[0]!.teks
  const mock: Llm = async (_nama, skema) => skema.parse({ ...contohResep[0]!.hasil, max_minutes: 60 })
  const invalid = await (await uji.sebagai(uji.dokter, mock)("/api/rules/parse", "POST", { teks: teks + " Uji." })).json()
  expect(invalid.aturan).not.toHaveProperty("max_minutes")
  expect(invalid.kolom_bermasalah[0].kolom).toBe("max_minutes")
  const parsed = await (await dokter("/api/rules/parse", "POST", { teks })).json()
  expect(parsed).toMatchObject({ sumber: "cache", aturan: { max_minutes: 20 } })
  expect((await dokter("/api/rules/confirm", "POST", { child_id: DIKA, aturan: parsed.aturan, source_text: teks })).status).toBe(200)
  expect(await (await keluarga("/api/children/" + DIKA + "/rules")).json()).toMatchObject({
    source: "dokter", aturan: { max_minutes: 20 },
  })
  expect(await (await keluarga("/api/saya")).json()).toMatchObject({ child: { plan: "klinik" } })
  const detail = await dokter("/api/clinic/patients/" + DIKA)
  expect(detail.status).toBe(200)
  expect(await detail.json()).toMatchObject({ riwayat_aturan: [{ source: "dokter" }, { source: "default" }] })
  expect(await (await dokter("/api/summaries/" + DIKA, "POST")).json()).toMatchObject({ sumber: "template" })
})

it("seed idempoten, reset menghapus data latihan dan tetap menyediakan cache", async () => {
  const pertama = await jalankanSeed(uji.db, uji.env)
  expect((await jalankanSeed(uji.db, uji.env)).jumlah).toEqual(pertama.jumlah)
  const reset = await uji.req("/api/demo/reset", "POST")
  expect(reset.status).toBe(200)
  expect(await reset.json()).toMatchObject({ jumlah: { children: 3 }, ok: true })
  expect(await (await uji.sebagai(uji.dokter)("/api/rules/parse", "POST", { teks: contohResep[0]!.teks })).json())
    .toMatchObject({ sumber: "cache" })
  const demo = await uji.req("/api/demo/masuk", "POST", { sebagai: "dokter_demo" })
  expect(demo.status).toBe(204)
  expect(demo.headers.getSetCookie()).toEqual(expect.arrayContaining([
    expect.stringMatching(/^tm_keluarga=;/), expect.stringMatching(/^tm_dokter=.+/),
  ]))
})
