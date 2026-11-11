import { afterAll, beforeAll, expect, it } from "vitest"
import { DIKA } from "../../server/db/seed"
import type { Llm } from "../../server/llm/klien"
import { bantu } from "./bantu"

let uji: Awaited<ReturnType<typeof bantu>>
beforeAll(async () => { uji = await bantu() })
afterAll(() => uji?.tutup())

it("memakai pola dari data sesi dan beralih ke template saat teks gagal validasi", async () => {
  const url = "/api/summaries/" + DIKA + "?ulang=1"
  const valid: Llm = async (_nama, skema, _instruksi, input) => {
    expect(input).not.toContain("Dika")
    expect(input).not.toContain("Mbak Rina")
    return skema.parse({ keluarga: "Sesi malam lebih sering ditolak.",
      dokter: "Penolakan lebih sering pada sesi malam.", pola: ["Penolakan lebih sering pada sesi malam."] })
  }
  const gagal: Llm = async (_nama, skema) => skema.parse({
    keluarga: "Diagnosis dari 999 sesi.", dokter: "Penyakit.", pola: ["999 sesi."],
  })
  const waktu = new Date()
  const data = {
    child_id: DIKA, menu: "umum", makanan_baru: false, mulai: waktu.toISOString(), selesai: waktu.toISOString(),
    durasi_detik: 0, tahap: 1, alasan_selesai: "stop", gigitan: [],
  }
  expect((await uji.sebagai(uji.dika)("/api/sessions", "POST", data)).status).toBe(200)
  const baik = await uji.sebagai(uji.dika, valid)(url, "POST")
  expect(await baik.json()).toMatchObject({ sumber: "ai", dokter: "Penolakan lebih sering pada sesi malam." })
  // Tambahkan sesi agar cache lama memiliki kunci agregat yang berbeda.
  const baru = new Date(+waktu + 1).toISOString()
  expect((await uji.sebagai(uji.dika)("/api/sessions", "POST", { ...data, mulai: baru, selesai: baru })).status).toBe(200)
  // Tanpa OPENAI_API_KEY dan tanpa cache untuk data baru → template.
  expect(await (await uji.sebagai(uji.dika)(url, "POST")).json()).toMatchObject({ sumber: "template" })
  expect(await (await uji.sebagai(uji.dika, gagal)(url, "POST")).json()).toMatchObject({ sumber: "template" })
  expect((await uji.sebagai(uji.dika)(url, "POST", { minggu: "2026-W00" })).status).toBe(400)
})
