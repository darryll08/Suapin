import { z } from "zod"

export const AturanSchema = z.object({
  max_minutes: z.number().int().min(10).max(30),
  stage: z.number().int().min(1).max(4),
  // Naik tahap (13 Nov, disepakati Darryl): cukup paparan (minimal sesi di tahap ini) DAN stabil (`streak` sesi
  // terakhir berturut-turut masing-masing >= `percent`% suapan diterima, dari >= 5 suapan ditawarkan).
  // Default baru memakai .default() supaya aturan lama di database ({ sessions, min_accepted_bites }) tetap terbaca.
  advance_rule: z.object({
    sessions: z.number().int().min(1).max(20), // minimal sesi di tahap 2 dan 3
    first_stage_sessions: z.number().int().min(1).max(20).default(8), // tahap 1: paparan 8–10 kali
    percent: z.number().int().min(50).max(90).default(70),
    streak: z.number().int().min(1).max(7).default(3),
  }),
  end_after_refusal_minutes: z.number().int().min(5).max(15),
  ngemut_hint: z.string().max(100),
})

export type Aturan = z.infer<typeof AturanSchema>

export const ATURAN_DEFAULT: Aturan = {
  max_minutes: 30,
  stage: 1,
  advance_rule: { sessions: 5, first_stage_sessions: 8, percent: 70, streak: 3 },
  end_after_refusal_minutes: 15,
  ngemut_hint: "Tunggu sebentar, tawarkan minum sedikit, jangan dipaksa menelan",
}
