import { z } from "zod"

const opsional = z.string().min(1).optional()
const skema = z.object({
  DATABASE_URL: z.string().min(1),
  TURSO_AUTH_TOKEN: opsional,
  SESI_RAHASIA: z.string().min(32),
  DEMO: z.enum(["0", "1"]).default("0"),
  DEMO_DOKTER_SANDI: opsional,
  ADMIN_EMAIL: z.email().default("admin@demo.test"),
  ADMIN_SANDI: opsional,
  OPENAI_API_KEY: opsional,
  OPENAI_MODEL: z.string().min(1).default("gpt-6-luna"),
  NODE_ENV: z.string().optional(),
})

export type Env = z.infer<typeof skema>

export function bacaEnv(): Env {
  const hasil = skema.safeParse(Object.fromEntries(
    Object.entries(process.env).filter(([, nilai]) => nilai !== ""),
  ))
  if (!hasil.success) {
    throw new Error("Konfigurasi server tidak valid (" +
      hasil.error.issues.map(({ path }) => path.join(".")).join(", ") + ")")
  }
  return hasil.data
}
