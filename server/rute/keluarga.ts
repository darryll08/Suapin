import { and, eq, isNull } from "drizzle-orm"
import { getSignedCookie } from "hono/cookie"
import { ATURAN_DEFAULT } from "../../bersama/kontrak/aturan"
import { hash } from "bcryptjs"
import { anakMilikKeluarga, bacaAdmin, bacaDokter, bacaKlinik, hapusCookie, masukSebagai, SEMUA_PERAN } from "../akses"
import { cariAkun, pastikanEmailBebas } from "../akun"
import type { Db } from "../db/klien"
import { children, doctors, rules, screenings, shared_reports } from "../db/skema"
import type { Env } from "../env"
import { buatKodeAkses, buatToken, hashKode } from "../kode"
import {
  awalHari, bacaAksesSesi, bacaAnak, bacaAturan, bacaPaparan, bacaRingkasan, riwayatTahap, sesiUntukTahap,
  MS_HARI, sesiSejak, tanggalWib, tampilSesi, usiaBulan,
} from "../logika/data"
import { cekNaikTahap } from "../logika/tahap"
import { gagal, type Daftar } from "./daftar"

export function ruteKeluarga(daftar: Daftar, db: Db, env: Env) {
  daftar("anakBuat", async (c, { email, kata_sandi, ...data }) => {
    const sekarang = new Date()
    if (data.tanggal_lahir > tanggalWib(sekarang)) gagal(400, "Tanggal lahir belum terjadi")
    await pastikanEmailBebas(db, env, email)
    const child_id = crypto.randomUUID()
    await db.insert(children).values({ ...data, id: child_id, kode_akses_hash: hashKode(buatKodeAkses()),
      email, sandi_hash: await hash(kata_sandi, 10),
      stage: 1, plan: "trial", dibuat: sekarang.toISOString(),
      trial_until: new Date(+sekarang + 5 * MS_HARI).toISOString() })
    await masukSebagai(c, env, "keluarga", child_id)
    return { child_id }
  })
  daftar("masuk", async (c, { email, kata_sandi }) => {
    const akun = await cariAkun(db, env, email, kata_sandi)
    if (!akun) gagal(401, "Email atau kata sandi tidak sesuai")
    await masukSebagai(c, env, akun.peran, akun.id)
    return { peran: akun.peran }
  })
  daftar("peranAktif", async (c) => {
    if (await bacaAdmin(c, env)) return { peran: "admin" as const }
    if (await bacaKlinik(c, db, env)) return { peran: "klinik" as const }
    if (await bacaDokter(c, db, env)) return { peran: "dokter" as const }
    const id = await getSignedCookie(c, env.SESI_RAHASIA, "tm_keluarga")
    if (id && await db.select({ id: children.id }).from(children).where(eq(children.id, id)).get()) return { peran: "keluarga" as const }
    return { peran: null }
  })
  daftar("keluar", (c) => { for (const p of SEMUA_PERAN) hapusCookie(c, env, p) })
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
    if ((await bacaAturan(tx, child_id)).confirmed_at === null) {
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
    const [sesi, paparan, ringkasan, akses, dokter, aktif, sesiTahap, riwayat_tahap] = await Promise.all([
      sesiSejak(db, id, 14), bacaPaparan(db, id), bacaRingkasan(db, id), bacaAksesSesi(db, anak),
      anak.doctor_id ? db.select({ nama: doctors.nama }).from(doctors).where(eq(doctors.id, anak.doctor_id)).get() : undefined,
      bacaAturan(db, id), sesiUntukTahap(db, id, anak.stage), riwayatTahap(db, id),
    ])
    const progres_tahap = cekNaikTahap(sesiTahap, { ...aktif.aturan, stage: anak.stage }).progres
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
        Math.max(0, Math.ceil((Date.parse(anak.trial_until) - +sekarang) / MS_HARI)) : null,
      dokter_nama: dokter?.nama ?? null, progres_tahap, riwayat_tahap }
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
