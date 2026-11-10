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

_(belum ada)_

## B (Satya)

_(belum ada)_

## C (Adit)

_(belum ada)_
