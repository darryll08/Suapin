// Pemilik: A (Darryl). Kontrak bersama, dikunci di I0: diubah hanya bila A, B, C setuju.
// Satu bentuk data per frame yang menghubungkan kamera (A) dengan karakter (B).
// Sumber kamera dan sumber palsu (slider, rekaman) sama-sama mengeluarkan bentuk ini.
import { z } from "zod";

export const SinyalSchema = z.object({
  t: z.number(), // ms, performance.now()
  mulut: z.number(), // 0..1, jawOpen dikurangi baseline, sudah dihaluskan
  rahang: z.number(), // jarak dagu-hidung / tinggi wajah, dikurangi baseline, dihaluskan
  yaw: z.number(), // derajat; positif = menoleh KE sisi pengasuh, negatif = menjauh
  nangis: z.boolean(), // dugaan dari eyeSquint + browDown, belum tervalidasi
  terlihat: z.boolean(), // wajah anak ditemukan dan titik mulut stabil
});
export type Sinyal = z.infer<typeof SinyalSchema>;

export const RekamanSinyalSchema = z.object({
  versi: z.literal(1),
  fps: z.number(),
  catatan: z.string(),
  sinyal: z.array(SinyalSchema),
});
export type RekamanSinyal = z.infer<typeof RekamanSinyalSchema>;
