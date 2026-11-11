import { z } from "zod"

export const AturanSchema = z.object({
  max_minutes: z.number().int().min(10).max(30),
  stage: z.number().int().min(1).max(4),
  advance_rule: z.object({
    sessions: z.number().int().min(1).max(7),
    min_accepted_bites: z.number().int().min(1).max(15),
  }),
  end_after_refusal_minutes: z.number().int().min(5).max(15),
  ngemut_hint: z.string().max(100),
})

export type Aturan = z.infer<typeof AturanSchema>

export const ATURAN_DEFAULT: Aturan = {
  max_minutes: 30,
  stage: 1,
  advance_rule: { sessions: 5, min_accepted_bites: 5 },
  end_after_refusal_minutes: 15,
  ngemut_hint: "Tunggu sebentar, tawarkan minum sedikit, jangan dipaksa menelan",
}
