import { afterAll, beforeAll, expect, it } from "vitest"
import { API } from "../../bersama/kontrak/api"
import { buatApp } from "../../server/app"
import { DIKA } from "../../server/db/seed"
import { bantu } from "./bantu"

let uji: Awaited<ReturnType<typeof bantu>>
beforeAll(async () => { uji = await bantu() })
afterAll(() => uji?.tutup())

it("semua rute yang butuh peran menolak request tanpa cookie", async () => {
  for (const e of Object.values(API)) {
    if (e.akses !== "keluarga" && e.akses !== "dokter" && e.akses !== "keluarga_atau_dokter") continue
    const res = await uji.req(e.path.replace(/:\w+/g, "contoh"), e.metode)
    expect(res.status, e.path).toBe(401)
  }
})

it("menolak lintas keluarga, dokter lain, dan cookie yang diubah", async () => {
  const token = await (await uji.sebagai(uji.dika)("/api/reports/share", "POST")).json()
  expect((await uji.sebagai(uji.dokter)("/api/clinic/claim/" + token.token, "POST")).status).toBe(200)
  expect((await uji.sebagai(uji.nara)("/api/children/" + DIKA + "/report")).status).toBe(404)
  expect((await uji.sebagai(uji.lain)("/api/clinic/patients/" + DIKA)).status).toBe(404)
  expect((await uji.sebagai(uji.lain)("/api/clinic/claim/" + token.token, "POST")).status).toBe(409)
  expect((await uji.sebagai(uji.dika.replace("tm_keluarga=", "tm_keluarga=X"))("/api/saya")).status).toBe(401)
})

it("menolak data kamera di tingkat payload dan gigitan", async () => {
  const mulai = new Date().toISOString()
  const data = { child_id: DIKA, menu: "umum", makanan_baru: false, mulai, selesai: mulai,
    durasi_detik: 0, tahap: 1, alasan_selesai: "stop", gigitan: [] }
  for (const body of [{ ...data, landmark: [0] },
    { ...data, gigitan: [{ detik: 0, hasil: "diterima", dikoreksi: false, landmark: [0] }] }]) {
    expect((await uji.sebagai(uji.dika)("/api/sessions", "POST", body)).status).toBe(400)
  }
})

it("demo tidak aktif saat dimatikan", async () => {
  const app = buatApp({ ...uji.env, DEMO: "0" }, uji.db)
  expect((await app.request("/api/demo/reset", { method: "POST" })).status).toBe(404)
})

it("menolak kode keluarga salah dan menyamakan galat login dokter", async () => {
  const keluarga = await uji.req("/api/masuk", "POST", { kode_akses: "KODETIDAKADA" })
  expect(keluarga.status).toBe(401)

  const kata_sandi = crypto.randomUUID()
  const login = (email: string) => uji.req("/api/clinic/login", "POST", { email, kata_sandi })
  const [sandiSalah, emailSalah] = await Promise.all([login("dokter@demo.test"), login("tidak-ada@demo.test")])
  expect(sandiSalah.status).toBe(401)
  expect(emailSalah.status).toBe(401)
  expect(await sandiSalah.json()).toEqual(await emailSalah.json())
})
