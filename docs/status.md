# Status integrasi Suapin

## Adit (C) · 10 November 2026

- API Hono, 21 endpoint Zod, database Drizzle/libSQL, migrasi, seed, dan reset demo tersedia. Akses keluarga dan dokter menggunakan cookie bertanda tangan. Payload sesi hanya memuat hasil sesi dan gigitan.
- Alur klinik tersedia melalui ekspor `rutKlinik`. Termasuk login, daftar dan detail pasien, laporan bagikan, klaim, formulir resep, konfirmasi aturan, riwayat, dan ringkasan.
- Diverifikasi secara terpisah dengan pemeriksaan TypeScript, ESLint, 13 tes Vitest, migrasi SQLite, build Vite, dan Chrome pada 1280 px dan 390 px. Uji browser memakai router klinik sementara dan data demo. Setelah dokter mengonfirmasi resep, API keluarga mengembalikan batas 20 menit dari aturan dokter.
- OpenAI diverifikasi dengan model tiruan dan cadangan cache/template. Uji dengan kunci serta model OpenAI asli, Vercel, dan Turso masih menunggu konfigurasi tim.
- Integrasi I0 dengan A dan B masih terbuka. Hubungkan `rutKlinik` di router Satya, pakai skema sesi bersama dari Darryl setelah tersedia, dan tinjau nama/skema endpoint bersama. Atur proxy Vite ke `http://127.0.0.1:8787` untuk mengikuti host server lokal. Jalankan `npm run periksa` setelah kerangka proyek tersedia.
- Mode demo membutuhkan `DEMO=1` dan `DEMO_DOKTER_SANDI` lokal. Reset mengganti seluruh data anak dengan seed dan mempertahankan cache LLM. Gunakan database terpisah untuk mode demo.
