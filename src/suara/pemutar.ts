// Pemilik: B (Satya). Pemutar klip suara karakter (B1.5). `fetch` di sini hanya untuk file klip lokal (/klip/*.mp3).
// Bila file MP3 belum ada (klip ElevenLabs belum dibuat), kalimat diucapkan lewat speechSynthesis id-ID sebagai cadangan.
import { KLIP, type IdKlip, type Sapaan } from "../../bersama/konten/klip.ts";

let ctx: AudioContext | null = null;
const buffer = new Map<string, AudioBuffer | HTMLAudioElement | "tidak_ada">();
const antrean: string[] = [];
let sedangPutar = false;
const MAKS_ANTREAN = 2;

/** Harus dipanggil dari handler ketukan (mis. tombol "Mulai makan") supaya browser mengizinkan audio (K8). */
export function bukaAudio(): void {
  try {
    if (!ctx) ctx = new AudioContext();
    void ctx.resume();
    const hening = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.05), ctx.sampleRate);
    const s = ctx.createBufferSource();
    s.buffer = hening;
    s.connect(ctx.destination);
    s.start();
  } catch { /* browser tanpa Web Audio: cadangan <audio> / speechSynthesis */ }
  // Buka juga speechSynthesis di gestur yang sama (iOS/Chrome HP).
  if ("speechSynthesis" in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
}

export function namaFile(id: IdKlip, variasi: number): string {
  return variasi === 0 ? `/klip/${id}.mp3` : `/klip/${id}__${variasi + 1}.mp3`;
}

async function muatSatu(url: string): Promise<void> {
  if (buffer.has(url)) return;
  try {
    const r = await fetch(url);
    if (!r.ok || !(r.headers.get("content-type") ?? "").includes("audio")) { buffer.set(url, "tidak_ada"); return; }
    const data = await r.arrayBuffer();
    try {
      if (!ctx) throw new Error("tanpa AudioContext");
      buffer.set(url, await ctx.decodeAudioData(data));
    } catch {
      buffer.set(url, new Audio(url));
    }
  } catch {
    buffer.set(url, "tidak_ada");
  }
}

/** Muat semua klip (dan variasinya) di awal sesi. */
export async function muatSemua(ids: IdKlip[] = Object.keys(KLIP) as IdKlip[]): Promise<void> {
  const url = ids.flatMap((id) => [0, ...KLIP[id].variasi.map((_, i) => i + 1)].map((v) => namaFile(id, v)));
  await Promise.all(url.map(muatSatu));
}

function pilihVariasi(id: IdKlip): { url: string; kalimat: string } {
  const k = KLIP[id];
  const semua = [k.kalimat, ...k.variasi];
  const i = Math.floor(Math.random() * semua.length);
  return { url: namaFile(id, i), kalimat: semua[i] };
}

function ucapkan(kalimat: string, selesai: () => void) {
  if (!("speechSynthesis" in window) || !kalimat) { selesai(); return; }
  const u = new SpeechSynthesisUtterance(kalimat);
  u.lang = "id-ID";
  u.rate = 1.05;
  u.pitch = 1.3;
  const suara = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("id"));
  if (suara) u.voice = suara;
  u.onend = selesai;
  u.onerror = selesai;
  window.speechSynthesis.speak(u);
}

function lanjut() {
  const url = antrean.shift();
  if (!url) { sedangPutar = false; return; }
  sedangPutar = true;
  const [alamat, kalimat] = url.split("|");
  const b = buffer.get(alamat);
  if (b instanceof AudioBuffer && ctx) {
    const s = ctx.createBufferSource();
    s.buffer = b;
    s.connect(ctx.destination);
    s.onended = lanjut;
    s.start();
  } else if (b instanceof HTMLAudioElement) {
    b.currentTime = 0;
    b.onended = lanjut;
    b.play().catch(lanjut);
  } else {
    ucapkan(kalimat, lanjut);
  }
}

/** Satu klip berjalan; antrean maksimal 2 (yang terlama dibuang). `sapaan` disiapkan untuk klip per sapaan (MVP: mbak). */
export function putarKlip(id: IdKlip, _sapaan: Sapaan = "mbak"): void {
  const { url, kalimat } = pilihVariasi(id);
  antrean.push(`${url}|${kalimat}`);
  while (antrean.length > MAKS_ANTREAN) antrean.shift();
  if (!sedangPutar) lanjut();
}

export function hentikanSemua(): void {
  antrean.length = 0;
  sedangPutar = false;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
