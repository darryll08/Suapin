import OpenAI from "openai"
import { zodTextFormat } from "openai/helpers/zod"
import type { z } from "zod"
import type { Env } from "../env"

export type Llm = <T>(nama: string, skema: z.ZodType<T>, instruksi: string, input: string) => Promise<T | null>

export function buatLlm(env: Env): Llm | null {
  if (!env.OPENAI_API_KEY) return null
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: 20000, maxRetries: 0 })
  return async (nama, skema, instruksi, input) => {
    const hasil = await client.responses.parse({
      model: env.OPENAI_MODEL,
      store: false,
      input: [{ role: "system", content: instruksi }, { role: "user", content: input }],
      text: { format: zodTextFormat(skema, nama) },
    })
    return hasil.output_parsed
  }
}
