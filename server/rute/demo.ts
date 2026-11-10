import { eq } from "drizzle-orm"
import { hapusCookie, pasangCookie } from "../akses"
import type { Db } from "../db/klien"
import { DIKA, DOKTER_DEMO, jalankanSeed } from "../db/seed"
import { children, doctors } from "../db/skema"
import type { Env } from "../env"
import { gagal, type Daftar } from "./daftar"

export function ruteDemo(daftar: Daftar, db: Db, env: Env) {
  daftar("demoMasuk", async (c, { sebagai }) => {
    const keluarga = sebagai === "keluarga_dika"
    const akun = keluarga
      ? await db.select({ id: children.id }).from(children).where(eq(children.id, DIKA)).get()
      : await db.select({ id: doctors.id }).from(doctors).where(eq(doctors.email, DOKTER_DEMO)).get()
    if (!akun) gagal(404, "Data demo belum tersedia")
    const peran = keluarga ? "keluarga" : "dokter"
    hapusCookie(c, env, keluarga ? "dokter" : "keluarga")
    await pasangCookie(c, env, peran, akun.id)
  })
  daftar("demoReset", async (c) => {
    const { jumlah } = await jalankanSeed(db, env, true)
    hapusCookie(c, env, "keluarga")
    hapusCookie(c, env, "dokter")
    return { ok: true, jumlah }
  })
}
