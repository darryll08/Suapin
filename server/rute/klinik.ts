import { compare } from "bcryptjs"
import { and, desc, eq, gte, isNull, sql } from "drizzle-orm"
import { bacaDokter, hapusCookie, pasienMilikDokter, pasangCookie } from "../akses"
import type { Db } from "../db/klien"
import { bites, children, doctors, rules, sessions, shared_reports } from "../db/skema"
import type { Env } from "../env"
import {
  bacaAnak, bacaAturan, bacaPaparan, bacaRingkasan, lalu, sesiSejak,
  sesiUntukTahap, tampilSesi, usiaBulan,
} from "../logika/data"
import { cekNaikTahap } from "../logika/tahap"
import { gagal, type Daftar } from "./daftar"

// Nilai ini hanya untuk menyamakan biaya bcrypt ketika email tidak dikenal.
export const hashPalsu = "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi."

export function ruteKlinik(daftar: Daftar, db: Db, env: Env) {
  async function anakDariToken(token: string) {
    if (!/^[\w-]{43}$/.test(token)) gagal(404, "Link tidak berlaku")
    const row = await db.select({ anak: children }).from(shared_reports)
      .innerJoin(children, eq(shared_reports.child_id, children.id))
      .where(eq(shared_reports.token, token)).get()
    return row?.anak ?? gagal(404, "Link tidak berlaku")
  }

  daftar("dokterMasuk", async (c, data) => {
    const dokter = await db.select().from(doctors).where(eq(doctors.email, data.email.toLowerCase())).get()
    const panjangAman = Buffer.byteLength(data.kata_sandi) <= 72
    const benar = await compare(panjangAman ? data.kata_sandi : "", dokter?.sandi_hash ?? hashPalsu)
    if (!dokter || !benar || !panjangAman || !dokter.aktif) gagal(401, "Email atau kata sandi tidak sesuai")
    await pasangCookie(c, env, "dokter", dokter.id)
  })
  daftar("dokterKeluar", (c) => hapusCookie(c, env, "dokter"))
  daftar("laporanToken", async (c) => {
    const anak = await anakDariToken(c.req.param("token")!)
    const [dokter, sesi, ringkasan] = await Promise.all([
      bacaDokter(c, db, env), sesiSejak(db, anak.id, 14), bacaRingkasan(db, anak.id),
    ])
    return { child: { panggilan: anak.panggilan, usia_bulan: usiaBulan(anak.tanggal_lahir) },
      tahap: anak.stage, sesi: sesi.map(tampilSesi), ringkasan_dokter: ringkasan?.dokter ?? null,
      ringkasan_sumber: ringkasan?.sumber,
      sudah_pasien_klinik: anak.clinic_id !== null, pasien_saya: dokter && dokter.clinic_id === anak.clinic_id }
  })
  daftar("pasienKlaim", async (c) => {
    const anak = await anakDariToken(c.req.param("token")!)
    const clinic_id = c.var.dokter!.clinic_id
    if (anak.clinic_id === clinic_id) return { child_id: anak.id }
    const [diubah] = await db.update(children).set({ clinic_id, plan: "klinik" })
      .where(and(eq(children.id, anak.id), isNull(children.clinic_id))).returning({ id: children.id })
    if (!diubah && (await bacaAnak(db, anak.id)).clinic_id !== clinic_id) {
      gagal(409, "Anak ini sudah menjadi pasien klinik lain")
    }
    return { child_id: anak.id }
  })
  daftar("pasienDaftar", async (c) => {
    const dokter = c.var.dokter!
    const clinicId = dokter.clinic_id
    const [pasien, statistik] = await Promise.all([
      db.select().from(children).where(eq(children.clinic_id, clinicId)).orderBy(children.panggilan).all(),
      db.select({ id: sessions.child_id, n: sql<number>`count(*)`.mapWith(Number),
        masuk: sql<number>`sum(${sessions.diterima})`.mapWith(Number),
        tolak: sql<number>`sum(${sessions.ditolak})`.mapWith(Number) }).from(sessions)
        .innerJoin(children, eq(sessions.child_id, children.id))
        .where(and(eq(children.clinic_id, clinicId), gte(sessions.mulai, lalu(7))))
        .groupBy(sessions.child_id).all(),
    ])
    const perAnak = new Map(statistik.map((row) => [row.id, row]))
    return { dokter_nama: dokter.nama, pasien: await Promise.all(pasien.map(async (anak) => {
      const [aktif, terakhir] = await Promise.all([
        bacaAturan(db, anak.id), sesiUntukTahap(db, anak.id, anak.stage),
      ])
      const hasil = cekNaikTahap(terakhir, aktif.aturan)
      const total = perAnak.get(anak.id)
      return { id: anak.id, panggilan: anak.panggilan, usia_bulan: usiaBulan(anak.tanggal_lahir),
        tahap: anak.stage, sesi_7_hari: total?.n ?? 0, diterima_7_hari: total?.masuk ?? 0,
        ditolak_7_hari: total?.tolak ?? 0, source_aturan: aktif.source,
        siap_naik_tahap: hasil.siapNaik, saran_turun_tahap: hasil.saranTurun }
    })) }
  })
  daftar("pasienDetail", async (c) => {
    const id = c.req.param("id")!
    const anak = await bacaAnak(db, id)
    pasienMilikDokter(c, anak)
    const [aturan_aktif, riwayat_aturan, sesi, paparan, ringkasan, terakhir, ngemut] = await Promise.all([
      bacaAturan(db, id), db.select().from(rules).where(eq(rules.child_id, id))
        .orderBy(desc(rules.confirmed_at), sql`rowid desc`).all(),
      sesiSejak(db, id, 28), bacaPaparan(db, id), bacaRingkasan(db, id), sesiUntukTahap(db, id, anak.stage),
      db.select({ n: sql<number>`count(*)`.mapWith(Number) }).from(bites)
        .innerJoin(sessions, eq(sessions.id, bites.session_id))
        .where(and(eq(sessions.child_id, id), gte(sessions.mulai, lalu(28)),
          eq(bites.hasil, "ngemut"), eq(bites.dikoreksi, true))).get(),
    ])
    const hasil = cekNaikTahap(terakhir, aturan_aktif.aturan)
    return { dokter_nama: c.var.dokter!.nama, child: { ...anak, usia_bulan: usiaBulan(anak.tanggal_lahir) }, aturan_aktif, riwayat_aturan,
      sesi: sesi.map(tampilSesi), paparan, ngemut_dikonfirmasi: ngemut?.n ?? 0,
      siap_naik_tahap: hasil.siapNaik, saran_turun_tahap: hasil.saranTurun,
      ringkasan_dokter: ringkasan?.dokter ?? null, ringkasan_sumber: ringkasan?.sumber }
  })
  daftar("aturanKonfirmasi", (c, data) => db.transaction(async (tx) => {
    pasienMilikDokter(c, await bacaAnak(tx, data.child_id))
    const rule_id = crypto.randomUUID()
    await tx.insert(rules).values({ id: rule_id, child_id: data.child_id, source: "dokter",
      source_text: data.source_text, rules_json: data.aturan, stage: data.aturan.stage,
      doctor_id: c.var.dokter!.id, confirmed_at: new Date().toISOString() })
    await tx.update(children).set({ stage: data.aturan.stage }).where(eq(children.id, data.child_id))
    return { rule_id }
  }))
}
