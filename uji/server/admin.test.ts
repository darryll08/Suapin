import { afterAll, beforeAll, expect, it } from "vitest"
import { bantu } from "./bantu"

let uji: Awaited<ReturnType<typeof bantu>>
beforeAll(async () => { uji = await bantu() })
afterAll(() => uji?.tutup())

async function masukAdmin() {
  const r = await uji.req("/api/admin/login", "POST", { email: "admin@demo.test", kata_sandi: uji.env.ADMIN_SANDI })
  expect(r.status).toBe(204)
  return r.headers.getSetCookie().find((x) => x.startsWith("tm_admin="))!.split(";")[0]!
}

it("admin wajib login; sandi salah, keluarga, dan dokter ditolak 401", async () => {
  expect((await uji.req("/api/admin/accounts")).status).toBe(401)
  expect((await uji.req("/api/admin/login", "POST", { email: "admin@demo.test", kata_sandi: "salah" })).status).toBe(401)
  expect((await uji.req("/api/admin/login", "POST", { email: "klinik@demo.test", kata_sandi: uji.env.ADMIN_SANDI })).status).toBe(401)
  expect((await uji.sebagai(uji.dika)("/api/admin/accounts")).status).toBe(401)
  expect((await uji.sebagai(uji.dokter)("/api/admin/clinics", "POST",
    { nama_klinik: "X", email: "x@demo.test" })).status).toBe(401)
})

it("daftarkan klinik (email + sandi) dan dokter (email + sandi), email klinik ganda 409", async () => {
  const admin = uji.sebagai(await masukAdmin())
  const awal = await (await admin("/api/admin/accounts")).json()
  expect(awal.klinik.map((k: { nama: string }) => k.nama)).toContain("Klinik Tumbuh Kembang Contoh")

  const r = await admin("/api/admin/clinics", "POST", { nama_klinik: "Klinik Baru", kota: "Malang", email: "Baru@Klinik.test" })
  expect(r.status).toBe(200)
  const baru = await r.json()
  expect(baru.sandi_sementara).toHaveLength(12)
  const login = await uji.req("/api/masuk", "POST", { email: "baru@klinik.test", kata_sandi: baru.sandi_sementara })
  expect(await login.json()).toEqual({ peran: "klinik" })
  expect((await admin("/api/admin/clinics", "POST", { nama_klinik: "Klinik Dobel", email: "baru@klinik.test" })).status).toBe(409)
  expect((await admin("/api/admin/doctors", "POST", { clinic_id: "tidak-ada", nama: "dr. Y", email: "y@demo.test" })).status).toBe(404)

  const dokter = await (await admin("/api/admin/doctors", "POST",
    { clinic_id: baru.clinic_id, nama: "dr. Kedua", spesialis: "Dokter anak", email: "kedua@klinik.test" })).json()
  expect(dokter.sandi_sementara).toHaveLength(12)
  expect(await (await uji.req("/api/masuk", "POST", { email: "kedua@klinik.test", kata_sandi: dokter.sandi_sementara })).json())
    .toEqual({ peran: "dokter" })
  expect((await admin("/api/admin/doctors", "POST",
    { clinic_id: baru.clinic_id, nama: "dr. Dobel", email: "baru@klinik.test" })).status).toBe(409)
  const klinik = (await (await admin("/api/admin/accounts")).json()).klinik
    .find((k: { id: string }) => k.id === baru.clinic_id)
  expect(klinik).toMatchObject({ email: "baru@klinik.test", kota: "Malang", dokter: [{ nama: "dr. Kedua", jumlah_pasien: 0 }] })
  const { sandi_sementara } = await (await admin("/api/admin/clinics/" + baru.clinic_id + "/password", "POST")).json()
  expect((await uji.req("/api/masuk", "POST", { email: "baru@klinik.test", kata_sandi: baru.sandi_sementara })).status).toBe(401)
  expect((await uji.req("/api/masuk", "POST", { email: "baru@klinik.test", kata_sandi: sandi_sementara })).status).toBe(200)
})

it("nonaktifkan dokter memutus login dan cookie lama; sandi baru mengganti sandi lama", async () => {
  const admin = uji.sebagai(await masukAdmin())
  const { doctor_id, sandi_sementara: kode_akses } = await (await admin("/api/admin/doctors", "POST",
    { clinic_id: (await (await admin("/api/admin/accounts")).json()).klinik[0].id, nama: "dr. Cuti", email: "cuti@demo.test" })).json()
  const login = (kata_sandi: string) => uji.req("/api/masuk", "POST", { email: "cuti@demo.test", kata_sandi })
  const r = await login(kode_akses)
  const cookie = r.headers.getSetCookie().find((x) => x.startsWith("tm_dokter="))!.split(";")[0]!
  expect((await uji.sebagai(cookie)("/api/clinic/patients")).status).toBe(200)

  expect((await admin("/api/admin/doctors/" + doctor_id + "/status", "POST", { aktif: false })).status).toBe(204)
  expect((await uji.sebagai(cookie)("/api/clinic/patients")).status).toBe(401)
  expect((await login(kode_akses)).status).toBe(401)

  expect((await admin("/api/admin/doctors/" + doctor_id + "/status", "POST", { aktif: true })).status).toBe(204)
  const { sandi_sementara: kodeBaru } = await (await admin("/api/admin/doctors/" + doctor_id + "/password", "POST")).json()
  expect((await login(kode_akses)).status).toBe(401)
  expect((await login(kodeBaru)).status).toBe(200)
  expect((await admin("/api/admin/doctors/tidak-ada/password", "POST")).status).toBe(404)
})

it("demo masuk sebagai admin, lalu keluar", async () => {
  const r = await uji.req("/api/demo/masuk", "POST", { sebagai: "admin_demo" })
  expect(r.status).toBe(204)
  const cookie = r.headers.getSetCookie().find((x) => x.startsWith("tm_admin="))!.split(";")[0]!
  expect((await uji.sebagai(cookie)("/api/admin/accounts")).status).toBe(200)
  const keluar = await uji.sebagai(cookie)("/api/admin/logout", "POST")
  expect(keluar.headers.getSetCookie().some((x) => x.startsWith("tm_admin=;"))).toBe(true)
})
