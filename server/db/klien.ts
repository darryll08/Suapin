import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import type { Env } from "../env"
import * as schema from "./skema"

export function buatDb(env: Pick<Env, "DATABASE_URL" | "TURSO_AUTH_TOKEN">) {
  const client = createClient({ url: env.DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN })
  return drizzle(client, { schema })
}
export type Db = ReturnType<typeof buatDb>
export type Transaksi = Parameters<Parameters<Db["transaction"]>[0]>[0]
export type Kueri = Db | Transaksi
