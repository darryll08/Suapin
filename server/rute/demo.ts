import { eq } from "drizzle-orm"
import { hapusCookie, masukSebagai, SEMUA_PERAN } from "../akses"
import type { Db } from "../db/klien"
import { DIKA, DOKTER_DEMO, jalankanSeed, KLINIK_DEMO_EMAIL } from "../db/seed"
import { children, clinics, doctors } from "../db/skema"
import type { Env } from "../env"
import { gagal, type Daftar } from "./daftar"

export function ruteDemo(daftar: Daftar, db: Db, env: Env) {
  daftar("demoMasuk", async (c, { sebagai }) => {
    if (sebagai === "admin_demo") return masukSebagai(c, env, "admin", env.ADMIN_EMAIL)
    const [peran, akun] = sebagai === "keluarga_dika"
      ? ["keluarga", await db.select({ id: children.id }).from(children).where(eq(children.id, DIKA)).get()] as const
      : sebagai === "dokter_demo"
        ? ["dokter", await db.select({ id: doctors.id }).from(doctors).where(eq(doctors.id, DOKTER_DEMO)).get()] as const
        : ["klinik", await db.select({ id: clinics.id }).from(clinics).where(eq(clinics.email, KLINIK_DEMO_EMAIL)).get()] as const
    if (!akun) gagal(404, "Data demo belum tersedia")
    await masukSebagai(c, env, peran, akun.id)
  })
  daftar("demoReset", async (c) => {
    const { jumlah } = await jalankanSeed(db, env, true)
    for (const peran of SEMUA_PERAN) if (peran !== "admin") hapusCookie(c, env, peran)
    return { ok: true, jumlah }
  })
}
