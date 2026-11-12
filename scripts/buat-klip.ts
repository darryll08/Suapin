// Pemilik: B (Satya). B1.4: buat klip suara karakter dari bersama/konten/klip.ts lewat ElevenLabs.
// Pakai: `npm run klip` (hanya file yang belum ada), `npm run klip -- --paksa <id>`, atau `npm run klip -- --semua`.
// Butuh ELEVENLABS_API_KEY dan ELEVENLABS_VOICE_ID di .env.local. Kunci tidak pernah ditulis ke repo.
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { KLIP, type IdKlip } from "../bersama/konten/klip.ts";

function bacaEnv(): Record<string, string> {
  const env: Record<string, string> = { ...process.env } as Record<string, string>;
  if (existsSync(".env.local")) {
    for (const baris of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      const m = baris.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

const env = bacaEnv();
const kunci = env.ELEVENLABS_API_KEY;
const suara = env.ELEVENLABS_VOICE_ID;
if (!kunci || !suara) {
  console.error("Isi ELEVENLABS_API_KEY dan ELEVENLABS_VOICE_ID di .env.local dulu.");
  process.exit(1);
}

const iPaksa = process.argv.indexOf("--paksa");
const paksa = iPaksa >= 0 ? process.argv[iPaksa + 1] : null;
const semuaUlang = process.argv.includes("--semua");

// Stability rendah + sedikit style = intonasi lebih hidup untuk ajakan main.
// `nanti_lagi` (anak menolak) dibuat stabil dan tanpa style supaya terdengar datar (UI UX 13).
const SUARA_HIDUP = { stability: 0.35, similarity_boost: 0.75, style: 0.35, use_speaker_boost: true };
const SUARA_DATAR = { stability: 0.8, similarity_boost: 0.75, style: 0, use_speaker_boost: true };
const MODEL = env.ELEVENLABS_MODEL || "eleven_multilingual_v2";

let adaFfmpeg = true;
try { execFileSync("ffmpeg", ["-version"], { stdio: "ignore" }); } catch { adaFfmpeg = false; }

mkdirSync("public/klip", { recursive: true });

for (const id of Object.keys(KLIP) as IdKlip[]) {
  const semua = [KLIP[id].kalimat, ...KLIP[id].variasi];
  for (let i = 0; i < semua.length; i++) {
    const file = i === 0 ? `public/klip/${id}.mp3` : `public/klip/${id}__${i + 1}.mp3`;
    if (existsSync(file) && paksa !== id && !semuaUlang) continue;
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${suara}`, {
      method: "POST",
      headers: { "xi-api-key": kunci, "content-type": "application/json", accept: "audio/mpeg" },
      body: JSON.stringify({ text: semua[i], model_id: MODEL,
        voice_settings: id === "nanti_lagi" ? SUARA_DATAR : SUARA_HIDUP }),
    });
    if (!r.ok) {
      console.error(`Gagal ${id} (${r.status}): ${await r.text()}`);
      process.exitCode = 1;
      continue;
    }
    const data = Buffer.from(await r.arrayBuffer());
    if (adaFfmpeg) {
      const mentah = `${file}.mentah.mp3`;
      writeFileSync(mentah, data);
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", mentah, "-af", "loudnorm=I=-16:TP=-1.5", "-b:a", "64k", file]);
      unlinkSync(mentah);
    } else {
      writeFileSync(file, data);
    }
    console.log(`✓ ${file}`);
  }
}
if (!adaFfmpeg) console.log("ffmpeg tidak ada: volume belum disamakan (catat di docs/klip.md).");
