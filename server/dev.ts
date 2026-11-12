import { existsSync } from "node:fs"
import { serve } from "@hono/node-server"
import { buatApp } from "./app"
import { buatDb } from "./db/klien"
import { bacaEnv } from "./env"
import { periksaSemua } from "./logika/notifikasi"

if (existsSync(".env.local")) process.loadEnvFile(".env.local")
const env = bacaEnv()
const db = buatDb(env)
const app = buatApp(env, db)
// Pemeriksa notifikasi berkala (pengingat, trial/paket). Di Vercel diganti Cron Job.
const periksa = () => periksaSemua(db, env).then((n) => { if (n) console.log("Notifikasi baru:", n) },
  (e: unknown) => console.error("Pemeriksaan notifikasi gagal:", e instanceof Error ? e.message : e))
setTimeout(periksa, 5000)
setInterval(periksa, 10 * 60 * 1000)
serve({ fetch: app.fetch, port: 8787, hostname: "127.0.0.1" }, (info) => {
  console.log("API jalan di http://127.0.0.1:" + info.port)
})
