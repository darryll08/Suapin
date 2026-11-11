import { createHash, randomBytes, randomInt } from "node:crypto"

const alfabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export const buatKodeAkses = () =>
  Array.from({ length: 12 }, () => alfabet[randomInt(alfabet.length)]).join("")

export const hashKode = (kode: string) => createHash("sha256").update(kode).digest("hex")
export const buatToken = () => randomBytes(32).toString("base64url")
