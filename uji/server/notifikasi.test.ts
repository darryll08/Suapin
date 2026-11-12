import { afterAll, beforeAll, expect, it } from "vitest"
import { calonNotifikasi } from "../../server/logika/notifikasi"
import type { children } from "../../server/db/skema"
import { bantu } from "./bantu"

let uji: Awaited<ReturnType<typeof bantu>>
beforeAll(async () => { uji = await bantu() })
afterAll(() => uji?.tutup())

const HARI = 86400000
const sekarang = new Date("2026-11-20T03:00:00.000Z")
const anak = (isi: Partial<typeof children.$inferSelect>) => ({
  id: "a", clinic_id: null, doctor_id: null, panggilan: "Dika", tanggal_lahir: "2022-01-01", kode_akses_hash: "x",
  email: "a@b.c", sandi_hash: "x", sapaan: "mbak", nama_pengasuh: "Rina", plan: "trial", trial_until: null,
  program_since: null, stage: 1, data_contoh: false, dibuat: sekarang.toISOString(), ...isi,
}) as typeof children.$inferSelect
const jenis = (a: typeof children.$inferSelect, sesi: string | null) => calonNotifikasi(a, sesi, sekarang).map((n) => n.jenis)

it("pengingat muncul setelah 2 hari tanpa sesi, tidak sebelumnya", () => {
  expect(jenis(anak({}), new Date(+sekarang - HARI).toISOString())).toEqual([])
  expect(jenis(anak({}), new Date(+sekarang - 2 * HARI).toISOString())).toEqual(["pengingat"])
})

it("trial hampir habis (≤ 1 hari) lalu habis", () => {
  const sesi = sekarang.toISOString()
  expect(jenis(anak({ trial_until: new Date(+sekarang + 3 * HARI).toISOString() }), sesi)).toEqual([])
  expect(jenis(anak({ trial_until: new Date(+sekarang + 12 * 3600000).toISOString() }), sesi)).toEqual(["trial_hampir_habis"])
  expect(jenis(anak({ trial_until: new Date(+sekarang - 1000).toISOString() }), sesi)).toEqual(["trial_habis"])
})

it("Program 30 Hari: tinggal ≤ 3 hari lalu habis", () => {
  const sesi = sekarang.toISOString()
  const sejak = (hari: number) => anak({ plan: "program", program_since: new Date(+sekarang - hari * HARI).toISOString() })
  expect(jenis(sejak(20), sesi)).toEqual([])
  expect(jenis(sejak(28), sesi)).toEqual(["paket_hampir_habis"])
  expect(jenis(sejak(31), sesi)).toEqual(["paket_habis"])
})

it("daftar notifikasi, tandai dibaca, langganan push, dan demo memicu notifikasi", async () => {
  const keluarga = uji.sebagai(uji.dika)
  expect((await uji.req("/api/notifications")).status).toBe(401)
  const demo = await keluarga("/api/demo/notifikasi", "POST", { jenis: "pengingat" })
  expect(await demo.json()).toEqual({ terkirim_push: 0 })
  const daftar = await (await keluarga("/api/notifications")).json()
  expect(daftar.belum_dibaca).toBeGreaterThan(0)
  expect(daftar.notifikasi[0]).toMatchObject({ jenis: "pengingat", tautan: "/sesi", dibaca: false })
  expect((await keluarga("/api/notifications/read", "POST")).status).toBe(204)
  expect((await (await keluarga("/api/notifications")).json()).belum_dibaca).toBe(0)

  const langganan = { endpoint: "https://fcm.googleapis.com/fcm/send/uji-abc", keys: { p256dh: "kunci", auth: "auth" } }
  // Alamat selain layanan push resmi ditolak (cegah SSRF).
  for (const endpoint of ["http://fcm.googleapis.com/x", "https://127.0.0.1:8787/api/sehat", "https://googleapis.com.evil.test/x"]) {
    expect((await keluarga("/api/push/subscribe", "POST", { ...langganan, endpoint })).status).toBe(400)
  }
  expect((await keluarga("/api/push/subscribe", "POST", langganan)).status).toBe(204)
  expect((await keluarga("/api/push/subscribe", "POST", langganan)).status).toBe(204)
  expect((await keluarga("/api/push/unsubscribe", "POST", { endpoint: langganan.endpoint })).status).toBe(204)
})
