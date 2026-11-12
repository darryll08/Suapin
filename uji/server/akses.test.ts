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
    if (e.akses === "publik" || e.akses === "token" || e.akses === "demo") continue
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

it("menyamakan galat login untuk sandi salah dan email tidak dikenal", async () => {
  const kata_sandi = crypto.randomUUID()
  const login = (email: string) => uji.req("/api/masuk", "POST", { email, kata_sandi })
  const [sandiSalah, emailSalah] = await Promise.all([login("klinik@demo.test"), login("tidak-ada@demo.test")])
  expect(sandiSalah.status).toBe(401)
  expect(emailSalah.status).toBe(401)
  expect(await sandiSalah.json()).toEqual(await emailSalah.json())
})

it("email dokter masuk sebagai dokter; dokter hanya melihat pasiennya sendiri", async () => {
  const r = await uji.req("/api/masuk", "POST", { email: "dokter@demo.test", kata_sandi: uji.env.DEMO_DOKTER_SANDI })
  expect(await r.json()).toEqual({ peran: "dokter" })
  const daftar = await (await uji.sebagai(uji.dokter)("/api/clinic/patients")).json()
  expect(daftar.pasien.map((p: { panggilan: string }) => p.panggilan)).toEqual(expect.arrayContaining(["Alya", "Gilang"]))
  expect(daftar.pasien.map((p: { panggilan: string }) => p.panggilan)).not.toContain("Laras")
  expect(daftar.jadwal.length).toBeGreaterThan(0)
  const laras = (await (await uji.sebagai(uji.lain)("/api/clinic/patients")).json()).pasien
  expect(laras.map((p: { panggilan: string }) => p.panggilan)).toEqual(["Raka"])
})

it("akun klinik melihat overview dokter + jadwal kliniknya saja", async () => {
  const r = await uji.req("/api/masuk", "POST", { email: "klinik@demo.test", kata_sandi: uji.env.DEMO_DOKTER_SANDI })
  expect(await r.json()).toEqual({ peran: "klinik" })
  const cookie = r.headers.getSetCookie().find((x) => x.startsWith("tm_klinik="))!.split(";")[0]!
  const o = await (await uji.sebagai(cookie)("/api/klinik/overview")).json()
  expect(o.klinik.nama).toBe("Klinik Tumbuh Kembang Contoh")
  expect(o.dokter.map((d: { nama: string }) => d.nama)).not.toContain("dr. Lain")
  expect(o.tanpa_dokter.length).toBeGreaterThan(0)
  expect(o.jadwal.every((j: { panggilan: string }) => j.panggilan !== "Raka")).toBe(true)
  expect((await uji.sebagai(cookie)("/api/clinic/patients")).status).toBe(401)
  const admin = await uji.req("/api/masuk", "POST", { email: "admin@demo.test", kata_sandi: uji.env.ADMIN_SANDI })
  expect(await admin.json()).toEqual({ peran: "admin" })
})
