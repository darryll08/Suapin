// Pemilik: A (Darryl). Kontrak bersama, dikunci di I0: diubah hanya bila A, B, C setuju.
// `TampilanSesi`: keluaran engine untuk layar sesi (dipakai B).
// `SesiSelesai`: hasil sesi yang dikirim ke `POST /api/sessions` (dipakai C).
import { z } from "zod";
import { IdKlip } from "../konten/klip.ts";
import { IdTeks } from "../konten/teks.ts";

export const StatusSesi = z.enum([
  "KALIBRASI",
  "PEMANASAN",
  "GILIRAN_KARAKTER",
  "MENUNGGU_SUAP",
  "MENILAI",
  "DITERIMA",
  "JEDA_KUNYAH",
  "KEMUNGKINAN_NGEMUT",
  "MENOLAK",
  "TIDAK_PASTI",
  "TIDAK_TERLIHAT",
  "SELESAI",
]);
export type StatusSesi = z.infer<typeof StatusSesi>;

export const Pose = z.enum(["netral", "menunggu", "menggigit", "enak", "merayakan", "santai", "mengunyah"]);
export type Pose = z.infer<typeof Pose>;

export const ModeLayar = z.enum(["terang", "redup", "hitam"]);
export type ModeLayar = z.infer<typeof ModeLayar>;

export const HasilGigitan = z.enum(["diterima", "ditolak", "ngemut"]);
export type HasilGigitan = z.infer<typeof HasilGigitan>;

export const GigitanSchema = z.object({
  detik: z.number().min(0), // detik sejak sesi mulai
  hasil: HasilGigitan,
  dikoreksi: z.boolean(), // true bila ditentukan/diubah tombol pengasuh
});
export type Gigitan = z.infer<typeof GigitanSchema>;

export const TampilanSesiSchema = z.object({
  status: StatusSesi,
  pose: Pose,
  mulutKarakter: z.number().min(0).max(1), // bukaan mulut SVG karakter frame ini
  layar: ModeLayar,
  makananTahap: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  teks: z.object({ id: IdTeks, tanya: z.boolean() }).nullable(),
  klip: z.object({ id: IdKlip, nonce: z.number() }).nullable(), // nonce naik = putar klip baru
  gigitan: z.array(GigitanSchema),
  detikBerjalan: z.number(),
  tahap: z.number().int().min(1).max(4),
});
export type TampilanSesi = z.infer<typeof TampilanSesiSchema>;

export const AlasanSelesai = z.enum(["waktu_habis", "terlalu_lama_menolak", "stop", "stop_darurat"]);
export type AlasanSelesai = z.infer<typeof AlasanSelesai>;

// strictObject: payload dengan kolom tambahan (misalnya landmark atau gambar) ditolak (K5).
export const SesiSelesaiSchema = z.strictObject({
  child_id: z.string(),
  menu: z.string(), // id makanan dari bersama/konten/makanan.ts, atau "umum"
  makanan_baru: z.boolean(),
  mulai: z.iso.datetime(),
  selesai: z.iso.datetime(),
  durasi_detik: z.number().int().min(0),
  tahap: z.number().int().min(1).max(4),
  alasan_selesai: AlasanSelesai,
  gigitan: z.array(z.strictObject(GigitanSchema.shape)),
});
export type SesiSelesai = z.infer<typeof SesiSelesaiSchema>;
