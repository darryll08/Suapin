import { and, eq } from "drizzle-orm"
import type { Context, MiddlewareHandler } from "hono"
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie"
import { HTTPException } from "hono/http-exception"
import type { Db } from "./db/klien"
import { children, clinics, doctors } from "./db/skema"
import type { Env } from "./env"
import type { API } from "../bersama/kontrak/api"

export type SesiEnv = { Variables: {
  childId?: string
  dokter?: { id: string; clinic_id: string; nama: string }
  klinik?: { id: string; nama: string }
  admin?: string
} }

type C = Context<SesiEnv>
export type Peran = "keluarga" | "dokter" | "klinik" | "admin"
export const SEMUA_PERAN: Peran[] = ["keluarga", "dokter", "klinik", "admin"]
const umurHari: Record<Peran, number> = { keluarga: 180, dokter: 30, klinik: 7, admin: 1 }
const hari = 86400

export async function pasangCookie(c: C, env: Env, peran: Peran, id: string) {
  await setSignedCookie(c, "tm_" + peran, id, env.SESI_RAHASIA, {
    httpOnly: true, sameSite: "Lax", secure: env.NODE_ENV === "production",
    path: "/", maxAge: umurHari[peran] * hari,
  })
}
export function hapusCookie(c: C, env: Env, peran: Peran) {
  deleteCookie(c, "tm_" + peran, { path: "/", secure: env.NODE_ENV === "production" })
}
export async function bacaDokter(c: C, db: Db, env: Env) {
  const id = await getSignedCookie(c, env.SESI_RAHASIA, "tm_dokter")
  if (!id) return undefined
  return db.select({ id: doctors.id, clinic_id: doctors.clinic_id, nama: doctors.nama }).from(doctors)
    .where(and(eq(doctors.id, id), eq(doctors.aktif, true))).get()
}
export async function bacaKlinik(c: C, db: Db, env: Env) {
  const id = await getSignedCookie(c, env.SESI_RAHASIA, "tm_klinik")
  if (!id) return undefined
  const row = await db.select({ id: clinics.id, nama: clinics.nama, email: clinics.email }).from(clinics)
    .where(eq(clinics.id, id)).get()
  return row?.email ? { id: row.id, nama: row.nama } : undefined
}
/** Satu peran aktif per browser: masuk sebagai satu peran mengeluarkan peran lain. */
export async function masukSebagai(c: C, env: Env, peran: Peran, id: string) {
  await pasangCookie(c, env, peran, id)
  for (const lain of SEMUA_PERAN) if (lain !== peran) hapusCookie(c, env, lain)
}
// Cookie admin berisi email admin; mengganti ADMIN_EMAIL otomatis mengeluarkan sesi lama.
export async function bacaAdmin(c: C, env: Env) {
  const email = await getSignedCookie(c, env.SESI_RAHASIA, "tm_admin")
  return email && email === env.ADMIN_EMAIL ? email : undefined
}

export function denganAkses(
  akses: (typeof API)[keyof typeof API]["akses"], db: Db, env: Env,
): MiddlewareHandler<SesiEnv> {
  return async (c, next) => {
    if (akses === "demo" && env.DEMO !== "1") {
      throw new HTTPException(404, { message: "Halaman tidak ditemukan" })
    }
    if (akses === "keluarga" || akses === "keluarga_atau_dokter") {
      const id = await getSignedCookie(c, env.SESI_RAHASIA, "tm_keluarga")
      if (id && await db.select({ id: children.id }).from(children).where(eq(children.id, id)).get()) {
        c.set("childId", id)
      }
    }
    if (akses === "dokter" || akses === "keluarga_atau_dokter") {
      c.set("dokter", await bacaDokter(c, db, env))
    }
    if (akses === "admin") c.set("admin", await bacaAdmin(c, env))
    if (akses === "klinik") c.set("klinik", await bacaKlinik(c, db, env))
    if ((akses === "admin" && !c.var.admin) || (akses === "klinik" && !c.var.klinik) || (akses === "keluarga" && !c.var.childId) || (akses === "dokter" && !c.var.dokter) ||
      (akses === "keluarga_atau_dokter" && !c.var.childId && !c.var.dokter)) {
      throw new HTTPException(401, { message: "Silakan masuk terlebih dahulu" })
    }
    await next()
  }
}

export function anakMilikKeluarga(c: C, id: string) {
  if (c.var.childId !== id) throw new HTTPException(404, { message: "Anak tidak ditemukan" })
}
// Dokter hanya melihat anak yang dipegangnya sendiri (bukan semua pasien klinik).
export function pasienMilikDokter(c: C, anak: Pick<typeof children.$inferSelect, "doctor_id">) {
  if (!c.var.dokter || c.var.dokter.id !== anak.doctor_id) {
    throw new HTTPException(404, { message: "Pasien tidak ditemukan" })
  }
}
