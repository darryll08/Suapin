import { and, desc, eq, gte, lt } from "drizzle-orm"
import { z } from "zod"
import { MAKANAN } from "../../bersama/konten/makanan"
import type { Keluaran } from "../../bersama/kontrak/api"
import type { Db } from "../db/klien"
import { bites, session_notes, sessions, weekly_summaries } from "../db/skema"
import { bacaAturan, bacaPaparan, bacaRingkasan, mingguIni, MS_HARI, sesiUntukTahap, tampilSesi } from "../logika/data"
import { cekNaikTahap } from "../logika/tahap"
import { gagal } from "../rute/daftar"
import { bacaCache, kunciCache, simpanCache } from "./cache"
import type { Llm } from "./klien"

const skema = z.object({ keluarga: z.string().max(400), dokter: z.string().max(500),
  pola: z.array(z.string()).min(1).max(2) })
const dilarang = /\b(diagnosis|gangguan|penyakit|harus|gagal|salah)\b/i

export function batasMinggu(minggu: string) {
  const [tahun, nomor] = minggu.split("-W").map(Number)
  const jan4 = new Date(Date.UTC(tahun, 0, 4))
  const senin = +jan4 - ((jan4.getUTCDay() || 7) - 1) * MS_HARI
  const mulai = new Date(senin + (nomor - 1) * 7 * MS_HARI - 7 * 3600000)
  if (mingguIni(mulai) !== minggu) gagal(400, "Minggu tidak valid")
  return [mulai.toISOString(), new Date(+mulai + 7 * MS_HARI).toISOString()] as const
}

export async function buatRingkasan(
  db: Db, llm: Llm | null, model: string, id: string, minggu: string, ulang: boolean,
): Promise<Keluaran<"ringkasanBuat">> {
  const [mulai, akhir] = batasMinggu(minggu)
  const tersimpan = await bacaRingkasan(db, id, minggu)
  if (!ulang && tersimpan) return {
    keluarga: tersimpan.keluarga, dokter: tersimpan.dokter,
    sumber: tersimpan.sumber === "template" ? "template" : "cache",
  }
  const filter = and(eq(sessions.child_id, id), gte(sessions.mulai, mulai), lt(sessions.mulai, akhir))
  const [riwayat, dikonfirmasi, aktif, paparan] = await Promise.all([
    db.select({ sesi: sessions, mood: session_notes.mood }).from(sessions)
      .leftJoin(session_notes, eq(session_notes.session_id, sessions.id)).where(filter).orderBy(desc(sessions.mulai)).all(),
    db.select({ id: bites.id }).from(bites).innerJoin(sessions, eq(sessions.id, bites.session_id))
      .where(and(filter, eq(bites.hasil, "ngemut"), eq(bites.dikoreksi, true))).all(),
    bacaAturan(db, id), bacaPaparan(db, id),
  ])
  const total = riwayat.reduce((acc, { sesi }) => ({
    diterima: acc.diterima + sesi.diterima, ditolak: acc.ditolak + sesi.ditolak,
    durasi: acc.durasi + sesi.durasi_detik,
  }), { diterima: 0, ditolak: 0, durasi: 0 })
  const n = riwayat.length
  const tahap = aktif.aturan.stage
  const evaluasi = cekNaikTahap(await sesiUntukTahap(db, id, tahap), aktif.aturan)
  // Hanya id dari daftar makanan bersama yang diteruskan ke LLM; teks lain jadi "umum".
  const menuUmum = (menu: string) => MAKANAN.some((m) => m.id === menu) ? menu : "umum"
  const input = JSON.stringify({ jumlah_sesi: n, diterima: total.diterima, ditolak: total.ditolak,
    rata_durasi_menit: n ? Math.max(1, Math.round(total.durasi / n / 60)) : 0, tahap,
    ngemut_dikonfirmasi: dikonfirmasi.length, siap_naik: evaluasi.siapNaik,
    paparan: paparan.map((row) => ({ ...row, makanan: menuUmum(row.makanan) })),
    sesi: riwayat.map(({ sesi, mood }) => {
      const { jam, menu, diterima, ditolak, ngemut } = tampilSesi(sesi)
      return { jam, menu: menuUmum(menu), diterima, ditolak, ngemut, mood }
    }),
  })
  const angka = new Set(input.match(/\d+/g))
  function validasi(mentah: unknown) {
    const hasil = skema.safeParse(mentah)
    if (!hasil.success) return undefined
    const { keluarga, dokter, pola } = hasil.data
    if ([keluarga, dokter, ...pola].some((teks) => dilarang.test(teks) ||
      (teks.match(/\d+/g) ?? []).some((x) => !angka.has(x)))) return undefined
    return hasil.data
  }
  const kunci = kunciCache("ringkasan", input)
  let hasil: z.infer<typeof skema> | undefined
  let sumber: Keluaran<"ringkasanBuat">["sumber"] = "template"
  if (llm && n) {
    try {
      hasil = validasi(await llm("ringkasan", skema,
        "Ringkas data sesi anak dalam bahasa Indonesia. Tunjukkan 1–2 pola yang tampak dari data dan sebutkan angkanya. " +
        "Pakai hanya angka yang tertulis persis di data: jangan menghitung, menjumlah, membuat persen, mengubah satuan, atau memakai pemisah ribuan. Sebut \"suapan\", bukan \"makanan\"; tulis \"ya/tidak\", bukan true/false. Versi keluarga hangat dan versi dokter faktual. Tulis kalimat utuh yang enak dibaca (2–3 kalimat), bukan daftar nama data; \"siap_naik\" ditulis sebagai kalimat (mis. \"belum memenuhi syarat naik tahap\"). Jangan mendiagnosis, memberi dosis atau menu, atau menyalahkan pengasuh.", input))
    } catch { /* Lanjutkan dengan cadangan lokal. */ }
    if (hasil) {
      sumber = "ai"
      await simpanCache(db, kunci, "ringkasan", hasil)
    }
  }
  if (!hasil) {
    hasil = validasi(await bacaCache(db, kunci))
    if (hasil) sumber = "cache"
  }
  const dasar = "Minggu ini ada " + n + " sesi, dengan " + total.diterima + " suapan diterima"
  const keluarga = hasil?.keluarga ?? dasar + "."
  const dokter = hasil?.dokter ?? dasar + ", " + total.ditolak + " ditolak, dan " +
    dikonfirmasi.length + " kejadian ngemut dikonfirmasi."
  const nilai = { keluarga, dokter, sumber, model: sumber === "ai" ? model : null, dibuat: new Date().toISOString() }
  await db.insert(weekly_summaries).values({ child_id: id, minggu, ...nilai })
    .onConflictDoUpdate({ target: [weekly_summaries.child_id, weekly_summaries.minggu], set: nilai })
  return { keluarga, dokter, sumber }
}
