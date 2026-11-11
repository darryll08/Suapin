import { API } from "../../bersama/kontrak/api"

async function ujiGet() {
  const tujuan = process.argv[2]
  if (!tujuan) throw new Error("Gunakan: npx tsx uji/server/asap.ts <URL>")
  const asal = new URL(tujuan)
  if (asal.protocol !== "http:" && asal.protocol !== "https:") {
    throw new Error("URL harus memakai HTTP atau HTTPS")
  }

  for (const endpoint of Object.values(API)) {
    if (endpoint.metode !== "GET") continue
    const path = endpoint.path.replace(/:\w+/g, "asap")
    const status = endpoint.akses === "publik" ? 200 : endpoint.akses === "token" ? 404 : 401
    const mulai = performance.now()
    const respons = await fetch(new URL(path, asal), {
      redirect: "error", signal: AbortSignal.timeout(10_000),
    })
    const durasi = Math.round(performance.now() - mulai)
    if (respons.status !== status) {
      throw new Error(path + " memberi HTTP " + respons.status + ", diharapkan " + status)
    }
    if (endpoint === API.sehat && !API.sehat.res.parse(await respons.json()).db) {
      throw new Error("Pemeriksaan database gagal")
    }
    console.log("GET", path, status, durasi + " ms")
  }
}

void ujiGet().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
