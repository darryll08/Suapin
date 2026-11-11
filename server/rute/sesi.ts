import { and, eq, sql } from "drizzle-orm"
import { anakMilikKeluarga } from "../akses"
import type { Db } from "../db/klien"
import { bites, children, food_exposures, rules, session_notes, sessions } from "../db/skema"
import { bacaAksesSesi, bacaAnak, bacaAturan, sesiUntukTahap } from "../logika/data"
import { cekNaikTahap } from "../logika/tahap"
import { gagal, type Daftar } from "./daftar"

export function ruteSesi(daftar: Daftar, db: Db) {
  daftar("sesiSimpan", (c, data) => {
    const { child_id, gigitan, tahap: stage, mulai, selesai, ...isi } = data
    anakMilikKeluarga(c, child_id)
    const mulaiMs = Date.parse(mulai)
    const selesaiMs = Date.parse(selesai)
    if (!Number.isFinite(mulaiMs) || !Number.isFinite(selesaiMs) || selesaiMs < mulaiMs) {
      gagal(400, "Waktu sesi tidak valid")
    }
    const sesi = { ...isi, mulai: new Date(mulaiMs).toISOString(), selesai: new Date(selesaiMs).toISOString() }
    return db.transaction(async (tx) => {
      const anak = await bacaAnak(tx, child_id)
      const sama = await tx.select({ id: sessions.id }).from(sessions)
        .where(and(eq(sessions.child_id, child_id), eq(sessions.mulai, sesi.mulai), eq(sessions.selesai, sesi.selesai))).get()
      if (sama) return { session_id: sama.id, naik_tahap: false, tahap_baru: anak.stage, saran_turun_tahap: false, paparan: null }
      const akses = await bacaAksesSesi(tx, anak)
      if (!akses.sesi_dibuka) gagal(403, "Sesi belum dapat dimulai")
      const hitung = { diterima: 0, ditolak: 0, ngemut: 0 }
      for (const g of gigitan) hitung[g.hasil]++
      const session_id = crypto.randomUUID()
      await tx.insert(sessions).values({ ...sesi, ...hitung, id: session_id, child_id, stage })
      for (let i = 0; i < gigitan.length; i += 100) {
        await tx.insert(bites).values(gigitan.slice(i, i + 100).map((g) => ({ ...g, session_id })))
      }
      let paparan = null
      if (sesi.makanan_baru && hitung.diterima > 0) {
        const [row] = await tx.insert(food_exposures).values({
          child_id, makanan: sesi.menu, jumlah: 1, terakhir: sesi.mulai,
        }).onConflictDoUpdate({
          target: [food_exposures.child_id, food_exposures.makanan],
          set: { jumlah: sql`${food_exposures.jumlah} + 1`, terakhir: sql`max(${food_exposures.terakhir}, ${sesi.mulai})` },
        }).returning({ makanan: food_exposures.makanan, jumlah: food_exposures.jumlah })
        paparan = row ?? null
      }
      const aktif = await bacaAturan(tx, child_id)
      const hasil = cekNaikTahap(await sesiUntukTahap(tx, child_id, anak.stage), aktif.aturan)
      const naik_tahap = stage === anak.stage && hasil.siapNaik && anak.plan !== "klinik"
      const tahap_baru = naik_tahap ? anak.stage + 1 : anak.stage
      if (naik_tahap) {
        await tx.update(children).set({ stage: tahap_baru }).where(eq(children.id, child_id))
        await tx.insert(rules).values({ child_id, stage: tahap_baru, source: aktif.source,
          rules_json: { ...aktif.aturan, stage: tahap_baru }, confirmed_at: new Date().toISOString() })
      }
      return { session_id, naik_tahap, tahap_baru, saran_turun_tahap: hasil.saranTurun, paparan }
    })
  })
  daftar("catatanSimpan", async (c, catatan) => {
    const session_id = c.req.param("id")!
    const milik = await db.select({ id: sessions.id }).from(sessions)
      .where(and(eq(sessions.id, session_id), eq(sessions.child_id, c.var.childId!))).get()
    if (!milik) gagal(404, "Sesi tidak ditemukan")
    await db.insert(session_notes).values({ ...catatan, session_id })
      .onConflictDoUpdate({ target: session_notes.session_id, set: catatan })
  })
}
