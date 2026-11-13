// Pemilik: B (Satya). Pemutar klip suara karakter (B1.5). `fetch` di sini hanya untuk file klip lokal (/klip/*.mp3).
// Bila file MP3 belum ada (klip ElevenLabs belum dibuat), kalimat diucapkan lewat speechSynthesis id-ID sebagai cadangan.
import { KLIP, type IdKlip, type Sapaan } from "../../bersama/konten/klip.ts";

let ctx: AudioContext | null = null;
const buffer = new Map<string, AudioBuffer | HTMLAudioElement | "tidak_ada">();
const sedangDimuat = new Map<string, Promise<void>>();
const antrean: string[] = [];
let sedangPutar = false;
let giliran = 0; // naik tiap klip mulai/dihentikan; callback klip lama diabaikan
let hentikanAktif: (() => void) | null = null;
let pengawas: ReturnType<typeof setTimeout> | undefined;
let sudahDengar = false;
const MAKS_ANTREAN = 2;
const TUNGGU_MUAT_MS = 2500;

/** HP kadang menangguhkan AudioContext (layar terkunci, pindah tab, panggilan masuk). Ketukan apa pun membukanya lagi. */
function bangunkan() {
  if (ctx && ctx.state !== "running") void ctx.resume().catch(() => {});
}

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
  if (!sudahDengar) {
    sudahDengar = true;
    document.addEventListener("pointerdown", bangunkan, true);
    document.addEventListener("keydown", bangunkan, true);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") bangunkan(); });
  }
}

export function namaFile(id: IdKlip, variasi: number): string {
  return variasi === 0 ? `/klip/${id}.mp3` : `/klip/${id}__${variasi + 1}.mp3`;
}

function muatSatu(url: string): Promise<void> {
  if (buffer.has(url)) return Promise.resolve();
  let janji = sedangDimuat.get(url);
  if (!janji) {
    janji = (async () => {
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
      } finally {
        sedangDimuat.delete(url);
      }
    })();
    sedangDimuat.set(url, janji);
  }
  return janji;
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
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
  hentikanAktif = () => window.speechSynthesis.cancel();
}

/** Klip berikutnya di antrean. Pengawas waktu memastikan antrean tidak macet bila `onended` tidak pernah datang
 *  (AudioContext tertangguhkan di HP, speechSynthesis Android yang tidak memanggil onend, play() yang menggantung). */
async function lanjut() {
  clearTimeout(pengawas);
  hentikanAktif = null;
  const item = antrean.shift();
  if (!item) { sedangPutar = false; return; }
  sedangPutar = true;
  const saya = ++giliran;
  const selesai = () => { if (saya === giliran) void lanjut(); };
  const [alamat, kalimat] = item.split("|");

  // Klip belum termuat (internet lambat, mis. lewat ngrok): tunggu sebentar, jangan langsung pindah ke suara HP.
  if (!buffer.has(alamat)) await Promise.race([muatSatu(alamat), new Promise((r) => setTimeout(r, TUNGGU_MUAT_MS))]);
  if (saya !== giliran) return;
  bangunkan();

  const b = buffer.get(alamat);
  let lama = 8; // detik; batas atas untuk suara HP / <audio>
  if (b instanceof AudioBuffer && ctx && ctx.state === "running") {
    const s = ctx.createBufferSource();
    s.buffer = b;
    s.connect(ctx.destination);
    s.onended = selesai;
    s.start();
    hentikanAktif = () => { s.onended = null; try { s.stop(); } catch { /* sudah berhenti */ } };
    lama = b.duration + 1;
  } else if (b instanceof AudioBuffer || b instanceof HTMLAudioElement) {
    // AudioContext belum jalan: putar lewat <audio> biasa (diizinkan setelah ada ketukan di halaman).
    const a = b instanceof HTMLAudioElement ? b : new Audio(alamat);
    a.currentTime = 0;
    a.onended = selesai;
    a.play().catch(() => ucapkan(kalimat, selesai));
    hentikanAktif = () => { a.onended = null; a.pause(); };
    if (b instanceof AudioBuffer) lama = b.duration + 2;
  } else {
    ucapkan(kalimat, selesai);
  }
  pengawas = setTimeout(selesai, lama * 1000);
}

/** Satu klip berjalan; antrean maksimal 2 (yang terlama dibuang). `sapaan` disiapkan untuk klip per sapaan (MVP: mbak). */
export function putarKlip(id: IdKlip, _sapaan: Sapaan = "mbak"): void {
  const { url, kalimat } = pilihVariasi(id);
  antrean.push(`${url}|${kalimat}`);
  while (antrean.length > MAKS_ANTREAN) antrean.shift();
  if (!sedangPutar) void lanjut();
}

export function hentikanSemua(): void {
  antrean.length = 0;
  sedangPutar = false;
  giliran++;
  clearTimeout(pengawas);
  hentikanAktif?.();
  hentikanAktif = null;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
