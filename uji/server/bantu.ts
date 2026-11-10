import { migrate } from "drizzle-orm/libsql/migrator"
import { buatApp } from "../../server/app"
import { buatDb } from "../../server/db/klien"
import { jalankanSeed } from "../../server/db/seed"
import type { Env } from "../../server/env"
import type { Llm } from "../../server/llm/klien"

export async function bantu() {
  const env: Env = { DATABASE_URL: "file::memory:?cache=shared", SESI_RAHASIA: crypto.randomUUID(),
    DEMO: "1", DEMO_DOKTER_SANDI: crypto.randomUUID(), OPENAI_MODEL: "model-uji" }
  const jangkar = buatDb(env)
  const db = buatDb(env)
  const tutup = () => { db.$client.close(); jangkar.$client.close() }
  try {
    await migrate(db, { migrationsFolder: "./drizzle" })
    const seed = await jalankanSeed(db, env)
    const app = buatApp(env, db)
    function pemanggil(instance: typeof app, cookie?: string) {
      return (url: string, metode = "GET", body?: unknown) =>
        instance.request(url, { method: metode, body: body === undefined ? undefined : JSON.stringify(body),
          headers: { ...(cookie && { cookie }), ...(body !== undefined && { "content-type": "application/json" }) } })
    }
    const req = pemanggil(app)
    async function masuk(url: string, data: unknown, nama: string) {
      const respons = await req(url, "POST", data)
      if (respons.status !== 204) throw new Error("Login uji gagal: " + respons.status)
      const cookie = respons.headers.getSetCookie().find((x) => x.startsWith(nama + "="))
      if (!cookie) throw new Error("Cookie uji tidak tersedia")
      return cookie.split(";")[0]!
    }
    const [dika, nara, dokter, lain] = await Promise.all([
      masuk("/api/masuk", { kode_akses: seed.kodeDika }, "tm_keluarga"),
      masuk("/api/masuk", { kode_akses: seed.kodeNara }, "tm_keluarga"),
      masuk("/api/clinic/login", { email: "dokter@demo.test", kata_sandi: env.DEMO_DOKTER_SANDI }, "tm_dokter"),
      masuk("/api/clinic/login", { email: "lain@demo.test", kata_sandi: env.DEMO_DOKTER_SANDI }, "tm_dokter"),
    ])
    return { db, env, app, req, seed, tutup, dika, nara, dokter, lain,
      sebagai: (cookie: string, llm?: Llm) => pemanggil(llm ? buatApp(env, db, llm) : app, cookie) }
  } catch (e) { tutup(); throw e }
}
