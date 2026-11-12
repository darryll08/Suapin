import { and, desc, eq, gte, sql } from "drizzle-orm"
import { ATURAN_DEFAULT, AturanSchema } from "../../bersama/kontrak/aturan"
import type { Kueri } from "../db/klien"
import { children, food_exposures, rules, screenings, sessions, weekly_summaries } from "../db/skema"
import { gagal } from "../rute/daftar"

export const MS_HARI = 86400000
const WIB = 7 * 3600000
export const tanggalWib = (tanggal: Date) => new Date(+tanggal + WIB).toISOString().slice(0, 10)
export const awalHari = (tanggal: string) => new Date(tanggal + "T00:00:00+07:00")
export const lalu = (hari: number, sekarang = new Date()) =>
  new Date(+awalHari(tanggalWib(sekarang)) - (hari - 1) * MS_HARI).toISOString()

export function mingguIni(sekarang = new Date()) {
  const kamis = new Date(tanggalWib(sekarang))
  kamis.setUTCDate(kamis.getUTCDate() + 4 - (kamis.getUTCDay() || 7))
  const tahun = kamis.getUTCFullYear()
  const minggu = Math.ceil(((+kamis - Date.UTC(tahun, 0, 1)) / MS_HARI + 1) / 7)
  return tahun + "-W" + String(minggu).padStart(2, "0")
}

export function usiaBulan(lahir: string, sekarang = new Date()) {
  const t = tanggalWib(sekarang)
  const y = Number(t.slice(0, 4)) - Number(lahir.slice(0, 4))
  const m = Number(t.slice(5, 7)) - Number(lahir.slice(5, 7))
  return Math.max(0, y * 12 + m - Number(t.slice(8) < lahir.slice(8)))
}

export async function bacaAnak(db: Kueri, id: string) {
  return await db.select().from(children).where(eq(children.id, id)).get()
    ?? gagal(404, "Anak tidak ditemukan")
}
export async function bacaAturan(db: Kueri, id: string) {
  const baris = await db.select().from(rules).where(eq(rules.child_id, id))
    .orderBy(desc(rules.confirmed_at), sql`rowid desc`).get()
  return { aturan: AturanSchema.parse(baris?.rules_json ?? ATURAN_DEFAULT),
    source: baris?.source ?? "default", confirmed_at: baris?.confirmed_at ?? null } as const
}
/** Program 30 Hari: berlaku 30 hari sejak program_since. */
export const HARI_PROGRAM = 30
export const paketSampai = (anak: Pick<typeof children.$inferSelect, "plan" | "program_since">) =>
  anak.plan === "program" && anak.program_since
    ? new Date(Date.parse(anak.program_since) + HARI_PROGRAM * MS_HARI).toISOString() : null

export async function bacaAksesSesi(db: Kueri, anak: typeof children.$inferSelect) {
  const sekarang = new Date().toISOString()
  const trialHabis = anak.plan === "trial" && anak.trial_until !== null && anak.trial_until <= sekarang
  const paket_sampai = paketSampai(anak)
  const paketHabis = paket_sampai !== null && paket_sampai <= sekarang
  const plan = trialHabis || paketHabis ? "expired" : anak.plan
  const skrining = await db.select().from(screenings).where(eq(screenings.child_id, anak.id))
    .orderBy(desc(screenings.tanggal), sql`rowid desc`).get()
  const alasan_terkunci = !skrining ? "skrining_belum" :
    skrining.ada_tanda_bahaya && plan !== "klinik" ? "tanda_bahaya" :
    paketHabis ? "paket_habis" : plan === "expired" ? "trial_habis" : null
  return { plan, alasan_terkunci, sesi_dibuka: alasan_terkunci === null, paket_sampai } as const
}
export function sesiSejak(db: Kueri, id: string, hari: number) {
  return db.select().from(sessions).where(and(eq(sessions.child_id, id), gte(sessions.mulai, lalu(hari))))
    .orderBy(desc(sessions.mulai)).all()
}
export function tampilSesi(row: typeof sessions.$inferSelect) {
  const wib = new Date(Date.parse(row.mulai) + WIB).toISOString()
  return { tanggal: wib.slice(0, 10), jam: wib.slice(11, 16), menu: row.menu, diterima: row.diterima,
    ditolak: row.ditolak, ngemut: row.ngemut, durasi: row.durasi_detik, alasan_selesai: row.alasan_selesai }
}
export async function bacaPaparan(db: Kueri, id: string) {
  const rows = await db.select({ makanan: food_exposures.makanan, jumlah: food_exposures.jumlah })
    .from(food_exposures).where(eq(food_exposures.child_id, id)).all()
  return rows.map((row) => ({ ...row, target: 10 as const }))
}
export function bacaRingkasan(db: Kueri, id: string, minggu = mingguIni()) {
  return db.select().from(weekly_summaries)
    .where(and(eq(weekly_summaries.child_id, id), eq(weekly_summaries.minggu, minggu))).get()
}
export function sesiUntukTahap(db: Kueri, id: string, stage: number) {
  return db.select({ stage: sessions.stage, diterima: sessions.diterima }).from(sessions)
    .where(and(eq(sessions.child_id, id), eq(sessions.stage, stage)))
    .orderBy(desc(sessions.mulai), desc(sessions.id)).limit(7).all()
}
