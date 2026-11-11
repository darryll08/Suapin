import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import type { Aturan } from "../../bersama/kontrak/aturan"

const id = () => text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID())
const anakFk = () => text("child_id").notNull().references(() => children.id, { onDelete: "cascade" })

export const clinics = sqliteTable("clinics", { id: id(), nama: text().notNull() })
export const doctors = sqliteTable("doctors", {
  id: id(),
  clinic_id: text().notNull().references(() => clinics.id),
  nama: text().notNull(),
  email: text().notNull().unique(),
  sandi_hash: text().notNull(),
})
export const children = sqliteTable("children", {
  id: id(),
  clinic_id: text().references(() => clinics.id),
  panggilan: text().notNull(),
  tanggal_lahir: text().notNull(),
  kode_akses_hash: text().notNull().unique(),
  sapaan: text({ enum: ["mbak", "bu", "oma", "ayah"] }).notNull(),
  nama_pengasuh: text().notNull(),
  plan: text({ enum: ["trial", "expired", "program", "lanjutan", "klinik"] }).notNull(),
  trial_until: text(),
  program_since: text(),
  stage: integer().notNull(),
  data_contoh: integer({ mode: "boolean" }).notNull().default(false),
  dibuat: text().notNull(),
})
export const screenings = sqliteTable("screenings", {
  id: id(),
  child_id: anakFk(),
  jawaban_json: text({ mode: "json" }).$type<boolean[]>().notNull(),
  ada_tanda_bahaya: integer({ mode: "boolean" }).notNull(),
  tanggal: text().notNull(),
})
export const rules = sqliteTable("rules", {
  id: id(),
  child_id: anakFk(),
  source: text({ enum: ["default", "dokter"] }).notNull(),
  source_text: text(),
  rules_json: text({ mode: "json" }).$type<Aturan>().notNull(),
  stage: integer().notNull(),
  confirmed_at: text().notNull(),
  doctor_id: text().references(() => doctors.id),
}, (t) => [index("rules_child_confirmed").on(t.child_id, t.confirmed_at)])
export const sessions = sqliteTable("sessions", {
  id: id(),
  child_id: anakFk(),
  stage: integer().notNull(),
  menu: text().notNull(),
  makanan_baru: integer({ mode: "boolean" }).notNull(),
  mulai: text().notNull(),
  selesai: text().notNull(),
  durasi_detik: integer().notNull(),
  alasan_selesai: text({ enum: ["waktu_habis", "terlalu_lama_menolak", "stop", "stop_darurat"] }).notNull(),
  diterima: integer().notNull(),
  ditolak: integer().notNull(),
  ngemut: integer().notNull(),
}, (t) => [
  index("sessions_child_mulai").on(t.child_id, t.mulai),
  uniqueIndex("sessions_child_start").on(t.child_id, t.mulai, t.selesai),
])
export const bites = sqliteTable("bites", {
  id: id(),
  session_id: text().notNull().references(() => sessions.id, { onDelete: "cascade" }),
  detik: real().notNull(),
  hasil: text({ enum: ["diterima", "ditolak", "ngemut"] }).notNull(),
  dikoreksi: integer({ mode: "boolean" }).notNull(),
}, (t) => [index("bites_session").on(t.session_id)])
export const session_notes = sqliteTable("session_notes", {
  session_id: text().primaryKey().notNull().references(() => sessions.id, { onDelete: "cascade" }),
  porsi: text({ enum: ["sedikit", "setengah", "habis"] }),
  mood: text({ enum: ["senang", "biasa", "rewel"] }),
})
export const food_exposures = sqliteTable("food_exposures", {
  id: id(),
  child_id: anakFk(),
  makanan: text().notNull(),
  jumlah: integer().notNull(),
  terakhir: text().notNull(),
}, (t) => [uniqueIndex("food_exposure_child_food").on(t.child_id, t.makanan)])
export const weekly_summaries = sqliteTable("weekly_summaries", {
  id: id(),
  child_id: anakFk(),
  minggu: text().notNull(),
  keluarga: text().notNull(),
  dokter: text().notNull(),
  sumber: text({ enum: ["ai", "cache", "template"] }).notNull(),
  model: text(),
  dibuat: text().notNull(),
}, (t) => [uniqueIndex("summary_child_week").on(t.child_id, t.minggu)])
export const shared_reports = sqliteTable("shared_reports", {
  token: text().primaryKey().notNull(),
  child_id: anakFk(),
  dibuat: text().notNull(),
})
export const llm_cache = sqliteTable("llm_cache", {
  kunci: text().primaryKey().notNull(),
  jenis: text({ enum: ["resep", "ringkasan"] }).notNull(),
  hasil_json: text({ mode: "json" }).$type<unknown>().notNull(),
  dibuat: text().notNull(),
})
