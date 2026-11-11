import { existsSync } from "node:fs"
import { serve } from "@hono/node-server"
import { buatApp } from "./app"
import { bacaEnv } from "./env"

if (existsSync(".env.local")) process.loadEnvFile(".env.local")
const app = buatApp(bacaEnv())
serve({ fetch: app.fetch, port: 8787, hostname: "127.0.0.1" }, (info) => {
  console.log("API jalan di http://127.0.0.1:" + info.port)
})
