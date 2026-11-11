import { z } from "zod"
import { AturanSchema } from "./aturan"
import { AlasanSelesai, SesiSelesaiSchema } from "./sesi"

const id = z.string().min(1)
const waktu = z.iso.datetime()
const tahap = AturanSchema.shape.stage
const sumberAturan = z.enum(["default", "dokter"])
const plan = z.enum(["trial", "expired", "program", "lanjutan", "klinik"])
const sapaan = z.enum(["mbak", "bu", "oma", "ayah"])
const nama = z.string().trim().min(1).max(80)
const kosong = z.undefined()
const bool = z.boolean()
const jumlah = z.number().int().nonnegative()
const anak = z.object({ id, panggilan: nama, usia_bulan: jumlah, stage: tahap })
const aturanAktif = z.object({ aturan: AturanSchema, source: sumberAturan, confirmed_at: waktu.nullable() })
const paparan = z.object({ makanan: id, jumlah, target: z.literal(10) })
const sesi = z.object({
  tanggal: z.string(), jam: z.string(), menu: id, diterima: jumlah, ditolak: jumlah,
  ngemut: jumlah, durasi: jumlah,
})

export const MingguSchema = z.string().regex(/^\d{4}-W(?:0[1-9]|[1-4][0-9]|5[0-3])$/)
const sumberRingkasan = z.enum(["ai", "cache", "template"])
const ringkasan = z.object({ keluarga: z.string(), dokter: z.string(), sumber: sumberRingkasan })
const dataKeluarga = anak.extend({
  sapaan, nama_pengasuh: nama, plan, trial_until: waktu.nullable(),
})

type Akses = "publik" | "keluarga" | "dokter" | "token" | "demo" | "keluarga_atau_dokter"
function endpoint<const M extends "GET" | "POST", const P extends string, R extends z.ZodType, S extends z.ZodType>(
  metode: M, path: P, akses: Akses, req: R, res: S,
  ...galat: number[]
) {
  return { metode, path, akses, req, res, galat }
}

export const API = {
  anakBuat: endpoint("POST", "/api/children", "publik",
    z.strictObject({ panggilan: nama, tanggal_lahir: z.iso.date(), sapaan, nama_pengasuh: nama }),
    z.object({ child_id: id, kode_akses: z.string().length(12) }), 400),
  keluargaMasuk: endpoint("POST", "/api/masuk", "publik",
    z.strictObject({ kode_akses: z.string().trim().min(1).max(80) }), kosong, 400, 401),
  saya: endpoint("GET", "/api/saya", "keluarga", kosong,
    z.object({ child: dataKeluarga, sesi_dibuka: bool,
      alasan_terkunci: z.enum(["skrining_belum", "tanda_bahaya", "trial_habis"]).nullable() }), 401),
  skriningSimpan: endpoint("POST", "/api/screenings", "keluarga",
    z.strictObject({ jawaban: z.array(bool).length(7) }), z.object({ ada_tanda_bahaya: bool }), 400, 401),
  aturanBaca: endpoint("GET", "/api/children/:id/rules", "keluarga", kosong, aturanAktif, 401, 404),
  sesiSimpan: endpoint("POST", "/api/sessions", "keluarga", SesiSelesaiSchema,
    z.object({ session_id: id, naik_tahap: bool, tahap_baru: tahap, saran_turun_tahap: bool,
      paparan: paparan.omit({ target: true }).nullable() }), 400, 401, 403, 404),
  catatanSimpan: endpoint("POST", "/api/sessions/:id/notes", "keluarga",
    z.strictObject({
      porsi: z.enum(["sedikit", "setengah", "habis"]).optional(),
      mood: z.enum(["senang", "biasa", "rewel"]).optional(),
    }).refine(({ porsi, mood }) => porsi !== undefined || mood !== undefined),
    kosong, 400, 401, 404),
  laporanKeluarga: endpoint("GET", "/api/children/:id/report", "keluarga", kosong,
    z.object({ tahap, stiker_minggu_ini: z.array(bool).length(7), paparan: z.array(paparan),
      sesi: z.array(sesi.extend({ id })), ringkasan_keluarga: z.string().nullable(), plan,
      trial_sisa_hari: jumlah.nullable() }), 401, 404),
  laporanBagikan: endpoint("POST", "/api/reports/share", "keluarga", kosong,
    z.object({ token: z.string().length(43), url: z.string() }), 401),
  paketAktifkan: endpoint("POST", "/api/plan/activate", "keluarga",
    z.strictObject({ paket: z.literal("program_30") }), z.object({ plan: z.literal("program") }), 400, 401, 409),
  laporanToken: endpoint("GET", "/api/r/:token", "token", kosong,
    z.object({ child: anak.pick({ panggilan: true, usia_bulan: true }), tahap, sesi: z.array(sesi),
      ringkasan_dokter: z.string().nullable(), ringkasan_sumber: sumberRingkasan.optional(),
      sudah_pasien_klinik: bool, pasien_saya: bool.optional() }), 404),
  dokterMasuk: endpoint("POST", "/api/clinic/login", "publik",
    z.strictObject({ email: z.email(), kata_sandi: z.string().min(1).max(256) }), kosong, 400, 401),
  dokterKeluar: endpoint("POST", "/api/clinic/logout", "dokter", kosong, kosong, 401),
  pasienKlaim: endpoint("POST", "/api/clinic/claim/:token", "dokter", kosong,
    z.object({ child_id: id }), 401, 404, 409),
  pasienDaftar: endpoint("GET", "/api/clinic/patients", "dokter", kosong,
    z.object({ dokter_nama: nama.optional(), pasien: z.array(anak.omit({ stage: true }).extend({
      tahap, sesi_7_hari: jumlah, diterima_7_hari: jumlah, ditolak_7_hari: jumlah,
      siap_naik_tahap: bool, saran_turun_tahap: bool, source_aturan: sumberAturan,
    })) }), 401),
  pasienDetail: endpoint("GET", "/api/clinic/patients/:id", "dokter", kosong,
    z.object({ dokter_nama: nama.optional(), child: anak, aturan_aktif: aturanAktif,
      riwayat_aturan: z.array(z.object({ source: sumberAturan, source_text: z.string().nullable(),
        rules_json: AturanSchema, confirmed_at: waktu })),
      sesi: z.array(sesi.extend({ alasan_selesai: AlasanSelesai })), ngemut_dikonfirmasi: jumlah,
      paparan: z.array(paparan), siap_naik_tahap: bool, saran_turun_tahap: bool,
      ringkasan_dokter: z.string().nullable(), ringkasan_sumber: sumberRingkasan.optional() }), 401, 404),
  aturanParse: endpoint("POST", "/api/rules/parse", "dokter",
    z.strictObject({ teks: z.string().trim().min(1).max(1000) }),
    z.object({ aturan: AturanSchema.partial().extend({ advance_rule: AturanSchema.shape.advance_rule.partial().optional() }),
      kolom_bermasalah: z.array(z.object({ kolom: z.string(), alasan: z.string() })),
      tidak_dipetakan: z.array(z.string()), sumber: z.enum(["ai", "cache", "gagal"]) }), 400, 401),
  aturanKonfirmasi: endpoint("POST", "/api/rules/confirm", "dokter",
    z.strictObject({ child_id: id, aturan: AturanSchema, source_text: z.string().max(1000) }),
    z.object({ rule_id: id }), 400, 401, 404),
  ringkasanBuat: endpoint("POST", "/api/summaries/:childId", "keluarga_atau_dokter",
    z.strictObject({ minggu: MingguSchema.optional() }).optional(), ringkasan, 400, 401, 404),
  demoMasuk: endpoint("POST", "/api/demo/masuk", "demo",
    z.strictObject({ sebagai: z.enum(["keluarga_dika", "dokter_demo"]) }), kosong, 400, 404),
  demoReset: endpoint("POST", "/api/demo/reset", "demo", kosong,
    z.object({ ok: z.literal(true), jumlah: z.record(z.string(), jumlah) }), 404),
  sehat: endpoint("GET", "/api/sehat", "publik", kosong,
    z.object({ db: bool, openai_key: bool, demo: bool })),
} as const

export type NamaEndpoint = keyof typeof API
export type Input<N extends NamaEndpoint> = z.input<(typeof API)[N]["req"]>
export type Keluaran<N extends NamaEndpoint> = z.output<(typeof API)[N]["res"]>
