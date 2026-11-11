import { compare, hash } from "bcryptjs"
import { timingSafeEqual } from "node:crypto"
import { eq, sql } from "drizzle-orm"
import { hapusCookie, pasangCookie } from "../akses"
import type { Db } from "../db/klien"
import { children, clinics, doctors } from "../db/skema"
import type { Env } from "../env"
import { buatKodeAkses } from "../kode"
import { gagal, type Daftar } from "./daftar"
import { hashPalsu } from "./klinik"

// Sandi sementara memakai alfabet kode akses (12 karakter, tanpa huruf/angka mirip).
// Ditampilkan sekali ke admin; server hanya menyimpan hash bcrypt.
async function sandiBaru() {
  const sandi_sementara = buatKodeAkses()
  return { sandi_sementara, sandi_hash: await hash(sandi_sementara, 10) }
}
const emailDipakai = (e: unknown) => e instanceof Error &&
  /UNIQUE constraint failed: doctors\.email/.test(e.message + String((e as { cause?: unknown }).cause))

export function ruteAdmin(daftar: Daftar, db: Db, env: Env) {
  async function dokter(id: string) {
    return await db.select({ id: doctors.id }).from(doctors).where(eq(doctors.id, id)).get() ??
      gagal(404, "Dokter tidak ditemukan")
  }

  daftar("adminMasuk", async (c, { email, kata_sandi }) => {
    // Bandingkan selalu dengan biaya yang sama supaya waktu respons tidak membocorkan email admin.
    await compare(kata_sandi.slice(0, 72), hashPalsu)
    const a = Buffer.from(email + "\n" + kata_sandi)
    const b = Buffer.from(env.ADMIN_EMAIL + "\n" + (env.ADMIN_SANDI ?? ""))
    const cocok = !!env.ADMIN_SANDI && a.length === b.length && timingSafeEqual(a, b)
    if (!cocok) gagal(401, "Email atau kata sandi tidak sesuai")
    await pasangCookie(c, env, "admin", env.ADMIN_EMAIL)
  })
  daftar("adminKeluar", (c) => hapusCookie(c, env, "admin"))

  daftar("adminAkun", async (c) => {
    const [semuaKlinik, semuaDokter, pasien] = await Promise.all([
      db.select().from(clinics).orderBy(clinics.nama).all(),
      db.select({ id: doctors.id, clinic_id: doctors.clinic_id, nama: doctors.nama, email: doctors.email,
        aktif: doctors.aktif }).from(doctors).orderBy(doctors.nama).all(),
      db.select({ id: children.clinic_id, n: sql<number>`count(*)`.mapWith(Number) }).from(children)
        .groupBy(children.clinic_id).all(),
    ])
    const jumlah = new Map(pasien.map(({ id, n }) => [id, n]))
    return { admin_email: c.var.admin!, klinik: semuaKlinik.map((k) => ({
      id: k.id, nama: k.nama, jumlah_pasien: jumlah.get(k.id) ?? 0,
      dokter: semuaDokter.filter((d) => d.clinic_id === k.id).map(({ clinic_id: _, ...d }) => d),
    })) }
  })

  daftar("adminKlinikBuat", async (_c, { nama_klinik, dokter: d }) => {
    const { sandi_sementara, sandi_hash } = await sandiBaru()
    try {
      return await db.transaction(async (tx) => {
        const [klinik] = await tx.insert(clinics).values({ nama: nama_klinik }).returning({ id: clinics.id })
        const [baru] = await tx.insert(doctors).values({ clinic_id: klinik!.id, nama: d.nama, email: d.email, sandi_hash })
          .returning({ id: doctors.id })
        return { clinic_id: klinik!.id, doctor_id: baru!.id, sandi_sementara }
      })
    } catch (e) {
      if (emailDipakai(e)) gagal(409, "Email ini sudah dipakai akun dokter lain")
      throw e
    }
  })

  daftar("adminDokterBuat", async (_c, { clinic_id, nama, email }) => {
    if (!await db.select({ id: clinics.id }).from(clinics).where(eq(clinics.id, clinic_id)).get()) {
      gagal(404, "Klinik tidak ditemukan")
    }
    const { sandi_sementara, sandi_hash } = await sandiBaru()
    try {
      const [baru] = await db.insert(doctors).values({ clinic_id, nama, email, sandi_hash }).returning({ id: doctors.id })
      return { doctor_id: baru!.id, sandi_sementara }
    } catch (e) {
      if (emailDipakai(e)) gagal(409, "Email ini sudah dipakai akun dokter lain")
      throw e
    }
  })

  daftar("adminDokterStatus", async (c, { aktif }) => {
    const { id } = await dokter(c.req.param("id")!)
    await db.update(doctors).set({ aktif }).where(eq(doctors.id, id))
  })

  daftar("adminDokterSandi", async (c) => {
    const { id } = await dokter(c.req.param("id")!)
    const { sandi_sementara, sandi_hash } = await sandiBaru()
    await db.update(doctors).set({ sandi_hash }).where(eq(doctors.id, id))
    return { sandi_sementara }
  })
}
