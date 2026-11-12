import { compare, hash } from "bcryptjs"
import { timingSafeEqual } from "node:crypto"
import { eq } from "drizzle-orm"
import type { Db } from "./db/klien"
import { children, clinics, doctors } from "./db/skema"
import type { Env } from "./env"
import { buatKodeAkses, hashPalsu } from "./kode"
import { gagal } from "./rute/daftar"

/** Bandingkan selalu dengan biaya yang sama supaya waktu respons tidak membocorkan email admin. */
export async function adminCocok(env: Env, email: string, kata_sandi: string) {
  await compare(kata_sandi.slice(0, 72), hashPalsu)
  const pisah = String.fromCharCode(10)
  const a = Buffer.from(email + pisah + kata_sandi)
  const b = Buffer.from(env.ADMIN_EMAIL + pisah + (env.ADMIN_SANDI ?? ""))
  return !!env.ADMIN_SANDI && a.length === b.length && timingSafeEqual(a, b)
}

export type PeranAkun = "keluarga" | "dokter" | "klinik" | "admin"

/** Email dipakai sekali lintas peran (keluarga, dokter, klinik, admin). */
export async function pastikanEmailBebas(db: Db, env: Env, email: string) {
  const [a, b, c] = await Promise.all([
    db.select({ id: children.id }).from(children).where(eq(children.email, email)).get(),
    db.select({ id: doctors.id }).from(doctors).where(eq(doctors.email, email)).get(),
    db.select({ id: clinics.id }).from(clinics).where(eq(clinics.email, email)).get(),
  ])
  if (a || b || c || email === env.ADMIN_EMAIL) gagal(409, "Email ini sudah dipakai akun lain")
}

/** Cari akun dari email + sandi. Biaya bcrypt selalu dibayar sekali supaya waktu tidak membocorkan email. */
export async function cariAkun(db: Db, env: Env, email: string, kata_sandi: string): Promise<{ peran: PeranAkun; id: string } | null> {
  if (await adminCocok(env, email, kata_sandi)) return { peran: "admin", id: env.ADMIN_EMAIL }
  const [anak, dokter, klinik] = await Promise.all([
    db.select({ id: children.id, h: children.sandi_hash }).from(children).where(eq(children.email, email)).get(),
    db.select({ id: doctors.id, h: doctors.sandi_hash, aktif: doctors.aktif }).from(doctors).where(eq(doctors.email, email)).get(),
    db.select({ id: clinics.id, h: clinics.sandi_hash }).from(clinics).where(eq(clinics.email, email)).get(),
  ])
  const akun = anak?.h ? { peran: "keluarga" as const, id: anak.id, h: anak.h }
    : dokter?.h && dokter.aktif ? { peran: "dokter" as const, id: dokter.id, h: dokter.h }
    : klinik?.h ? { peran: "klinik" as const, id: klinik.id, h: klinik.h } : null
  const aman = Buffer.byteLength(kata_sandi) <= 72
  const benar = await compare(aman ? kata_sandi : "", akun?.h ?? hashPalsu)
  return akun && benar && aman ? { peran: akun.peran, id: akun.id } : null
}

/** Sandi sementara 12 karakter (alfabet tanpa huruf/angka mirip); server hanya menyimpan hash. */
export async function sandiBaru() {
  const sandi_sementara = buatKodeAkses()
  return { sandi_sementara, sandi_hash: await hash(sandi_sementara, 10) }
}
