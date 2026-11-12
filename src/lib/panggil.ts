import { useEffect, useReducer, useState } from "react"
import { API, type Input, type Keluaran, type NamaEndpoint } from "../../bersama/kontrak/api"
import { beritahu } from "../komponen/notifikasi"

type Opsi<N extends NamaEndpoint> = {
  params?: Record<string, string>
  query?: Record<string, string>
  body?: Input<N>
  signal?: AbortSignal
}
type Get = { [N in NamaEndpoint]: (typeof API)[N]["metode"] extends "GET" ? N : never }[NamaEndpoint]
const contoh = import.meta.glob("../../bersama/kontrak/contoh/*.json", { import: "default" })

export class GalatApi extends Error {
  readonly status: number
  readonly pesan: string

  constructor(status: number, pesan: string) {
    super(pesan)
    this.status = status
    this.pesan = pesan
    this.name = "GalatApi"
  }
}

export async function panggil<N extends NamaEndpoint>(nama: N, opsi: Opsi<N> = {}): Promise<Keluaran<N>> {
  const endpoint = API[nama]
  const data = endpoint.req.parse(opsi.body)
  const path = endpoint.path.replace(/:([A-Za-z]+)\b/g, (_, kunci: string) => {
    const nilai = opsi.params?.[kunci]
    if (!nilai) throw new Error("Parameter API diperlukan: " + kunci)
    return encodeURIComponent(nilai)
  })
  if (import.meta.env.VITE_PAKAI_CONTOH === "1") {
    const muat = contoh["../../bersama/kontrak/contoh/" + nama + ".json"]
    await new Promise((resolve) => setTimeout(resolve, 300))
    opsi.signal?.throwIfAborted()
    if (muat) return endpoint.res.parse(await muat()) as Keluaran<N>
    const { CONTOH_API_KELUARGA } = await import("../../bersama/kontrak/contoh/keluarga")
    const keluarga: Partial<Record<NamaEndpoint, unknown>> = CONTOH_API_KELUARGA
    return endpoint.res.parse(keluarga[nama]) as Keluaran<N>
  }
  const query = opsi.query ? "?" + new URLSearchParams(opsi.query) : ""
  let response: Response
  try {
    response = await fetch(path + query, {
      method: endpoint.metode, credentials: "include", signal: opsi.signal,
      headers: data === undefined ? undefined : { "content-type": "application/json" },
      body: data === undefined ? undefined : JSON.stringify(data),
    })
  } catch (galat) {
    // Jaringan putus / server mati: beri tahu sekali lewat toast, lalu tetap lempar supaya halaman menampilkan galatnya.
    if (!opsi.signal?.aborted) beritahu({ nada: "galat", judul: "Tidak tersambung ke server", pesan: "Periksa internet, lalu coba lagi." })
    throw galat
  }
  const hasil: unknown = response.status === 204 ? undefined : await response.json().catch(() => undefined)
  if (!response.ok) {
    const pesan = hasil && typeof hasil === "object" && "galat" in hasil && typeof hasil.galat === "string"
      ? hasil.galat : "Layanan belum bisa diakses. Coba lagi."
    if (response.status >= 500) beritahu({ nada: "galat", judul: "Proses belum berhasil", pesan })
    throw new GalatApi(response.status, pesan)
  }
  return endpoint.res.parse(hasil) as Keluaran<N>
}

export function usePanggil<N extends Get>(nama: N, opsi: Pick<Opsi<N>, "params" | "query"> = {}) {
  const [versi, ulang] = useReducer((nilai: number) => nilai + 1, 0)
  const kunci = JSON.stringify({ nama, params: opsi.params, query: opsi.query, versi })
  const [hasil, simpan] = useState<{ kunci: string; data?: Keluaran<N>; galat?: Error }>()
  useEffect(() => {
    const controller = new AbortController()
    const input = JSON.parse(kunci) as { nama: N; params?: Record<string, string>; query?: Record<string, string> }
    void panggil(input.nama, { params: input.params, query: input.query, signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) simpan({ kunci, data }) })
      .catch((galat: unknown) => {
        if (!controller.signal.aborted) simpan({ kunci, galat: galat instanceof Error ? galat : new Error("Gagal memuat") })
      })
    return () => controller.abort()
  }, [kunci])
  const aktif = hasil?.kunci === kunci ? hasil : undefined
  return { data: aktif?.data, galat: aktif?.galat, memuat: !aktif, ulang }
}
