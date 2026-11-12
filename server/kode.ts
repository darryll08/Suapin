import { createHash, randomBytes, randomInt } from "node:crypto"

const alfabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export const buatKodeAkses = () =>
  Array.from({ length: 12 }, () => alfabet[randomInt(alfabet.length)]).join("")

export const hashKode = (kode: string) => createHash("sha256").update(kode).digest("hex")
export const buatToken = () => randomBytes(32).toString("base64url")

// Hash bcrypt tiruan untuk menyamakan biaya waktu ketika email tidak dikenal.
export const hashPalsu = "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi."
