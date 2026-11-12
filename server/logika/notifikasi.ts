import { desc, eq, isNotNull, max } from "drizzle-orm"
import { sendNotification } from "web-push"
import type { Db } from "../db/klien"
import { children, notifications, push_subscriptions, sessions } from "../db/skema"
import type { Env } from "../env"
import { MS_HARI, paketSampai } from "./data"

/** Pengingat dikirim bila tidak ada sesi selama 2 hari, lalu paling sering tiap 2 hari. */
export const HARI_PENGINGAT = 2
type Jenis = typeof notifications.$inferInsert["jenis"]
type Calon = { jenis: Jenis; kunci: string; judul: string; isi: string; tautan: string }

/** Isi notifikasi. Bahasa datar, tanpa menyalahkan (UI UX 15: dilarang "gagal", "habiskan"). */
export function teksNotifikasi(jenis: Jenis, panggilan: string, sisaHari = 0): Omit<Calon, "kunci" | "jenis"> {
  switch (jenis) {
    case "pengingat": return { judul: `Yuk makan bareng ${panggilan} lagi`,
      isi: "Sudah beberapa hari belum ada sesi. Satu sesi singkat sudah cukup untuk menjaga kebiasaan.", tautan: "/sesi" }
    case "trial_hampir_habis": return { judul: "Trial berakhir besok",
      isi: `Lanjutkan Program 30 Hari supaya sesi ${panggilan} tidak terhenti. Data tetap tersimpan.`, tautan: "/langganan" }
    case "trial_habis": return { judul: "Trial 5 hari sudah selesai",
      isi: `Sesi makan ${panggilan} terkunci sampai program dilanjutkan. Catatan dan laporan tetap bisa dibuka.`, tautan: "/langganan" }
    case "paket_hampir_habis": return { judul: `Program 30 Hari tinggal ${sisaHari} hari`,
      isi: `Perpanjang supaya sesi ${panggilan} tetap berjalan tanpa jeda.`, tautan: "/langganan" }
    case "paket_habis": return { judul: "Program 30 Hari sudah selesai",
      isi: `Perpanjang program untuk membuka sesi ${panggilan} lagi. Data tetap tersimpan.`, tautan: "/langganan" }
    case "uji": return { judul: "Notifikasi Suapin aktif", isi: "Pengingat makan akan muncul di perangkat ini.", tautan: "/beranda" }
  }
}

/** Notifikasi yang seharusnya ada untuk satu anak saat ini. `kunci` membuat tiap kejadian hanya dibuat sekali. */
export function calonNotifikasi(anak: typeof children.$inferSelect, sesiTerakhir: string | null, sekarang: Date): Calon[] {
  const hasil: Calon[] = []
  const t = +sekarang
  const tambah = (jenis: Jenis, kunci: string, sisa?: number) =>
    hasil.push({ jenis, kunci, ...teksNotifikasi(jenis, anak.panggilan, sisa) })

  const aktif = Date.parse(sesiTerakhir ?? anak.dibuat)
  const diam = Math.floor((t - aktif) / MS_HARI)
  if (diam >= HARI_PENGINGAT) tambah("pengingat", `${new Date(aktif).toISOString().slice(0, 10)}#${Math.floor(diam / HARI_PENGINGAT)}`)

  if (anak.plan === "trial" && anak.trial_until) {
    const sisa = Date.parse(anak.trial_until) - t
    if (sisa <= 0) tambah("trial_habis", anak.trial_until)
    else if (sisa <= MS_HARI) tambah("trial_hampir_habis", anak.trial_until)
  }
  const sampai = paketSampai(anak)
  if (sampai) {
    const sisa = Date.parse(sampai) - t
    if (sisa <= 0) tambah("paket_habis", sampai)
    else if (sisa <= 3 * MS_HARI) tambah("paket_hampir_habis", sampai, Math.ceil(sisa / MS_HARI))
  }
  return hasil
}

export function pushAktif(env: Env) {
  return Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY)
}

/** Kirim Web Push ke semua perangkat anak ini. Langganan yang sudah tidak berlaku (404/410) dihapus. */
export async function kirimPush(db: Db, env: Env, childId: string, n: Omit<Calon, "kunci">) {
  if (!pushAktif(env)) return 0
  const daftar = await db.select().from(push_subscriptions).where(eq(push_subscriptions.child_id, childId)).all()
  const isi = JSON.stringify({ judul: n.judul, isi: n.isi, tautan: n.tautan, tag: n.jenis })
  let terkirim = 0
  await Promise.all(daftar.map(async (s) => {
    try {
      await sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, isi, {
        vapidDetails: { subject: env.VAPID_SUBJECT ?? "mailto:admin@demo.test", publicKey: env.VAPID_PUBLIC_KEY!,
          privateKey: env.VAPID_PRIVATE_KEY! }, TTL: 60 * 60 * 24,
      })
      terkirim++
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode
      if (status === 404 || status === 410) await db.delete(push_subscriptions).where(eq(push_subscriptions.endpoint, s.endpoint))
      else console.error("Push gagal terkirim:", status ?? (e instanceof Error ? e.message : e))
    }
  }))
  return terkirim
}

/** Buat notifikasi yang belum ada untuk satu anak, lalu kirim push untuk yang baru. */
export async function periksaAnak(db: Db, env: Env, anak: typeof children.$inferSelect, sekarang = new Date()) {
  const terakhir = await db.select({ t: max(sessions.mulai) }).from(sessions).where(eq(sessions.child_id, anak.id)).get()
  let baru = 0
  for (const c of calonNotifikasi(anak, terakhir?.t ?? null, sekarang)) {
    const [dibuat] = await db.insert(notifications).values({ ...c, child_id: anak.id, dibuat: sekarang.toISOString() })
      .onConflictDoNothing().returning({ id: notifications.id })
    if (dibuat) { baru++; await kirimPush(db, env, anak.id, c) }
  }
  return baru
}

/** Pemeriksaan berkala untuk semua akun keluarga (yang punya email). */
export async function periksaSemua(db: Db, env: Env, sekarang = new Date()) {
  const semua = await db.select().from(children)
    .where(isNotNull(children.email)).all()
  let baru = 0
  for (const anak of semua) baru += await periksaAnak(db, env, anak, sekarang)
  return baru
}

export function daftarNotifikasi(db: Db, childId: string) {
  return db.select().from(notifications).where(eq(notifications.child_id, childId))
    .orderBy(desc(notifications.dibuat)).limit(30).all()
}
