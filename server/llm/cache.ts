import { eq } from "drizzle-orm"
import type { Kueri } from "../db/klien"
import { llm_cache } from "../db/skema"
import { hashKode } from "../kode"

type Jenis = typeof llm_cache.$inferInsert.jenis
export const kunciCache = (jenis: Jenis, input: string) => hashKode(jenis + ":" + input)

export async function bacaCache(db: Kueri, kunci: string) {
  const row = await db.select().from(llm_cache).where(eq(llm_cache.kunci, kunci)).get()
  return row?.hasil_json
}
export async function simpanCache(db: Kueri, kunci: string, jenis: Jenis, hasil_json: unknown) {
  const nilai = { hasil_json, dibuat: new Date().toISOString() }
  await db.insert(llm_cache).values({ kunci, jenis, ...nilai })
    .onConflictDoUpdate({ target: llm_cache.kunci, set: nilai })
}
