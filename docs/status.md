# Status

Tulis bagianmu di akhir setiap titik integrasi: apa yang jadi, apa yang belum, keputusan. Sesi Claude berikutnya cukup membaca file ini. Setiap orang hanya mengedit bagiannya.

## Perbedaan dari prompt jobdesk (dicatat A, 10 Nov)

- **Lint memakai oxlint, bukan ESLint.** Template Vite terbaru sudah memakai oxlint dan TypeScript 7; `typescript-eslint` belum tentu mendukung TS 7. Akibatnya tidak ada `eslint.config.js`; aturan lint ada di `.oxlintrc.json`. `npm run lint` = `oxlint`.
- **`npm run periksa`** = `tsc -b && oxlint && vitest run && vite build`.
- **`@types/bcryptjs` tidak dipasang**, karena `bcryptjs` 3 sudah membawa tipe sendiri.
- **Tiga tsconfig:** `tsconfig.app.json` (`src/`, `bersama/`), `tsconfig.server.json` (`server/`, `api/`, `scripts/`, `uji/`, `bersama/`), `tsconfig.node.json` (`vite.config.ts`). Alias `@bersama/*` → `bersama/*` berlaku di Vite, Vitest, tsc, dan tsx.
- **Stub yang dibuat A di folder orang lain** supaya `npm run dev` dan build jalan: `src/main.tsx`, `src/app.tsx`, `src/gaya/token.css` (B); `src/halaman/klinik/rute.tsx`, `server/app.ts`, `server/dev.ts` (C). Pemiliknya bebas mengganti isinya. Proxy Vite ke `127.0.0.1:8787`; `server/dev.ts` mendengarkan di host yang sama.
- **tsconfig disiapkan untuk kode C:** `erasableSyntaxOnly` dilepas (parameter properti di kelas) dan `tsconfig.server.json` memakai lib `DOM` supaya `Response.json()` di tes bertipe `any`.
- **Dokumen acuan** ada di `docs/produk/`: Dokumen Produk 3.4, PRD, UI/UX Guidelines.
- **Usulan menunggu kesepakatan A + B:** `sisiPengasuh` didefinisikan dari arah anak menghadap layar (UI/UX Guidelines 10.7), bukan "dari sudut pandang kamera" seperti kartu B2.1.
- Versi terpasang (dikunci tanpa `^`): React 19.3.1, React Router 8.5.1, Vite 8.3.7, TypeScript 7.0.2, Tailwind 4.3.5, Vitest 5.1.0, Hono 4.13.17, Drizzle ORM 0.45.4, Zod 4.6.7, OpenAI SDK 7.55.0, MediaPipe tasks-vision 1.2.2.

## A (Darryl)

**I0 · 10 Nov 2026**

- A0.1 kerangka di-push (b4af8f2). Kode Adit (66d2bf5) di-revert oleh Adit sendiri; Adit push ulang di atas kerangka.
- A0.2: `public/mediapipe/face_landmarker.task` (float16 v1, 3.758.596 byte, sha256 `64184e22…bc9ff`) di-commit. WASM disalin `postinstall`. Diuji di browser: model + WASM termuat dari localhost dalam ±0,8 detik, tidak ada request ke luar localhost.
- A0.3: `bersama/kontrak/sinyal.ts`, `sesi.ts` (persis jobdesk 2.2–2.3; `SesiSelesaiSchema` memakai `z.strictObject` dan `z.iso.datetime()` karena gaya lama sudah usang di Zod 4). Rekaman contoh `bersama/kontrak/contoh/rekaman-sinyal.json` dibuat skrip `uji/mesin/buat-rekaman-contoh.ts` (30 detik, 20 fps: 3 suapan, 1 menoleh menjauh, 2 detik tidak terlihat). Tes `uji/mesin/kontrak.test.ts` 8 kasus, termasuk K5 (kolom `landmark` ditolak).
- `sesi.ts` butuh `IdKlip` dan `IdTeks`, jadi A mengisi awal `bersama/konten/klip.ts` dan `teks.ts` dengan daftar id dan kalimat draf dari jobdesk 2.6. **Satya: file ini milikmu**, silakan lanjutkan (variasi, sapaan lain, `makanan.ts`). Id yang ada tidak boleh dihapus.
- A0.4: `/dev/kamera` (lazy, tidak ikut bundle utama) menampilkan pratinjau, fps, jumlah wajah, `jawOpen`, yaw mentah. `src/deteksi/pelacak.ts` = versi dasar A1.1 (GPU dengan cadangan CPU, 640×480, dibatasi 20 fps, pesan galat kamera Indonesia).
- **Belum diuji dengan kamera sungguhan** (panel browser Claude memblokir kamera). Darryl: buka `/dev/kamera` di Chrome laptop final, pastikan `jawOpen` naik saat mulut dibuka dan fps ≥ 15.
- **Adit:** ganti `KirimanSesiSchema` di `api.ts` dengan `SesiSelesaiSchema` dari `bersama/kontrak/sesi.ts`.

## B (Satya)

_(belum ada)_

## C (Adit)

_(belum ada)_
