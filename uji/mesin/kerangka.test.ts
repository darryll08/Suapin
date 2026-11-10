// Penjaga kerangka: semua nama kunci env yang dipakai tim ada di .env.example (tanpa nilai).
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const KUNCI = [
  "DATABASE_URL", "TURSO_AUTH_TOKEN", "OPENAI_API_KEY", "OPENAI_MODEL", "SESI_RAHASIA",
  "DEMO", "DEMO_DOKTER_SANDI", "ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID", "VITE_PAKAI_CONTOH",
];

it(".env.example memuat semua kunci tanpa nilai", () => {
  const baris = readFileSync(".env.example", "utf8").split(/\r?\n/).filter((b) => b && !b.startsWith("#"));
  expect(baris.map((b) => b.split("=")[0]).sort()).toEqual([...KUNCI].sort());
  for (const b of baris) expect(b.split("=")[1]).toBe("");
});
