import { pathToFileURL } from "node:url"
import { existsSync } from "node:fs"
import { hash } from "bcryptjs"
import { eq, inArray, notInArray, sql } from "drizzle-orm"
import { ATURAN_DEFAULT, type Aturan } from "../../bersama/kontrak/aturan"
import { bacaEnv, type Env } from "../env"
import { buatKodeAkses, hashKode } from "../kode"
import { simpanCache } from "../llm/cache"
import { contohResep, kunciResep } from "../llm/resep"
import { awalHari, mingguIni, MS_HARI, tanggalWib } from "../logika/data"
import { buatDb, type Db } from "./klien"
import {
  appointments, bites, children, clinics, doctors, food_exposures, notifications, push_subscriptions, rules,
  screenings, session_notes, sessions, shared_reports, weekly_summaries,
} from "./skema"

// Semua akun demo memakai sandi DEMO_DOKTER_SANDI dari .env.local.
export const KLINIK_DEMO_EMAIL = "klinik@demo.test"
export const KELUARGA_DEMO_EMAIL = "keluarga@demo.test"
export const DOKTER_DEMO_EMAIL = "dokter@demo.test"
export const DIKA = "9de0aead-af53-4d3a-8943-0059d52ca1aa"
const DEMO_KLINIK = "bb316e17-4d65-45ea-bdfb-2278431f4001"
const LAIN_KLINIK = "bb316e17-4d65-45ea-bdfb-2278431f4002"
export const DOKTER_DEMO = "c0c7a1d0-0000-4000-8000-000000000001"
const DOKTER_SARI = "c0c7a1d0-0000-4000-8000-000000000002"
const TERAPIS_NADIA = "c0c7a1d0-0000-4000-8000-000000000003"
export const DOKTER_LAIN = "c0c7a1d0-0000-4000-8000-000000000009"
const ID_KLINIK = [DEMO_KLINIK, LAIN_KLINIK]
const ID_DOKTER = [DOKTER_DEMO, DOKTER_SARI, TERAPIS_NADIA, DOKTER_LAIN]
const JAM = 3600000

type Pola = "naik" | "baik" | "sulit" | "stabil" | "baru"
type Profil = {
  panggilan: string; bulan: number; sapaan: "mbak" | "bu" | "oma" | "ayah"; pengasuh: string; stage: number
  dokter: string | null; pola: Pola; menu: string[]; resep?: { teks: string; aturan: Partial<Aturan> }
}

// Pasien contoh Klinik Tumbuh Kembang Contoh. Pola sengaja beragam supaya dashboard punya isi:
// siap naik tahap, saran turun tahap, pasien baru, dan pasien tanpa dokter.
const PASIEN: Profil[] = [
  { panggilan: "Alya", bulan: 44, sapaan: "bu", pengasuh: "Bu Wulan", stage: 2, dokter: DOKTER_DEMO, pola: "naik",
    menu: ["brokoli", "wortel", "nasi"], resep: { teks: "Sesi maksimal 20 menit. Naik tahap setelah minimal 5 sesi, 3 sesi terakhir berturut-turut minimal 75% suapan diterima.",
      aturan: { max_minutes: 20, advance_rule: { sessions: 5, first_stage_sessions: 8, percent: 75, streak: 3 } } } },
  { panggilan: "Gilang", bulan: 53, sapaan: "ayah", pengasuh: "Ayah Doni", stage: 2, dokter: DOKTER_DEMO, pola: "sulit",
    menu: ["bayam", "ikan", "nasi"] },
  { panggilan: "Kirana", bulan: 61, sapaan: "mbak", pengasuh: "Mbak Sri", stage: 3, dokter: DOKTER_DEMO, pola: "baik",
    menu: ["ayam", "labu", "pepaya"], resep: { teks: "Akhiri sesi bila menolak 10 menit berturut-turut. Saat ngemut, tawarkan air putih sedikit.",
      aturan: { end_after_refusal_minutes: 10, ngemut_hint: "Tawarkan air putih sedikit, tunggu tanpa memaksa" } } },
  { panggilan: "Bayu", bulan: 38, sapaan: "oma", pengasuh: "Oma Lies", stage: 1, dokter: DOKTER_DEMO, pola: "baru",
    menu: ["telur_rebus", "kentang"] },
  { panggilan: "Laras", bulan: 47, sapaan: "bu", pengasuh: "Bu Tika", stage: 2, dokter: DOKTER_SARI, pola: "stabil",
    menu: ["tempe", "buncis", "nasi"] },
  { panggilan: "Fikri", bulan: 57, sapaan: "mbak", pengasuh: "Mbak Yuni", stage: 1, dokter: DOKTER_SARI, pola: "naik",
    menu: ["tahu", "kembang_kol", "pisang"] },
  { panggilan: "Salsa", bulan: 41, sapaan: "bu", pengasuh: "Bu Ratna", stage: 3, dokter: DOKTER_SARI, pola: "baik",
    menu: ["ikan", "pakcoy", "apel"], resep: { teks: "Sesi 25 menit, naik tahap setelah minimal 4 sesi dan 2 sesi berturut-turut minimal 80% suapan diterima.",
      aturan: { max_minutes: 25, advance_rule: { sessions: 4, first_stage_sessions: 8, percent: 80, streak: 2 } } } },
  { panggilan: "Rafa", bulan: 50, sapaan: "ayah", pengasuh: "Ayah Hendra", stage: 1, dokter: TERAPIS_NADIA, pola: "sulit",
    menu: ["wortel", "nasi"] },
  { panggilan: "Tiara", bulan: 65, sapaan: "mbak", pengasuh: "Mbak Ani", stage: 4, dokter: TERAPIS_NADIA, pola: "baik",
    menu: ["brokoli", "ayam", "mangga"] },
  { panggilan: "Zahra", bulan: 39, sapaan: "bu", pengasuh: "Bu Melati", stage: 1, dokter: null, pola: "baru", menu: ["nasi"] },
  { panggilan: "Kenzo", bulan: 45, sapaan: "oma", pengasuh: "Oma Rini", stage: 1, dokter: null, pola: "baru", menu: ["roti"] },
]

function hasilPola(pola: Pola, hari: number, k: number, stage: number) {
  switch (pola) {
    case "naik": return { diterima: Math.min(11, 3 + Math.floor((13 - hari) / 2) + k % 2), ditolak: Math.max(0, 3 - Math.floor((13 - hari) / 4)) }
    case "baik": return { diterima: 6 + (hari + k) % 4, ditolak: (hari + k) % 3 === 0 ? 1 : 0 }
    case "stabil": return { diterima: 4 + hari % 3, ditolak: 2 + k % 2 }
    case "baru": return { diterima: 2 + k % 2, ditolak: 2 - k % 2 }
    // Pasien sulit: tiga sesi terakhir tanpa suapan diterima memicu "saran turun tahap" (stage > 1).
    case "sulit": return hari <= 2 && stage > 1 ? { diterima: 0, ditolak: 5 + k % 3 }
      : { diterima: 1 + (hari + k) % 3, ditolak: 4 + (hari * (k + 1)) % 4 }
  }
}

const RINGKASAN: Record<Pola, string> = {
  naik: "Jumlah suapan diterima naik bertahap selama dua minggu. Penolakan menurun, terutama pada sesi siang.",
  baik: "Penerimaan konsisten tinggi di hampir semua sesi. Penolakan jarang dan tidak terpusat pada menu tertentu.",
  stabil: "Penerimaan stabil di kisaran sedang. Penolakan lebih sering pada sayur hijau dibanding lauk.",
  sulit: "Penolakan dominan di sebagian besar sesi, dengan tiga sesi terakhir tanpa suapan diterima.",
  baru: "Data masih sedikit (pasien baru). Pola belum dapat disimpulkan.",
}

async function sisipkan<T>(daftar: T[], ukuran: number, simpan: (bagian: T[]) => Promise<unknown>) {
  for (let i = 0; i < daftar.length; i += ukuran) await simpan(daftar.slice(i, i + ukuran))
}

export async function jalankanSeed(db: Db, env: Env, resetSemua = false) {
  // DEMO_DOKTER_SANDI = sandi semua akun demo (keluarga, dokter, klinik).
  if (env.DEMO !== "1" || !env.DEMO_DOKTER_SANDI || Buffer.byteLength(env.DEMO_DOKTER_SANDI) > 72) {
    throw new Error("Seed perlu DEMO=1 dan DEMO_DOKTER_SANDI dengan panjang paling banyak 72 byte")
  }
  const sandi_hash = await hash(env.DEMO_DOKTER_SANDI, 10)
  const sekarang = new Date()
  const hariIni = awalHari(tanggalWib(sekarang))
  const dibuat = sekarang.toISOString()
  const kodeDika = buatKodeAkses()
  const kodeNara = buatKodeAkses()
  const lahirBulan = (bulan: number) => {
    const lahir = new Date(tanggalWib(sekarang))
    lahir.setUTCDate(1)
    lahir.setUTCMonth(lahir.getUTCMonth() - bulan)
    return lahir.toISOString().slice(0, 10)
  }
  const tanggal_lahir = lahirBulan(50)

  const jumlah = await db.transaction(async (tx) => {
    const anakDemo = tx.select({ id: children.id }).from(children)
      .where(resetSemua ? undefined : eq(children.data_contoh, true))
    const sesiDemo = tx.select({ id: sessions.id }).from(sessions).where(inArray(sessions.child_id, anakDemo))
    await tx.delete(bites).where(inArray(bites.session_id, sesiDemo))
    await tx.delete(session_notes).where(inArray(session_notes.session_id, sesiDemo))
    for (const tabel of [sessions, rules, screenings, food_exposures, shared_reports, weekly_summaries, appointments,
      notifications, push_subscriptions]) {
      await tx.delete(tabel).where(inArray(tabel.child_id, anakDemo))
    }
    await tx.delete(children).where(resetSemua ? undefined : eq(children.data_contoh, true))
    if (resetSemua) {
      // Reset demo penuh: klinik/dokter buatan admin ikut dihapus supaya kembali ke kondisi awal.
      await tx.delete(appointments)
      await tx.delete(doctors).where(notInArray(doctors.id, ID_DOKTER))
      await tx.delete(clinics).where(notInArray(clinics.id, ID_KLINIK))
    }
    for (const k of [
      { id: DEMO_KLINIK, nama: "Klinik Tumbuh Kembang Contoh", kota: "Surabaya", email: KLINIK_DEMO_EMAIL },
      { id: LAIN_KLINIK, nama: "Klinik Lain", kota: "Sidoarjo", email: "klinik-lain@demo.test" },
    ]) {
      await tx.insert(clinics).values({ ...k, sandi_hash })
        .onConflictDoUpdate({ target: clinics.id, set: { nama: k.nama, kota: k.kota, email: k.email, sandi_hash } })
    }
    for (const d of [
      { id: DOKTER_DEMO, clinic_id: DEMO_KLINIK, nama: "dr. Demo", spesialis: "Dokter spesialis anak", email: DOKTER_DEMO_EMAIL },
      { id: DOKTER_SARI, clinic_id: DEMO_KLINIK, nama: "dr. Sari Wulandari", spesialis: "Nutrisi dan penyakit metabolik anak", email: "sari@demo.test" },
      { id: TERAPIS_NADIA, clinic_id: DEMO_KLINIK, nama: "Nadia Putri", spesialis: "Terapis okupasi (makan)", email: "nadia@demo.test" },
      { id: DOKTER_LAIN, clinic_id: LAIN_KLINIK, nama: "dr. Lain", spesialis: "Dokter umum", email: "lain@demo.test" },
    ]) {
      await tx.insert(doctors).values({ ...d, sandi_hash, aktif: true })
        .onConflictDoUpdate({ target: doctors.id, set: { ...d, sandi_hash, aktif: true } })
    }
    const dasar = { tanggal_lahir, sapaan: "mbak", nama_pengasuh: "Mbak Rina", stage: 1,
      data_contoh: true, dibuat, trial_until: new Date(+sekarang + 3 * MS_HARI).toISOString() } as const
    const [dika, nara, pasien] = await tx.insert(children).values([
      { ...dasar, id: DIKA, panggilan: "Dika", plan: "trial", kode_akses_hash: hashKode(kodeDika),
        email: KELUARGA_DEMO_EMAIL, sandi_hash },
      { ...dasar, panggilan: "Nara", plan: "trial", kode_akses_hash: hashKode(kodeNara), email: "nara@demo.test", sandi_hash },
      { ...dasar, panggilan: "Raka", plan: "klinik", clinic_id: LAIN_KLINIK, doctor_id: DOKTER_LAIN,
        kode_akses_hash: hashKode(buatKodeAkses()) },
    ]).returning({ id: children.id })
    const contoh = [dika!, nara!, pasien!]
    await tx.insert(screenings).values(contoh.map(({ id }) => ({
      child_id: id, jawaban_json: Array<boolean>(7).fill(false), ada_tanda_bahaya: false, tanggal: dibuat,
    })))
    await tx.insert(rules).values(contoh.map(({ id }) => ({
      child_id: id, source: "default" as const, stage: 1, rules_json: ATURAN_DEFAULT, confirmed_at: dibuat,
    })))
    for (let hari = 13; hari >= 0; hari--) {
      const jamSesi = hari === 0 ? [7, 12, 18].filter((jam) => +hariIni + jam * 3600000 + 1200000 <= +sekarang)
        : hari % 2 === 0 ? [7, 18] : [12]
      for (const jam of jamSesi) {
        const waktu = +hariIni - hari * MS_HARI + jam * 3600000
        const diterima = 3 + hari % 7
        const ditolak = jam === 18 ? 3 + hari % 3 : hari % 2
        const ngemut = hari % 5 === 0 ? 1 : 0
        const menu = ["brokoli", "nasi", "umum"][hari % 3]!
        const session_id = crypto.randomUUID()
        await tx.insert(sessions).values({ id: session_id, child_id: DIKA, stage: 1, menu,
          makanan_baru: menu === "brokoli" && jam !== 18 && hari !== 0, mulai: new Date(waktu).toISOString(),
          selesai: new Date(waktu + 1200000).toISOString(), durasi_detik: 1200,
          alasan_selesai: "waktu_habis", diterima, ditolak, ngemut })
        const hasil = [...Array<"diterima">(diterima).fill("diterima"), ...Array<"ditolak">(ditolak).fill("ditolak"),
          ...Array<"ngemut">(ngemut).fill("ngemut")]
        await tx.insert(bites).values(hasil.map((jenis, i) => ({ session_id, detik: 20 + i * 30,
          hasil: jenis, dikoreksi: jenis === "ngemut" })))
        await tx.insert(session_notes).values({ session_id, porsi: "setengah", mood: jam === 18 ? "rewel" : "biasa" })
      }
    }
    await tx.insert(food_exposures).values({ child_id: DIKA, makanan: "brokoli", jumlah: 4, terakhir: dibuat })
    await tx.insert(weekly_summaries).values({
      child_id: DIKA, minggu: mingguIni(new Date(+sekarang - 7 * MS_HARI)), sumber: "ai", model: "contoh-demo",
      keluarga: "Dika mengikuti sesi pada jam makan yang berbeda. Penolakan lebih sering terlihat pada sesi malam.",
      dokter: "Contoh data demo menunjukkan penolakan lebih sering pada sesi malam.", dibuat,
    })
    await isiPasienKlinik(tx, { sekarang, hariIni, lahirBulan })
    for (const { teks, hasil } of contohResep) {
      await simpanCache(tx, kunciResep(teks), "resep", hasil)
    }
    const hasil: Record<string, number> = {}
    for (const [nama, tabel] of Object.entries({ children, sessions, bites, rules, screenings, shared_reports, appointments })) {
      const hitung = await tx.select({ n: sql<number>`count(*)`.mapWith(Number) }).from(tabel).get()
      hasil[nama] = hitung?.n ?? 0
    }
    return hasil
  })
  return { jumlah, kodeDika, kodeNara }
}

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0]

async function isiPasienKlinik(tx: Tx, { sekarang, hariIni, lahirBulan }: {
  sekarang: Date; hariIni: Date; lahirBulan: (bulan: number) => string
}) {
  const dibuat = sekarang.toISOString()
  const kumpulan = { anak: [] as (typeof children.$inferInsert)[], sesi: [] as (typeof sessions.$inferInsert)[],
    gigitan: [] as (typeof bites.$inferInsert)[], catatan: [] as (typeof session_notes.$inferInsert)[],
    aturan: [] as (typeof rules.$inferInsert)[], skrining: [] as (typeof screenings.$inferInsert)[],
    paparan: [] as (typeof food_exposures.$inferInsert)[], ringkasan: [] as (typeof weekly_summaries.$inferInsert)[],
    jadwal: [] as (typeof appointments.$inferInsert)[] }
  const pada = (hari: number, jam: number) => new Date(+hariIni + hari * MS_HARI + jam * JAM).toISOString()

  PASIEN.forEach((p, n) => {
    const child_id = crypto.randomUUID()
    const awal = new Date(+sekarang - (p.pola === "baru" ? 4 : 30) * MS_HARI).toISOString()
    kumpulan.anak.push({ id: child_id, clinic_id: DEMO_KLINIK, doctor_id: p.dokter, panggilan: p.panggilan,
      tanggal_lahir: lahirBulan(p.bulan), kode_akses_hash: hashKode(buatKodeAkses()), sapaan: p.sapaan,
      nama_pengasuh: p.pengasuh, plan: "klinik", stage: p.stage, data_contoh: true, dibuat: awal })
    kumpulan.skrining.push({ child_id, jawaban_json: Array<boolean>(7).fill(false), ada_tanda_bahaya: false, tanggal: awal })
    const aturan = { ...ATURAN_DEFAULT, stage: p.stage }
    kumpulan.aturan.push({ child_id, source: "default", stage: 1, rules_json: { ...ATURAN_DEFAULT }, confirmed_at: awal })
    if (p.resep && p.dokter) {
      kumpulan.aturan.push({ child_id, source: "dokter", source_text: p.resep.teks, stage: p.stage, doctor_id: p.dokter,
        rules_json: { ...aturan, ...p.resep.aturan, stage: p.stage } as Aturan, confirmed_at: pada(-9, 10) })
    } else if (p.stage > 1 && p.dokter) {
      kumpulan.aturan.push({ child_id, source: "dokter", source_text: `Tahap dinaikkan ke ${p.stage} oleh dokter.`,
        stage: p.stage, doctor_id: p.dokter, rules_json: aturan, confirmed_at: pada(-14, 10) })
    }

    const hariMulai = p.pola === "baru" ? 3 : 13
    for (let hari = hariMulai; hari >= 0; hari--) {
      const jamSesi = (hari + n) % 2 === 0 ? [7, 18] : [12]
      jamSesi.forEach((jam, k) => {
        const mulai = +hariIni - hari * MS_HARI + jam * JAM + (n % 4) * 600000
        if (mulai + 1200000 > +sekarang) return
        const { diterima, ditolak } = hasilPola(p.pola, hari, k + n, p.stage)
        const ngemut = (hari + n) % 6 === 0 ? 1 : 0
        const menu = p.menu[(hari + k) % p.menu.length]!
        const durasi = Math.min(1500, 420 + (diterima + ditolak) * 75)
        const id = crypto.randomUUID()
        const tolakLama = diterima === 0 && ditolak >= 5
        kumpulan.sesi.push({ id, child_id, stage: p.stage, menu, makanan_baru: hari % 5 === 0,
          mulai: new Date(mulai).toISOString(), selesai: new Date(mulai + durasi * 1000).toISOString(),
          durasi_detik: durasi, alasan_selesai: tolakLama ? "terlalu_lama_menolak" : hari % 7 === 3 ? "stop" : "waktu_habis",
          diterima, ditolak, ngemut })
        const urutan = [...Array<"diterima">(diterima).fill("diterima"), ...Array<"ditolak">(ditolak).fill("ditolak"),
          ...Array<"ngemut">(ngemut).fill("ngemut")]
        kumpulan.gigitan.push(...urutan.map((hasil, i) => ({ session_id: id, detik: 15 + i * 45, hasil,
          dikoreksi: hasil === "ngemut" })))
        kumpulan.catatan.push({ session_id: id, porsi: diterima >= 7 ? "habis" : diterima >= 3 ? "setengah" : "sedikit",
          mood: diterima === 0 ? "rewel" : diterima >= 6 ? "senang" : "biasa" })
      })
    }
    p.menu.slice(0, 2).forEach((makanan, i) => kumpulan.paparan.push({ child_id, makanan,
      jumlah: Math.min(10, (p.pola === "baru" ? 1 : 3 + p.stage * 2) - i * 2), terakhir: dibuat }))
    if (p.pola !== "baru" && p.dokter) {
      kumpulan.ringkasan.push({ child_id, minggu: mingguIni(sekarang), sumber: "ai", model: "contoh-demo", dibuat,
        keluarga: `${p.panggilan} mengikuti sesi makan secara rutin minggu ini.`, dokter: RINGKASAN[p.pola] })
    }
    if (p.dokter) {
      const jamKlinik = 8 + (n * 3) % 7
      kumpulan.jadwal.push(
        { child_id, doctor_id: p.dokter, waktu: pada(p.pola === "baru" ? -4 : -30, jamKlinik), jenis: "konsultasi_awal",
          status: "selesai", catatan: "Skrining tanda bahaya negatif, mulai program tahap 1." },
        { child_id, doctor_id: p.dokter, waktu: pada(1 + (n * 2) % 12, jamKlinik + 0.5),
          jenis: p.pola === "naik" ? "evaluasi_tahap" : "kontrol", status: "terjadwal",
          catatan: p.pola === "sulit" ? "Bahas penolakan beruntun, pertimbangkan turun tahap." :
            p.pola === "naik" ? "Lima sesi terakhir memenuhi syarat naik tahap." : null },
      )
      if (p.pola !== "baru") kumpulan.jadwal.push({ child_id, doctor_id: p.dokter, waktu: pada(-9 - n % 3, jamKlinik),
        jenis: "kontrol", status: n % 5 === 2 ? "batal" : "selesai", catatan: n % 5 === 2 ? "Keluarga berhalangan." : null })
    }
  })
  if (PASIEN.length) await tx.insert(children).values(kumpulan.anak)
  await tx.insert(screenings).values(kumpulan.skrining)
  await tx.insert(rules).values(kumpulan.aturan)
  await sisipkan(kumpulan.sesi, 200, (b) => tx.insert(sessions).values(b))
  await sisipkan(kumpulan.gigitan, 500, (b) => tx.insert(bites).values(b))
  await sisipkan(kumpulan.catatan, 500, (b) => tx.insert(session_notes).values(b))
  await tx.insert(food_exposures).values(kumpulan.paparan)
  await tx.insert(weekly_summaries).values(kumpulan.ringkasan)
  await tx.insert(appointments).values(kumpulan.jadwal)
  // Raka (Klinik Lain) punya satu jadwal supaya pemisahan data antarklinik ikut teruji.
  const raka = await tx.select({ id: children.id }).from(children).where(eq(children.panggilan, "Raka")).get()
  if (raka) await tx.insert(appointments).values({ child_id: raka.id, doctor_id: DOKTER_LAIN, waktu: pada(2, 9),
    jenis: "kontrol", status: "terjadwal", catatan: null })
}

export async function seedDariTerminal(reset = false) {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const env = bacaEnv()
  const db = buatDb(env)
  try {
    const hasil = await jalankanSeed(db, env, reset)
    console.log("Baris:", hasil.jumlah)
    console.log("Akun demo:", [KELUARGA_DEMO_EMAIL, DOKTER_DEMO_EMAIL, KLINIK_DEMO_EMAIL].join(", "),
      "(sandi = DEMO_DOKTER_SANDI di .env.local)")
  } finally {
    db.$client.close()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void seedDariTerminal(process.argv.includes("--reset")).catch(() => { console.error("Seed gagal"); process.exitCode = 1 })
}
