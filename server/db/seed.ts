import { pathToFileURL } from "node:url"
import { existsSync } from "node:fs"
import { hash } from "bcryptjs"
import { eq, inArray, sql } from "drizzle-orm"
import { ATURAN_DEFAULT } from "../../bersama/kontrak/aturan"
import { bacaEnv, type Env } from "../env"
import { buatKodeAkses, hashKode } from "../kode"
import { simpanCache } from "../llm/cache"
import { contohResep, kunciResep } from "../llm/resep"
import { awalHari, mingguIni, MS_HARI, tanggalWib } from "../logika/data"
import { buatDb, type Db } from "./klien"
import {
  bites, children, clinics, doctors, food_exposures, rules, screenings, session_notes,
  sessions, shared_reports, weekly_summaries,
} from "./skema"

export const DOKTER_DEMO = "dokter@demo.test"
export const DIKA = "9de0aead-af53-4d3a-8943-0059d52ca1aa"
const DEMO_KLINIK = "bb316e17-4d65-45ea-bdfb-2278431f4001"
const LAIN_KLINIK = "bb316e17-4d65-45ea-bdfb-2278431f4002"

export async function jalankanSeed(db: Db, env: Env, resetSemua = false) {
  if (env.DEMO !== "1" || !env.DEMO_DOKTER_SANDI || Buffer.byteLength(env.DEMO_DOKTER_SANDI) > 72) {
    throw new Error("Seed perlu DEMO=1 dan DEMO_DOKTER_SANDI dengan panjang paling banyak 72 byte")
  }
  const sandi_hash = await hash(env.DEMO_DOKTER_SANDI, 10)
  const sekarang = new Date()
  const hariIni = awalHari(tanggalWib(sekarang))
  const dibuat = sekarang.toISOString()
  const kodeDika = buatKodeAkses()
  const kodeNara = buatKodeAkses()
  const lahir = new Date(tanggalWib(sekarang))
  lahir.setUTCDate(1)
  lahir.setUTCMonth(lahir.getUTCMonth() - 50)
  const tanggal_lahir = lahir.toISOString().slice(0, 10)

  const jumlah = await db.transaction(async (tx) => {
    const anakDemo = tx.select({ id: children.id }).from(children)
      .where(resetSemua ? undefined : eq(children.data_contoh, true))
    const sesiDemo = tx.select({ id: sessions.id }).from(sessions).where(inArray(sessions.child_id, anakDemo))
    await tx.delete(bites).where(inArray(bites.session_id, sesiDemo))
    await tx.delete(session_notes).where(inArray(session_notes.session_id, sesiDemo))
    for (const tabel of [sessions, rules, screenings, food_exposures, shared_reports, weekly_summaries]) {
      await tx.delete(tabel).where(inArray(tabel.child_id, anakDemo))
    }
    await tx.delete(children).where(resetSemua ? undefined : eq(children.data_contoh, true))
    await tx.insert(clinics).values([
      { id: DEMO_KLINIK, nama: "Klinik Tumbuh Kembang Contoh" },
      { id: LAIN_KLINIK, nama: "Klinik Lain" },
    ]).onConflictDoNothing()
    for (const d of [
      { clinic_id: DEMO_KLINIK, nama: "dr. Demo", email: DOKTER_DEMO },
      { clinic_id: LAIN_KLINIK, nama: "dr. Lain", email: "lain@demo.test" },
    ]) {
      await tx.insert(doctors).values({ ...d, sandi_hash })
        .onConflictDoUpdate({ target: doctors.email, set: { sandi_hash } })
    }
    const dasar = { tanggal_lahir, sapaan: "mbak", nama_pengasuh: "Mbak Rina", stage: 1,
      data_contoh: true, dibuat, trial_until: new Date(+sekarang + 3 * MS_HARI).toISOString() } as const
    const [dika, nara, pasien] = await tx.insert(children).values([
      { ...dasar, id: DIKA, panggilan: "Dika", plan: "trial", kode_akses_hash: hashKode(kodeDika) },
      { ...dasar, panggilan: "Nara", plan: "trial", kode_akses_hash: hashKode(kodeNara) },
      { ...dasar, panggilan: "Raka", plan: "klinik", clinic_id: LAIN_KLINIK, kode_akses_hash: hashKode(buatKodeAkses()) },
    ]).returning({ id: children.id })
    const contoh = [dika!, nara!, pasien!]
    await tx.insert(screenings).values(contoh.map(({ id }) => ({
      child_id: id, jawaban_json: Array<boolean>(7).fill(false), ada_tanda_bahaya: false, tanggal: dibuat,
    })))
    await tx.insert(rules).values(contoh.map(({ id }) => ({
      child_id: id, source: "default" as const, stage: 1, rules_json: ATURAN_DEFAULT, confirmed_at: dibuat,
    })))
    for (let hari = 13; hari >= 0; hari--) {
      const jamSesi = hari === 0 ? [7, 12, 18].filter((jam) => +hariIni + jam * 3600000 + 1200000 <= +sekarang)
        : hari % 2 === 0 ? [7, 18] : [12]
      for (const jam of jamSesi) {
        const waktu = +hariIni - hari * MS_HARI + jam * 3600000
        const diterima = 3 + hari % 7
        const ditolak = jam === 18 ? 3 + hari % 3 : hari % 2
        const ngemut = hari % 5 === 0 ? 1 : 0
        const menu = ["brokoli", "nasi", "umum"][hari % 3]!
        const session_id = crypto.randomUUID()
        await tx.insert(sessions).values({ id: session_id, child_id: DIKA, stage: 1, menu,
          makanan_baru: menu === "brokoli" && jam !== 18 && hari !== 0, mulai: new Date(waktu).toISOString(),
          selesai: new Date(waktu + 1200000).toISOString(), durasi_detik: 1200,
          alasan_selesai: "waktu_habis", diterima, ditolak, ngemut })
        const hasil = [...Array<"diterima">(diterima).fill("diterima"), ...Array<"ditolak">(ditolak).fill("ditolak"),
          ...Array<"ngemut">(ngemut).fill("ngemut")]
        await tx.insert(bites).values(hasil.map((jenis, i) => ({ session_id, detik: 20 + i * 30,
          hasil: jenis, dikoreksi: jenis === "ngemut" })))
        await tx.insert(session_notes).values({ session_id, porsi: "setengah", mood: jam === 18 ? "rewel" : "biasa" })
      }
    }
    await tx.insert(food_exposures).values({ child_id: DIKA, makanan: "brokoli", jumlah: 4, terakhir: dibuat })
    await tx.insert(weekly_summaries).values({
      child_id: DIKA, minggu: mingguIni(new Date(+sekarang - 7 * MS_HARI)), sumber: "ai", model: "contoh-demo",
      keluarga: "Dika mengikuti sesi pada jam makan yang berbeda. Penolakan lebih sering terlihat pada sesi malam.",
      dokter: "Contoh data demo menunjukkan penolakan lebih sering pada sesi malam.", dibuat,
    })
    for (const { teks, hasil } of contohResep) {
      await simpanCache(tx, kunciResep(teks), "resep", hasil)
    }
    const hasil: Record<string, number> = {}
    for (const [nama, tabel] of Object.entries({ children, sessions, bites, rules, screenings, shared_reports })) {
      const hitung = await tx.select({ n: sql<number>`count(*)`.mapWith(Number) }).from(tabel).get()
      hasil[nama] = hitung?.n ?? 0
    }
    return hasil
  })
  return { jumlah, kodeDika, kodeNara }
}

export async function seedDariTerminal(reset = false) {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const env = bacaEnv()
  const db = buatDb(env)
  try {
    const hasil = await jalankanSeed(db, env, reset)
    console.log("Baris:", hasil.jumlah)
    console.log("Kode akses Dika:", hasil.kodeDika)
  } finally {
    db.$client.close()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void seedDariTerminal().catch(() => { console.error("Seed gagal"); process.exitCode = 1 })
}
