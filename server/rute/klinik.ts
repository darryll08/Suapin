import { and, asc, desc, eq, gte, inArray, isNull, lt, sql } from "drizzle-orm"
import { bacaDokter, hapusCookie, pasienMilikDokter } from "../akses"
import type { Db } from "../db/klien"
import { appointments, bites, children, clinics, doctors, rules, screenings, sessions, shared_reports } from "../db/skema"
import type { Env } from "../env"
import {
  bacaAnak, bacaAturan, bacaPaparan, bacaRingkasan, lalu, MS_HARI, sesiSejak,
  sesiUntukTahap, tampilSesi, usiaBulan,
} from "../logika/data"
import { cekNaikTahap } from "../logika/tahap"
import { gagal, type Daftar } from "./daftar"

type Jadwal = typeof appointments.$inferSelect
const tampilJadwal = ({ id, waktu, jenis, status, catatan }: Jadwal) => ({ id, waktu, jenis, status, catatan })

export function ruteKlinik(daftar: Daftar, db: Db, env: Env) {
  async function anakDariToken(token: string) {
    if (!/^[\w-]{43}$/.test(token)) gagal(404, "Link tidak berlaku")
    const row = await db.select({ anak: children }).from(shared_reports)
      .innerJoin(children, eq(shared_reports.child_id, children.id))
      .where(eq(shared_reports.token, token)).get()
    return row?.anak ?? gagal(404, "Link tidak berlaku")
  }

  /** Statistik 7 hari + sesi terakhir per anak dalam satu kueri. */
  async function statistikAnak(ids: string[]) {
    if (!ids.length) return new Map<string, { n: number; masuk: number; tolak: number; terakhir: string | null }>()
    const [minggu, terakhir] = await Promise.all([
      db.select({ id: sessions.child_id, n: sql<number>`count(*)`.mapWith(Number),
        masuk: sql<number>`coalesce(sum(${sessions.diterima}), 0)`.mapWith(Number),
        tolak: sql<number>`coalesce(sum(${sessions.ditolak}), 0)`.mapWith(Number) }).from(sessions)
        .where(and(inArray(sessions.child_id, ids), gte(sessions.mulai, lalu(7)))).groupBy(sessions.child_id).all(),
      db.select({ id: sessions.child_id, t: sql<string>`max(${sessions.mulai})` }).from(sessions)
        .where(inArray(sessions.child_id, ids)).groupBy(sessions.child_id).all(),
    ])
    const akhir = new Map(terakhir.map((r) => [r.id, r.t]))
    const hasil = new Map(ids.map((id) => [id, { n: 0, masuk: 0, tolak: 0, terakhir: akhir.get(id) ?? null }]))
    for (const r of minggu) Object.assign(hasil.get(r.id)!, { n: r.n, masuk: r.masuk, tolak: r.tolak })
    return hasil
  }
  /** Jadwal terjadwal mulai hari ini, paling dekat dulu. */
  const jadwalMendatang = (where: ReturnType<typeof eq>) => db.select({ j: appointments, panggilan: children.panggilan,
    dokter_nama: doctors.nama }).from(appointments)
    .innerJoin(children, eq(children.id, appointments.child_id))
    .innerJoin(doctors, eq(doctors.id, appointments.doctor_id))
    .where(and(where, eq(appointments.status, "terjadwal"), gte(appointments.waktu, lalu(1))))
    .orderBy(asc(appointments.waktu)).all()

  daftar("klinikKeluar", (c) => hapusCookie(c, env, "klinik"))
  daftar("klinikOverview", async (c) => {
    const { id: clinicId } = c.var.klinik!
    const [klinik, semuaDokter, pasien, jadwal] = await Promise.all([
      db.select().from(clinics).where(eq(clinics.id, clinicId)).get(),
      db.select().from(doctors).where(eq(doctors.clinic_id, clinicId)).orderBy(doctors.nama).all(),
      db.select().from(children).where(eq(children.clinic_id, clinicId)).orderBy(children.panggilan).all(),
      jadwalMendatang(eq(doctors.clinic_id, clinicId)),
    ])
    const stat = await statistikAnak(pasien.map((p) => p.id))
    const berikut = new Map<string, string>()
    for (const { j } of jadwal) if (!berikut.has(j.child_id)) berikut.set(j.child_id, j.waktu)
    const sepekan = new Date(Date.now() + 7 * MS_HARI).toISOString()
    let masuk = 0, tolak = 0, sesi = 0
    for (const s of stat.values()) { masuk += s.masuk; tolak += s.tolak; sesi += s.n }
    return {
      klinik: { id: klinik!.id, nama: klinik!.nama, kota: klinik!.kota },
      statistik: { dokter: semuaDokter.length, pasien: pasien.length, sesi_7_hari: sesi,
        jadwal_7_hari: jadwal.filter(({ j }) => j.waktu < sepekan).length,
        persen_diterima_7_hari: masuk + tolak ? Math.round(masuk / (masuk + tolak) * 100) : 0 },
      dokter: semuaDokter.map((d) => {
        const milik = pasien.filter((p) => p.doctor_id === d.id)
        return { id: d.id, nama: d.nama, spesialis: d.spesialis, aktif: d.aktif,
          sesi_7_hari: milik.reduce((n, p) => n + stat.get(p.id)!.n, 0),
          pasien: milik.map((p) => ({ id: p.id, panggilan: p.panggilan, usia_bulan: usiaBulan(p.tanggal_lahir),
            tahap: p.stage, sesi_7_hari: stat.get(p.id)!.n, sesi_terakhir: stat.get(p.id)!.terakhir,
            jadwal_berikut: berikut.get(p.id) ?? null })) }
      }),
      tanpa_dokter: pasien.filter((p) => !p.doctor_id)
        .map((p) => ({ id: p.id, panggilan: p.panggilan, usia_bulan: usiaBulan(p.tanggal_lahir) })),
      jadwal: jadwal.slice(0, 30).map(({ j, panggilan, dokter_nama }) =>
        ({ ...tampilJadwal(j), child_id: j.child_id, panggilan, dokter_nama })),
    }
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
      sudah_pasien_klinik: anak.doctor_id !== null && anak.doctor_id !== dokter?.id,
      pasien_saya: dokter && dokter.id === anak.doctor_id }
  })
  // Klaim: anak tanpa dokter (keluarga mandiri, atau pasien klinik sendiri yang belum ditangani) jadi pasien dokter ini.
  daftar("pasienKlaim", async (c) => {
    const anak = await anakDariToken(c.req.param("token")!)
    const dokter = c.var.dokter!
    if (anak.doctor_id === dokter.id) return { child_id: anak.id }
    if (anak.clinic_id && anak.clinic_id !== dokter.clinic_id) gagal(409, "Anak ini sudah menjadi pasien klinik lain")
    const [diubah] = await db.update(children).set({ clinic_id: dokter.clinic_id, doctor_id: dokter.id, plan: "klinik" })
      .where(and(eq(children.id, anak.id), isNull(children.doctor_id))).returning({ id: children.id })
    if (!diubah && (await bacaAnak(db, anak.id)).doctor_id !== dokter.id) {
      gagal(409, "Anak ini sudah ditangani dokter lain")
    }
    return { child_id: anak.id }
  })
  daftar("pasienDaftar", async (c) => {
    const dokter = c.var.dokter!
    const [info, pasien, jadwal] = await Promise.all([
      db.select({ spesialis: doctors.spesialis, klinik: clinics.nama }).from(doctors)
        .innerJoin(clinics, eq(clinics.id, doctors.clinic_id)).where(eq(doctors.id, dokter.id)).get(),
      db.select().from(children).where(eq(children.doctor_id, dokter.id)).orderBy(children.panggilan).all(),
      jadwalMendatang(eq(appointments.doctor_id, dokter.id)),
    ])
    const stat = await statistikAnak(pasien.map((p) => p.id))
    return { dokter_nama: dokter.nama, spesialis: info?.spesialis ?? null, klinik_nama: info?.klinik,
      jadwal: jadwal.slice(0, 20).map(({ j, panggilan }) => ({ ...tampilJadwal(j), child_id: j.child_id, panggilan })),
      pasien: await Promise.all(pasien.map(async (anak) => {
        const [aktif, terakhir] = await Promise.all([bacaAturan(db, anak.id), sesiUntukTahap(db, anak.id, anak.stage)])
        const hasil = cekNaikTahap(terakhir, aktif.aturan)
        const s = stat.get(anak.id)!
        const berikut = jadwal.find(({ j }) => j.child_id === anak.id)
        return { id: anak.id, panggilan: anak.panggilan, usia_bulan: usiaBulan(anak.tanggal_lahir),
          tahap: anak.stage, sesi_7_hari: s.n, diterima_7_hari: s.masuk, ditolak_7_hari: s.tolak,
          source_aturan: aktif.source, siap_naik_tahap: hasil.siapNaik, saran_turun_tahap: hasil.saranTurun,
          sesi_terakhir: s.terakhir, jadwal_berikut: berikut ? tampilJadwal(berikut.j) : null }
      })) }
  })
  daftar("pasienDetail", async (c) => {
    const id = c.req.param("id")!
    const anak = await bacaAnak(db, id)
    pasienMilikDokter(c, anak)
    const [aturan_aktif, riwayat_aturan, sesi, paparan, ringkasan, terakhir, ngemut, jadwal, skrining] = await Promise.all([
      bacaAturan(db, id), db.select().from(rules).where(eq(rules.child_id, id))
        .orderBy(desc(rules.confirmed_at), sql`rowid desc`).all(),
      sesiSejak(db, id, 28), bacaPaparan(db, id), bacaRingkasan(db, id), sesiUntukTahap(db, id, anak.stage),
      db.select({ n: sql<number>`count(*)`.mapWith(Number) }).from(bites)
        .innerJoin(sessions, eq(sessions.id, bites.session_id))
        .where(and(eq(sessions.child_id, id), gte(sessions.mulai, lalu(28)),
          eq(bites.hasil, "ngemut"), eq(bites.dikoreksi, true))).get(),
      db.select().from(appointments).where(and(eq(appointments.child_id, id),
        gte(appointments.waktu, lalu(60)), lt(appointments.waktu, new Date(Date.now() + 60 * MS_HARI).toISOString())))
        .orderBy(desc(appointments.waktu)).all(),
      db.select().from(screenings).where(eq(screenings.child_id, id)).orderBy(desc(screenings.tanggal)).get(),
    ])
    const hasil = cekNaikTahap(terakhir, aturan_aktif.aturan)
    return { dokter_nama: c.var.dokter!.nama, child: { ...anak, usia_bulan: usiaBulan(anak.tanggal_lahir) }, aturan_aktif, riwayat_aturan,
      sesi: sesi.map(tampilSesi), paparan, ngemut_dikonfirmasi: ngemut?.n ?? 0,
      siap_naik_tahap: hasil.siapNaik, saran_turun_tahap: hasil.saranTurun,
      ringkasan_dokter: ringkasan?.dokter ?? null, ringkasan_sumber: ringkasan?.sumber,
      pengasuh: { sapaan: anak.sapaan, nama: anak.nama_pengasuh }, jadwal: jadwal.map(tampilJadwal),
      skrining_terakhir: skrining ? { tanggal: skrining.tanggal, ada_tanda_bahaya: skrining.ada_tanda_bahaya } : null }
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
