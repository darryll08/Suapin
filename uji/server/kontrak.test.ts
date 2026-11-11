import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { expect, it } from "vitest"
import { API, type NamaEndpoint } from "../../bersama/kontrak/api"
import { CONTOH_API_KELUARGA } from "../../bersama/kontrak/contoh/keluarga"
import { buatApp } from "../../server/app"
import { buatDb } from "../../server/db/klien"

it("semua endpoint kontrak terpasang", () => {
  const env = { DATABASE_URL: "file::memory:", SESI_RAHASIA: crypto.randomUUID(),
    DEMO: "0", OPENAI_MODEL: "uji" } as const
  const db = buatDb(env)
  try {
    const rute = new Set(buatApp(env, db).routes.map(({ method, path }) => method + " " + path))
    for (const e of Object.values(API)) expect(rute.has(e.metode + " " + e.path), e.path).toBe(true)
  } finally { db.$client.close() }
})

it("contoh endpoint yang tersedia sesuai kontrak", () => {
  for (const [nama, data] of Object.entries(CONTOH_API_KELUARGA)) {
    expect(API[nama as NamaEndpoint].res.safeParse(data).success, nama).toBe(true)
  }
  const folder = "bersama/kontrak/contoh"
  for (const file of readdirSync(folder).filter((p) => p.endsWith(".json"))) {
    const nama = file.slice(0, -5) as NamaEndpoint
    if (Object.hasOwn(API, nama)) {
      const data: unknown = JSON.parse(readFileSync(join(folder, file), "utf8"))
      expect(API[nama].res.safeParse(data).success, file).toBe(true)
    }
  }
})

it("akses HTTP klien lewat panggil", () => {
  for (const file of readdirSync("src", { recursive: true, encoding: "utf8" })) {
    const path = file.replaceAll("\\", "/")
    if (!/\.tsx?$/.test(path) || path === "lib/panggil.ts" || path.startsWith("suara/")) continue
    expect(readFileSync(join("src", file), "utf8"), path).not.toMatch(/\bfetch\s*\(/)
  }
})
