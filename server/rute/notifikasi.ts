import { and, eq } from "drizzle-orm"
import type { Db } from "../db/klien"
import { notifications, push_subscriptions } from "../db/skema"
import type { Env } from "../env"
import { bacaAnak } from "../logika/data"
import { daftarNotifikasi, kirimPush, periksaAnak, pushAktif, teksNotifikasi } from "../logika/notifikasi"
import { gagal, type Daftar } from "./daftar"

export function ruteNotifikasi(daftar: Daftar, db: Db, env: Env) {
  daftar("notifikasiDaftar", async (c) => {
    const id = c.var.childId!
    // Periksa saat dibuka juga, supaya notifikasi muncul walau pemeriksa berkala belum jalan.
    await periksaAnak(db, env, await bacaAnak(db, id))
    const semua = await daftarNotifikasi(db, id)
    return { belum_dibaca: semua.filter((n) => !n.dibaca).length,
      kunci_publik: pushAktif(env) ? env.VAPID_PUBLIC_KEY! : null,
      notifikasi: semua.map(({ id, jenis, judul, isi, tautan, dibuat, dibaca }) => ({ id, jenis, judul, isi, tautan, dibuat, dibaca })) }
  })
  daftar("notifikasiBaca", async (c) => {
    await db.update(notifications).set({ dibaca: true })
      .where(and(eq(notifications.child_id, c.var.childId!), eq(notifications.dibaca, false)))
  })
  daftar("pushLangganan", async (c, { endpoint, keys }) => {
    const baris = { child_id: c.var.childId!, p256dh: keys.p256dh, auth: keys.auth, dibuat: new Date().toISOString() }
    await db.insert(push_subscriptions).values({ endpoint, ...baris })
      .onConflictDoUpdate({ target: push_subscriptions.endpoint, set: baris })
  })
  daftar("pushBerhenti", async (c, { endpoint }) => {
    await db.delete(push_subscriptions)
      .where(and(eq(push_subscriptions.endpoint, endpoint), eq(push_subscriptions.child_id, c.var.childId!)))
  })
  // Demo lomba: picu notifikasi sekarang (pengingat/trial/paket) tanpa menunggu waktunya.
  daftar("demoNotifikasi", async (c, { jenis }) => {
    if (env.DEMO !== "1") gagal(404, "Halaman tidak ditemukan")
    const anak = await bacaAnak(db, c.var.childId!)
    const n = { jenis, ...teksNotifikasi(jenis, anak.panggilan, 3) }
    await db.insert(notifications).values({ ...n, child_id: anak.id, kunci: "demo#" + crypto.randomUUID(),
      dibuat: new Date().toISOString() })
    return { terkirim_push: await kirimPush(db, env, anak.id, n) }
  })
}
