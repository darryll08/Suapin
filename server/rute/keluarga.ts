import { and, eq, isNull } from "drizzle-orm"
import { ATURAN_DEFAULT } from "../../bersama/kontrak/aturan"
import { anakMilikKeluarga, pasangCookie } from "../akses"
import type { Db } from "../db/klien"
import { children, rules, screenings, shared_reports } from "../db/skema"
import type { Env } from "../env"
import { buatKodeAkses, buatToken, hashKode } from "../kode"
import {
  awalHari, bacaAksesSesi, bacaAnak, bacaAturan, bacaPaparan, bacaRingkasan,
  MS_HARI, sesiSejak, tanggalWib, tampilSesi, usiaBulan,
} from "../logika/data"
import { gagal, type Daftar } from "./daftar"

export function ruteKeluarga(daftar: Daftar, db: Db, env: Env) {
  daftar("anakBuat", async (c, data) => {
    const sekarang = new Date()
    if (data.tanggal_lahir > tanggalWib(sekarang)) gagal(400, "Tanggal lahir belum terjadi")
    const kode_akses = buatKodeAkses()
    const child_id = crypto.randomUUID()
    await db.insert(children).values({ ...data, id: child_id, kode_akses_hash: hashKode(kode_akses),
      stage: 1, plan: "trial", dibuat: sekarang.toISOString(),
      trial_until: new Date(+sekarang + 5 * MS_HARI).toISOString() })
    await pasangCookie(c, env, "keluarga", child_id)
    return { child_id, kode_akses }
  })
  daftar("keluargaMasuk", async (c, data) => {
    const anak = await db.select({ id: children.id }).from(children)
      .where(eq(children.kode_akses_hash, hashKode(data.kode_akses.toUpperCase()))).get()
    if (!anak) gagal(401, "Kode tidak dikenal")
    await pasangCookie(c, env, "keluarga", anak.id)
  })
  daftar("saya", async (c) => {
    const anak = await bacaAnak(db, c.var.childId!)
    const { plan, ...akses } = await bacaAksesSesi(db, anak)
    if (plan === "expired" && anak.plan === "trial") {
      await db.update(children).set({ plan }).where(and(eq(children.id, anak.id), eq(children.plan, "trial")))
    }
    return { child: { ...anak, usia_bulan: usiaBulan(anak.tanggal_lahir), plan }, ...akses }
  })
  daftar("skriningSimpan", (c, data) => db.transaction(async (tx) => {
    const child_id = c.var.childId!
    const tanggal = new Date().toISOString()
    const ada_tanda_bahaya = data.jawaban.some(Boolean)
    await tx.insert(screenings).values({ child_id, tanggal, ada_tanda_bahaya, jawaban_json: data.jawaban })
    if (!ada_tanda_bahaya && (await bacaAturan(tx, child_id)).confirmed_at === null) {
      await tx.insert(rules).values({ child_id, source: "default", rules_json: ATURAN_DEFAULT,
        stage: 1, confirmed_at: tanggal })
    }
    return { ada_tanda_bahaya }
  }))
  daftar("aturanBaca", (c) => {
    const id = c.req.param("id")!
    anakMilikKeluarga(c, id)
    return bacaAturan(db, id)
  })
  daftar("laporanKeluarga", async (c) => {
    const id = c.req.param("id")!
    anakMilikKeluarga(c, id)
    const anak = await bacaAnak(db, id)
    const [sesi, paparan, ringkasan, akses] = await Promise.all([
      sesiSejak(db, id, 14), bacaPaparan(db, id), bacaRingkasan(db, id), bacaAksesSesi(db, anak),
    ])
    const hariDapatStiker = new Set(sesi.filter((row) => row.diterima > 0).map((row) => tanggalWib(new Date(row.mulai))))
    const sekarang = new Date()
    const hariIni = tanggalWib(sekarang)
    const hariKe = (new Date(hariIni).getUTCDay() + 6) % 7
    const senin = +awalHari(hariIni) - hariKe * MS_HARI
    return { tahap: anak.stage, paparan, sesi: sesi.map((row) => ({
      ...tampilSesi(row), id: row.id, durasi: Math.round(row.durasi_detik / 60),
    })), ringkasan_keluarga: ringkasan?.keluarga ?? null,
      stiker_minggu_ini: Array.from({ length: 7 }, (_, i) =>
        i <= hariKe && hariDapatStiker.has(tanggalWib(new Date(senin + i * MS_HARI)))),
      plan: akses.plan, trial_sisa_hari: akses.plan === "trial" && anak.trial_until ?
        Math.max(0, Math.ceil((Date.parse(anak.trial_until) - +sekarang) / MS_HARI)) : null }
  })
  daftar("laporanBagikan", async (c) => {
    const token = buatToken()
    await db.insert(shared_reports).values({ token, child_id: c.var.childId!, dibuat: new Date().toISOString() })
    return { token, url: "/r/" + token }
  })
  daftar("paketAktifkan", async (c) => {
    const anak = await db.update(children).set({ plan: "program", program_since: new Date().toISOString() })
      .where(and(eq(children.id, c.var.childId!), isNull(children.clinic_id))).returning()
    if (!anak.length) gagal(409, "Paket tidak dapat diubah untuk pasien klinik")
    return { plan: "program" }
  })
}
