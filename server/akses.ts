import { eq } from "drizzle-orm"
import type { Context, MiddlewareHandler } from "hono"
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie"
import { HTTPException } from "hono/http-exception"
import type { Db } from "./db/klien"
import { children, doctors } from "./db/skema"
import type { Env } from "./env"
import type { API } from "../bersama/kontrak/api"

export type SesiEnv = { Variables: {
  childId?: string
  dokter?: { id: string; clinic_id: string }
} }

type C = Context<SesiEnv>
type Peran = "keluarga" | "dokter"
const hari = 86400

export async function pasangCookie(c: C, env: Env, peran: Peran, id: string) {
  await setSignedCookie(c, "tm_" + peran, id, env.SESI_RAHASIA, {
    httpOnly: true, sameSite: "Lax", secure: env.NODE_ENV === "production",
    path: "/", maxAge: (peran === "keluarga" ? 180 : 30) * hari,
  })
}
export function hapusCookie(c: C, env: Env, peran: Peran) {
  deleteCookie(c, "tm_" + peran, { path: "/", secure: env.NODE_ENV === "production" })
}
export async function bacaDokter(c: C, db: Db, env: Env) {
  const id = await getSignedCookie(c, env.SESI_RAHASIA, "tm_dokter")
  if (!id) return undefined
  return db.select({ id: doctors.id, clinic_id: doctors.clinic_id }).from(doctors)
    .where(eq(doctors.id, id)).get()
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
    if ((akses === "keluarga" && !c.var.childId) || (akses === "dokter" && !c.var.dokter) ||
      (akses === "keluarga_atau_dokter" && !c.var.childId && !c.var.dokter)) {
      throw new HTTPException(401, { message: "Silakan masuk terlebih dahulu" })
    }
    await next()
  }
}

export function anakMilikKeluarga(c: C, id: string) {
  if (c.var.childId !== id) throw new HTTPException(404, { message: "Anak tidak ditemukan" })
}
export function pasienMilikDokter(c: C, anak: typeof children.$inferSelect) {
  if (!c.var.dokter || c.var.dokter.clinic_id !== anak.clinic_id) {
    throw new HTTPException(404, { message: "Pasien tidak ditemukan" })
  }
}
