import { eq, sql } from "drizzle-orm"
import { adminCocok, pastikanEmailBebas, sandiBaru } from "../akun"
import { hapusCookie, masukSebagai } from "../akses"
import type { Db } from "../db/klien"
import { children, clinics, doctors } from "../db/skema"
import type { Env } from "../env"
import { gagal, type Daftar } from "./daftar"

const emailDipakai = (e: unknown) => e instanceof Error &&
  /UNIQUE constraint failed: (clinics|doctors)\.email/.test(e.message + String((e as { cause?: unknown }).cause))

export function ruteAdmin(daftar: Daftar, db: Db, env: Env) {
  async function ada(tabel: typeof doctors | typeof clinics, id: string, pesan: string) {
    return await db.select({ id: tabel.id }).from(tabel).where(eq(tabel.id, id)).get() ?? gagal(404, pesan)
  }

  daftar("adminMasuk", async (c, { email, kata_sandi }) => {
    if (!await adminCocok(env, email, kata_sandi)) gagal(401, "Email atau kata sandi tidak sesuai")
    await masukSebagai(c, env, "admin", env.ADMIN_EMAIL)
  })
  daftar("adminKeluar", (c) => hapusCookie(c, env, "admin"))

  daftar("adminAkun", async (c) => {
    const [semuaKlinik, semuaDokter, pasienKlinik, pasienDokter] = await Promise.all([
      db.select().from(clinics).orderBy(clinics.nama).all(),
      db.select().from(doctors).orderBy(doctors.nama).all(),
      db.select({ id: children.clinic_id, n: sql<number>`count(*)`.mapWith(Number) }).from(children)
        .groupBy(children.clinic_id).all(),
      db.select({ id: children.doctor_id, n: sql<number>`count(*)`.mapWith(Number) }).from(children)
        .groupBy(children.doctor_id).all(),
    ])
    const perKlinik = new Map(pasienKlinik.map(({ id, n }) => [id, n]))
    const perDokter = new Map(pasienDokter.map(({ id, n }) => [id, n]))
    return { admin_email: c.var.admin!, klinik: semuaKlinik.map((k) => ({
      id: k.id, nama: k.nama, kota: k.kota, email: k.email, jumlah_pasien: perKlinik.get(k.id) ?? 0,
      dokter: semuaDokter.filter((d) => d.clinic_id === k.id).map((d) => ({
        id: d.id, nama: d.nama, spesialis: d.spesialis, email: d.email, aktif: d.aktif, jumlah_pasien: perDokter.get(d.id) ?? 0 })),
    })) }
  })

  daftar("adminKlinikBuat", async (_c, { nama_klinik, kota, email }) => {
    await pastikanEmailBebas(db, env, email)
    const { sandi_sementara, sandi_hash } = await sandiBaru()
    try {
      const [klinik] = await db.insert(clinics).values({ nama: nama_klinik, kota: kota || null, email, sandi_hash })
        .returning({ id: clinics.id })
      return { clinic_id: klinik!.id, sandi_sementara }
    } catch (e) {
      if (emailDipakai(e)) gagal(409, "Email ini sudah dipakai akun lain")
      throw e
    }
  })
  daftar("adminKlinikSandi", async (c) => {
    const { id } = await ada(clinics, c.req.param("id")!, "Klinik tidak ditemukan")
    const { sandi_sementara, sandi_hash } = await sandiBaru()
    await db.update(clinics).set({ sandi_hash }).where(eq(clinics.id, id))
    return { sandi_sementara }
  })

  daftar("adminDokterBuat", async (_c, { clinic_id, nama, spesialis, email }) => {
    await ada(clinics, clinic_id, "Klinik tidak ditemukan")
    await pastikanEmailBebas(db, env, email)
    const { sandi_sementara, sandi_hash } = await sandiBaru()
    try {
      const [baru] = await db.insert(doctors).values({ clinic_id, nama, spesialis: spesialis || null, email, sandi_hash })
        .returning({ id: doctors.id })
      return { doctor_id: baru!.id, sandi_sementara }
    } catch (e) {
      if (emailDipakai(e)) gagal(409, "Email ini sudah dipakai akun lain")
      throw e
    }
  })
  daftar("adminDokterStatus", async (c, { aktif }) => {
    const { id } = await ada(doctors, c.req.param("id")!, "Dokter tidak ditemukan")
    await db.update(doctors).set({ aktif }).where(eq(doctors.id, id))
  })
  daftar("adminDokterSandi", async (c) => {
    const { id } = await ada(doctors, c.req.param("id")!, "Dokter tidak ditemukan")
    const { sandi_sementara, sandi_hash } = await sandiBaru()
    await db.update(doctors).set({ sandi_hash }).where(eq(doctors.id, id))
    return { sandi_sementara }
  })
}
