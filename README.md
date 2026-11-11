# Suapin

PWA untuk balita 3–5 tahun yang sulit makan (GTM). Karakter animasi dan anak bergiliran menggigit; kamera membaca mulut anak di browser, karakter meniru dan merayakan saat suapan diterima. Bantuan layar dikurangi bertahap sampai anak makan tanpa layar.

Tim BOOMERANG, Universitas Airlangga · LOGICODIX Hackathon 2026 · Web App, Inclusive Health & Well-being.

> Status: kerangka repo (10 Nov 2026). Bagian bertanda _(diisi)_ dilengkapi bertahap sampai submit 14 Nov.

## Ringkasan

_(diisi)_

## Cara menjalankan (lokal)

Butuh Node.js 24 (minimal 22) dan npm.

1. Pasang dependency. `postinstall` ikut menyalin WASM MediaPipe ke `public/mediapipe/wasm/`.

   ```bash
   npm ci
   ```

2. Salin `.env.example` menjadi `.env.local`:

   ```bash
   # macOS / Linux / Git Bash
   cp .env.example .env.local
   ```

   ```powershell
   # PowerShell
   Copy-Item .env.example .env.local
   ```

3. Isi minimal empat nilai ini di `.env.local`. Tanpa keempatnya server API berhenti saat start dan seed menolak jalan.

   ```dotenv
   DATABASE_URL=file:local.db
   SESI_RAHASIA=<string acak minimal 32 karakter>
   DEMO=1
   DEMO_DOKTER_SANDI=<kata sandi akun dokter demo, maksimal 72 byte>
   ```

   `OPENAI_API_KEY` boleh kosong: resep dan ringkasan AI memakai cache atau template. `OPENAI_MODEL` bawaannya `gpt-6-luna`.

4. Siapkan database lokal `local.db`, lalu jalankan aplikasi.

   ```bash
   npm run db:migrasi
   npm run db:seed
   npm run dev
   ```

- Web: http://localhost:5173 · API: http://127.0.0.1:8787 (Vite mem-proxy `/api`).
- Akun dokter demo: `dokter@demo.test` dengan sandi dari `DEMO_DOKTER_SANDI`. Kode akses keluarga Dika dicetak di terminal saat seed.
- `npm run db:seed` mengisi ulang akun dan data contoh. Untuk menghapus semua data anak latihan dan mengembalikan seed di database demo, jalankan `npx tsx scripts/reset-demo.ts` dengan `DEMO=1`. Reset mempertahankan cache LLM.
- Kamera hanya jalan di `localhost` atau HTTPS. Untuk HP Android: `adb reverse tcp:5173 tcp:5173`, lalu buka `localhost:5173` di HP. Alamat `http://192.168.x.x` tidak bisa membuka kamera.

### Pratinjau layar tanpa server

Isi `VITE_PAKAI_CONTOH=1` di `.env.local`. `panggil()` membalas dari `bersama/kontrak/contoh/`, jadi layar bisa dibangun sebelum endpoint siap. Mode ini tidak menguji database, login, atau AI.

### Pemeriksaan

- `npm run periksa`: cek tipe, lint (oxlint), tes (Vitest), dan build. Wajib hijau sebelum push.
- GitHub Actions menjalankan `npm run periksa` di setiap push ke `main` (`.github/workflows/periksa.yml`).

## Struktur folder

Setiap folder punya `README.md` berisi pemilik, titik integrasi, dan file yang direncanakan.

| Folder | Isi | Pemilik |
|---|---|---|
| `bersama/kontrak/` | Kontrak Zod: sinyal, sesi, aturan, API, data contoh | Bersama |
| `bersama/konten/` | Makanan, id klip suara, id teks pengasuh | B |
| `src/deteksi/` | Kamera, FaceLandmarker, pengolah sinyal | A |
| `src/mesin/` | State machine sesi, kunyah, ambang, tahap, `useSesiMakan` | A |
| `src/dev/` | `/dev/kamera`, `/dev/sinyal`, `/dev/sesi`, `/dev/ambang` | A |
| `src/gaya/`, `src/komponen/` | Token tampilan dan komponen bersama | B |
| `src/karakter/`, `src/suara/` | Karakter + mulut SVG, pemutar klip | B |
| `src/halaman/keluarga/` | Aplikasi keluarga | B |
| `src/halaman/klinik/`, `src/halaman/r/`, `src/komponen/klinik/` | Dashboard klinik, laporan bagikan | C |
| `src/lib/` | `panggil()`: satu-satunya `fetch` ke API | C |
| `server/`, `api/`, `drizzle/` | API Hono, database, LLM | C |
| `uji/mesin/`, `uji/server/` | Tes Vitest | A, C |
| `public/mediapipe/` | Model dan WASM MediaPipe lokal | A |
| `public/aset/`, `public/klip/`, `public/ikon/` | Gambar, suara, ikon PWA | B |
| `brand/` | Logo dan palet (dikunci) | — |
| `docs/` | Tugas, status, gerbang, hasil uji, dokumen produk | Semua |

## Arsitektur

```text
Kamera -> FaceLandmarker (browser) -> sinyal {t, mulut, rahang, yaw, nangis, terlihat}
       -> state machine sesi -> karakter + suara + teks pengasuh
       -> SesiSelesai (angka saja) -> API Hono -> SQLite (lokal) / Turso (online)
Dashboard klinik -> API Hono -> proxy LLM -> OpenAI gpt-6-luna
```

Video kamera tidak pernah keluar dari perangkat.

## Fitur AI

_(diisi)_

## Privasi dan etika

_(diisi)_

## Bahan persiapan

_(diisi: riset yang dipakai, wawancara dokter/keluarga bila ada, dokumen di `docs/produk/`)_

## Penyesuaian terhadap Challenge Brief

_(diisi: kaitan dengan tema NextGen Digital Innovation dan subtema Inclusive Health & Well-being)_

## Hasil uji akurasi

_(diisi dari `docs/gerbang.md` dan `docs/hasil-uji.md`)_

## Kontribusi anggota

### Darryl (A)
_(diisi)_

### Wayan Satya (B)

Aplikasi keluarga: landing, daftar dan kode akses, skrining tanda bahaya, beranda (tahap, stiker mingguan, pelacak makanan baru), laporan dan bagikan ke dokter, paywall uji coba, serta layar sesi makan (persiapan, pemanasan, loop giliran, catatan). Juga sistem tampilan (token warna tanpa merah, komponen dasar), karakter SVG dengan mulut parametrik, makanan dan stiker, pemutar suara, PWA, dan naskah video. Claude Code membantu menulis kode layar, karakter SVG, dan tes; keputusan desain dan pengujian di browser dicek sendiri.

**Keputusan desain.**
- **Karakter SVG flat, bukan ilustrasi berlapis.** Diputuskan di gerbang 11 Nov karena gambar berlapis belum siap. Mulut digambar dari satu angka `mulut` (0–1) dari mesin deteksi, jadi bukaannya mengikuti mulut anak tanpa gambar per frame (`src/karakter/mulut.tsx`).
- **Perayaan hanya saat suapan diterima.** Saat menolak, karakter hanya berkedip, supaya penolakan tidak menjadi hadiah. Teks untuk pengasuh kecil di strip bawah dan tidak dibacakan.
- **Tombol Suap di sisi pengasuh.** Sisi duduk dipilih dari arah anak menghadap layar. Suap (≥ 112 px) dan pratinjau kamera di sisi itu, Stop di sisi jauh supaya tidak tertekan.
- **Lepas layar bertahap.** Tahap 2 karakter hanya muncul saat giliran, tahap 3 layar hitam dengan suara saja, tahap 4 pengasuh memimpin dan aplikasi hanya mencatat.
- **PWA.** Model MediaPipe dan WASM ikut di-cache service worker, jadi aplikasi tetap terbuka walau server tidak terjangkau. API tidak di-cache.
- **Suara.** Klip MP3 dibuat dengan `npm run klip` (ElevenLabs). Bila file belum ada, kalimat diucapkan oleh `speechSynthesis` browser sebagai cadangan.

### Adit (C)

API Hono dan kontrak Zod, autentikasi keluarga dan dokter, migrasi dan data demo SQLite, penyimpanan sesi, laporan bagikan, serta dasbor klinik. Codex membantu implementasi, penulisan tes, dan verifikasi integrasi.

**Cara kerja fitur AI.** Teks aturan dokter dikirim ke model OpenAI sebagai structured output. Server memvalidasi kolom dan rentangnya, lalu dokter meninjau serta mengonfirmasi hasil sebelum aturan dipakai di sesi keluarga berikutnya. Ringkasan mingguan memakai statistik sesi. Cache resep dan template ringkasan mendukung demo tanpa kunci API. Akses ke data anak di luar akun keluarga atau klinik yang berwenang menghasilkan HTTP 404.

## AI Use Declaration

Agen coding (Claude Code, Codex) dipakai sebagai alat bantu menulis kode. Produk memakai OpenAI gpt-6-luna, MediaPipe, dan ElevenLabs. _(rinci diisi)_

## Third-Party Declaration

| Komponen | Sumber | Lisensi |
|---|---|---|
| Model `public/mediapipe/face_landmarker.task` (float16, versi 1) | https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task | Apache 2.0 |
| Runtime `@mediapipe/tasks-vision` 1.2.2 (WASM disalin ke `public/mediapipe/wasm/` saat `npm ci`) | npm | Apache 2.0 |

| Karakter, makanan, stiker (`src/karakter/`, `public/aset/`) dan ikon PWA | Dibuat tim (SVG), lihat `docs/aset.md` | Milik tim |
| Klip suara karakter `public/klip/` | Voice by ElevenLabs (draf, lihat `docs/klip.md`) | Sesuai ketentuan ElevenLabs |

_(diisi: dependency lain)_

## Batasan

- Deteksi diuji pada orang dewasa, belum diuji pada balita.
- Klip suara berstatus draf, belum ditinjau dokter anak atau ahli gizi.
- Daftar skrining adalah draf.
