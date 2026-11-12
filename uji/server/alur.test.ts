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
    { panggilan: "Uji", tanggal_lahir: "2022-09-01", sapaan: "bu", nama_pengasuh: "Ibu Uji", email: crypto.randomUUID() + "@uji.test", kata_sandi: "sandi-uji-123" })
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
  const laporan = await keluarga("/api/children/" + DIKA + "/report")
  expect(laporan.status).toBe(200)
  expect(API.laporanKeluarga.res.parse(await laporan.json()).sesi.length).toBeGreaterThan(0)
  const share = API.laporanBagikan.res.parse(await (await keluarga("/api/reports/share", "POST")).json())
  expect(share.token).toMatch(/^[\w-]{43}$/)
  const anonim = await (await uji.req("/api" + share.url)).json()
  expect(anonim.child).toEqual({ panggilan: "Dika", usia_bulan: 50 })
  expect(anonim).not.toHaveProperty("pasien_saya")
  expect((await dokter("/api/clinic/claim/" + share.token, "POST")).status).toBe(200)
  expect(await (await dokter("/api/clinic/patients")).json()).toMatchObject({
    dokter_nama: "dr. Demo", pasien: expect.arrayContaining([expect.objectContaining({ id: DIKA })]),
  })
  const teks = contohResep[0]!.teks
  const mock: Llm = async (_nama, skema) => skema.parse({ ...contohResep[0]!.hasil, max_minutes: 60 })
  const teksDiLuarBatas = { teks: teks + " Uji." }
  const invalid = await (await uji.sebagai(uji.dokter, mock)("/api/rules/parse", "POST", teksDiLuarBatas)).json()
  expect(invalid.aturan).not.toHaveProperty("max_minutes")
  expect(invalid.kolom_bermasalah[0].kolom).toBe("max_minutes")
  expect(await (await dokter("/api/rules/parse", "POST", teksDiLuarBatas)).json()).toMatchObject({ sumber: "gagal" })
  const parsed = await (await dokter("/api/rules/parse", "POST", { teks })).json()
  expect(parsed).toMatchObject({ sumber: "cache", aturan: { max_minutes: 20 } })
  const llmValid: Llm = async (_nama, skema, _instruksi, input) => {
    expect(input).toBe("Untuk anak: " + teks)
    return skema.parse(contohResep[0]!.hasil)
  }
  const resepValid = await uji.sebagai(uji.dokter, llmValid)("/api/rules/parse", "POST", { teks: "Untuk Dika: " + teks })
  expect(await resepValid.json()).toMatchObject({ sumber: "ai", aturan: parsed.aturan, kolom_bermasalah: [] })
  expect((await dokter("/api/rules/confirm", "POST", { child_id: DIKA, aturan: parsed.aturan, source_text: teks })).status).toBe(200)
  expect(await (await keluarga("/api/children/" + DIKA + "/rules")).json()).toMatchObject({
    source: "dokter", aturan: { max_minutes: 20 },
  })
  expect(await (await keluarga("/api/saya")).json()).toMatchObject({ child: { plan: "klinik" } })
  const detail = await dokter("/api/clinic/patients/" + DIKA)
  expect(detail.status).toBe(200)
  expect(await detail.json()).toMatchObject({
    dokter_nama: "dr. Demo", riwayat_aturan: [{ source: "dokter" }, { source: "default" }],
  })
  const urlRingkasan = "/api/summaries/" + DIKA
  const ringkasan = await (await dokter(urlRingkasan, "POST")).json()
  expect(ringkasan).toMatchObject({ sumber: "template" })
  expect(await (await dokter(urlRingkasan, "POST")).json()).toEqual(ringkasan)
  expect(await (await dokter("/api/clinic/patients/" + DIKA)).json()).toMatchObject({
    ringkasan_dokter: ringkasan.dokter, ringkasan_sumber: "template",
  })
  expect(await (await uji.req("/api" + share.url)).json()).toMatchObject({
    ringkasan_dokter: ringkasan.dokter, ringkasan_sumber: "template",
  })
})

it("klaim klinik tetap memerlukan skrining sebelum keluarga dapat menyimpan sesi", async () => {
  const daftar = await uji.req("/api/children", "POST",
    { panggilan: "Anak Klinik", tanggal_lahir: "2022-09-01", sapaan: "bu", nama_pengasuh: "Ibu Uji", email: crypto.randomUUID() + "@uji.test", kata_sandi: "sandi-uji-123" })
  const { child_id } = API.anakBuat.res.parse(await daftar.json())
  const keluarga = uji.sebagai(daftar.headers.getSetCookie()[0]!.split(";")[0]!)
  const { token } = API.laporanBagikan.res.parse(await (await keluarga("/api/reports/share", "POST")).json())
  expect((await uji.sebagai(uji.dokter)("/api/clinic/claim/" + token, "POST")).status).toBe(200)
  expect(await (await keluarga("/api/saya")).json()).toMatchObject({
    sesi_dibuka: false, alasan_terkunci: "skrining_belum", child: { plan: "klinik" },
  })
  const waktu = new Date().toISOString()
  expect((await keluarga("/api/sessions", "POST", {
    child_id, menu: "umum", makanan_baru: false, mulai: waktu, selesai: waktu,
    durasi_detik: 0, tahap: 1, alasan_selesai: "stop", gigitan: [],
  })).status).toBe(403)
  expect((await keluarga("/api/screenings", "POST", { jawaban: [true, ...Array(6).fill(false)] })).status).toBe(200)
  expect(await (await keluarga("/api/saya")).json()).toMatchObject({ sesi_dibuka: true, alasan_terkunci: null })
})

it("aktivasi program tercatat di profil keluarga", async () => {
  const keluarga = uji.sebagai(uji.nara)
  const aktivasi = await keluarga("/api/plan/activate", "POST", { paket: "program_30" })
  expect(aktivasi.status).toBe(200)
  expect(await aktivasi.json()).toEqual({ plan: "program" })
  expect(await (await keluarga("/api/saya")).json()).toMatchObject({ child: { plan: "program" } })
})

it("resep memakai cache saat LLM gagal dan menawarkan isian manual bila cache kosong", async () => {
  const gagal: Llm = async () => { throw new Error("Timeout tiruan") }
  const dokter = uji.sebagai(uji.dokter, gagal)
  const tersedia = await dokter("/api/rules/parse", "POST", { teks: contohResep[0]!.teks })
  expect(await tersedia.json()).toMatchObject({ sumber: "cache", aturan: { max_minutes: 20 } })
  const kosong = await dokter("/api/rules/parse", "POST", { teks: "Aturan khusus tanpa contoh cache." })
  expect(await kosong.json()).toMatchObject({ sumber: "gagal", kolom_bermasalah: expect.any(Array) })
})

it("seed idempoten, reset menghapus data latihan dan tetap menyediakan cache", async () => {
  const anakLatihan = await uji.req("/api/children", "POST",
    { panggilan: "Anak Latihan", tanggal_lahir: "2022-09-01", sapaan: "bu", nama_pengasuh: "Ibu Uji", email: crypto.randomUUID() + "@uji.test", kata_sandi: "sandi-uji-123" })
  expect(anakLatihan.status).toBe(200)
  const cookieLatihan = anakLatihan.headers.getSetCookie()[0]!.split(";")[0]!
  const pertama = await jalankanSeed(uji.db, uji.env)
  expect((await jalankanSeed(uji.db, uji.env)).jumlah).toEqual(pertama.jumlah)
  const reset = await uji.req("/api/demo/reset", "POST")
  expect(reset.status).toBe(200)
  expect(await reset.json()).toMatchObject({ jumlah: { children: 14 }, ok: true })
  expect((await uji.sebagai(cookieLatihan)("/api/saya")).status).toBe(401)
  const dikaDemo = await uji.req("/api/demo/masuk", "POST", { sebagai: "keluarga_dika" })
  expect(dikaDemo.status).toBe(204)
  const cookieDika = dikaDemo.headers.getSetCookie().find((cookie) => cookie.startsWith("tm_keluarga="))!.split(";")[0]!
  const sayaDika = await uji.sebagai(cookieDika)("/api/saya")
  expect(await sayaDika.json()).toMatchObject({ child: { id: DIKA, plan: "trial", stage: 1 } })
  expect(await (await uji.sebagai(uji.dokter)("/api/rules/parse", "POST", { teks: contohResep[0]!.teks })).json())
    .toMatchObject({ sumber: "cache" })
  const demo = await uji.req("/api/demo/masuk", "POST", { sebagai: "dokter_demo" })
  expect(demo.status).toBe(204)
  expect(demo.headers.getSetCookie()).toEqual(expect.arrayContaining([
    expect.stringMatching(/^tm_keluarga=;/), expect.stringMatching(/^tm_dokter=.+/),
  ]))
})
