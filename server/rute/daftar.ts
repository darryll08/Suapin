import type { Context, Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { bodyLimit } from "hono/body-limit"
import { API, type Keluaran, type NamaEndpoint } from "../../bersama/kontrak/api"
import type { z } from "zod"
import { denganAkses, type SesiEnv } from "../akses"
import type { Db } from "../db/klien"
import type { Env } from "../env"

export function daftarRute(app: Hono<SesiEnv>, db: Db, env: Env) {
  return function daftar<N extends NamaEndpoint>(
    nama: N, handler: (
      c: Context<SesiEnv>, data: z.output<(typeof API)[N]["req"]>,
    ) => Keluaran<N> extends undefined ? void | Promise<void> : Keluaran<N> | Promise<Keluaran<N>>,
  ) {
    const endpoint = API[nama]
    app.on(endpoint.metode, endpoint.path.slice(4), denganAkses(endpoint.akses, db, env),
      bodyLimit({ maxSize: 256 * 1024, onError: () => {
        throw new HTTPException(413, { message: "Kiriman terlalu besar" })
      } }), async (c) => {
        const teks = endpoint.metode === "POST" ? await c.req.text() : ""
        let mentah: unknown
        try { mentah = teks ? JSON.parse(teks) as unknown : undefined }
        catch { throw new HTTPException(400, { message: "JSON tidak valid" }) }
        const input = endpoint.req.safeParse(mentah)
        if (!input.success) throw new HTTPException(400, { message: "Periksa kembali isian" })
        const hasil = endpoint.res.parse(await handler(c, input.data as z.output<(typeof API)[N]["req"]>))
        c.header("Cache-Control", "no-store")
        return hasil === undefined ? c.body(null, 204) : c.json(hasil)
      })
  }
}
export type Daftar = ReturnType<typeof daftarRute>
export function gagal(status: 400 | 401 | 403 | 404 | 409, message: string): never {
  throw new HTTPException(status, { message })
}
