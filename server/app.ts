import { sql } from "drizzle-orm"
import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { SesiEnv } from "./akses"
import { buatDb } from "./db/klien"
import type { Env } from "./env"
import { buatLlm } from "./llm/klien"
import { parseResep } from "./llm/resep"
import { buatRingkasan } from "./llm/ringkasan"
import { bacaAnak, mingguIni } from "./logika/data"
import { ruteAdmin } from "./rute/admin"
import { daftarRute, gagal } from "./rute/daftar"
import { ruteDemo } from "./rute/demo"
import { ruteKeluarga } from "./rute/keluarga"
import { ruteKlinik } from "./rute/klinik"
import { ruteSesi } from "./rute/sesi"

export function buatApp(env: Env, db = buatDb(env), llm = buatLlm(env)) {
  const app = new Hono<SesiEnv>().basePath("/api")
  app.notFound((c) => c.json({ galat: "Halaman tidak ditemukan" }, 404))
  app.onError((error, c) => {
    if (error instanceof HTTPException) return c.json({ galat: error.message }, error.status)
    console.error("Galat internal API", c.req.method)
    return c.json({ galat: "Terjadi kesalahan. Coba lagi." }, 500)
  })
  const daftar = daftarRute(app, db, env)
  ruteKeluarga(daftar, db, env)
  ruteSesi(daftar, db)
  ruteKlinik(daftar, db, env)
  ruteDemo(daftar, db, env)
  ruteAdmin(daftar, db, env)
  daftar("sehat", async () => {
    let dbAktif = true
    try { await db.run(sql`select 1`) } catch { dbAktif = false }
    return { db: dbAktif, openai_key: Boolean(env.OPENAI_API_KEY), demo: env.DEMO === "1" }
  })
  daftar("aturanParse", (c, { teks }) => parseResep(db, llm, c.var.dokter!.clinic_id, teks))
  daftar("ringkasanBuat", async (c, input) => {
    const id = c.req.param("childId")!
    const anak = await bacaAnak(db, id)
    if (c.var.childId !== id && (!c.var.dokter || c.var.dokter.clinic_id !== anak.clinic_id)) {
      gagal(404, "Anak tidak ditemukan")
    }
    return buatRingkasan(db, llm, env.OPENAI_MODEL, id, input?.minggu ?? mingguIni(), c.req.query("ulang") === "1")
  })
  return app
}
