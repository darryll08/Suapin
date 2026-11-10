import { existsSync } from "node:fs"
import { defineConfig } from "drizzle-kit"

if (existsSync(".env.local")) process.loadEnvFile(".env.local")
const url = process.env.DATABASE_URL || "file:local.db"
export default defineConfig({
  schema: "./server/db/skema.ts",
  out: "./drizzle",
  ...(url.startsWith("file:")
    ? { dialect: "sqlite", dbCredentials: { url: url.slice(5) } }
    : { dialect: "turso", dbCredentials: { url, authToken: process.env.TURSO_AUTH_TOKEN } }),
})
