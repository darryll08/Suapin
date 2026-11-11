# Daftar tugas

Centang hanya bila ada buktinya. Format: `- [x] A0.1 Kerangka proyek · 10 Nov · <hash> · catatan`. Setiap orang hanya mengedit bagiannya.

## A (Darryl): mesin deteksi, engine, repo

- [x] A0.1 Kerangka proyek · 10 Nov · b4af8f2 · CI GitHub tidak jalan (akun terkunci billing), periksa lokal hijau
- [x] A0.2 MediaPipe lokal · 10 Nov · 428a262 · model + WASM termuat dari localhost di browser; kamera asli belum dicoba
- [x] A0.3 Kontrak sinyal dan sesi · 10 Nov · 428a262 · menunggu review B dan C
- [x] A0.4 Rute dev dan README kerangka · 10 Nov · 428a262 · /dev/kamera belum dites dengan kamera sungguhan
- [x] A1.1 Pelacak wajah · 11 Nov · 0c7e44c · tes lolos; belum dicoba dengan kamera sungguhan
- [x] A1.2 Pemilihan wajah anak · 11 Nov · 0c7e44c · tes lolos; belum dicoba dengan kamera sungguhan
- [x] A1.3 Pengolah sinyal · 11 Nov · 0c7e44c · tes lolos; belum dicoba dengan kamera sungguhan
- [x] A1.4 Sumber sinyal palsu · 11 Nov · 0c7e44c · tes lolos; belum dicoba dengan kamera sungguhan
- [ ] A1.5 Gerbang go/no-go (≤ 11 Nov 12.00)
- [x] A2.1 Penghitung kunyahan · 11 Nov · 0c7e44c · tes lolos; belum dicoba dengan kamera sungguhan
- [x] A2.2 State machine sesi · 11 Nov · 89df866 · tes lolos, /dev/sesi teruji dengan slider dan tanpa kamera; kamera asli belum
- [x] A2.3 Hook `useSesiMakan` · 11 Nov · 89df866 · tes lolos, /dev/sesi teruji dengan slider dan tanpa kamera; kamera asli belum
- [x] A2.4 Saklar tahap · 11 Nov · 89df866 · tes lolos, /dev/sesi teruji dengan slider dan tanpa kamera; kamera asli belum
- [ ] A3.1 Panel ambang
- [ ] A3.2 Tuning dan uji akurasi
- [ ] A4.1 Vercel + Turso (bonus)
- [ ] A5.1 Penutupan dan submit

## B (Satya): aplikasi keluarga, karakter, suara, video

- [x] B0.1 Siapkan laptop · 11 Nov · 5e6fe6d · `npm ci` + `npm run periksa` hijau; `.env.local` dan db:seed menunggu C0.2
- [x] B0.2 Router dan kerangka · 11 Nov · a9bf415 · semua rute 2.7 terbuka; rutKlinik/rutDev ikut terdaftar
- [x] B0.3 Sistem tampilan · 11 Nov · 5e6fe6d · komponen di `/contoh-gaya`; tanpa `red-`; belum dicek visual 390/1280 px
- [x] B0.4 Konten bersama dan contoh data · 11 Nov · a9bf415 · contoh di `bersama/kontrak/contoh/keluarga.ts`; belum dicek ke skema C (api.ts belum ada)
- [x] B1.1 Gambar karakter dan keputusan aset · 11 Nov · a9bf415 · keputusan SVG flat (docs/aset.md)
- [x] B1.2 Makanan dan stiker · 11 Nov · a9bf415 · brokoli + umum ×3 tahap, 3 stiker; tes path lolos
- [x] B1.3 Komponen karakter dan mulut SVG · 11 Nov · a9bf415 · meniru rekaman:contoh di /sesi; kamera asli belum
- [ ] B1.4 Klip suara
- [x] B1.5 Pemutar suara · 11 Nov · a9bf415 · antrean + cadangan speechSynthesis; belum dicoba di Chrome HP
- [x] B2.1 `/sesi` persiapan · 11 Nov · a9bf415 · 3 langkah + tahap 4 + sesi terkunci
- [x] B2.2 `/sesi` layar makan · 11 Nov · a9bf415 · teruji dengan rekaman:contoh; webcam + SQLite C belum
- [x] B2.3 Pemanasan · 11 Nov · a9bf415 · ±38 dtk, bisa dilewati
- [x] B2.4 `/sesi/catatan` · 11 Nov · a9bf415 · tersimpan di data tiruan; endpoint C belum
- [x] B3.1 Landing · 11 Nov · a9bf415 · offline PWA belum diuji
- [x] B3.2 `/mulai` dan `/masuk` · 11 Nov · a9bf415 · data tiruan; belum dicoba di browser lain
- [x] B3.3 `/mulai/skrining` · 11 Nov · a9bf415 · dua jalur di data tiruan; belum dicoba di browser
- [x] B3.4 `/beranda` · 11 Nov · a9bf415 · data contoh Dika tampil
- [x] B3.5 `/laporan` · 11 Nov · a9bf415 · link bagikan menunggu /r/:token (C)
- [x] B3.6 `/langganan` · 11 Nov · a9bf415 · data tiruan
- [ ] B4.1 Manifest dan service worker
- [x] B5.1 Naskah video · 11 Nov · a9bf415 · docs/video.md, menunggu tinjauan A dan C
- [ ] B5.2 Rekam dan edit
- [ ] B6.1 Kontribusi Satya di README

## C (Adit): server, database, AI, dashboard klinik

- [ ] C0.1 Siapkan laptop dan kerangka Hono
- [ ] C0.2 Database
- [ ] C0.3 Kontrak API, aturan, dan `panggil()`
- [ ] C0.4 Tes penjaga
- [ ] C0.5 Sesi login dan akses
- [ ] C1.1 Anak, masuk, saya
- [ ] C1.2 Skrining dan aturan
- [ ] C1.3 Simpan sesi, naik tahap, paparan
- [ ] C1.4 Catatan, laporan, bagikan, paket
- [ ] C2.1 Login dokter, daftar pasien, detail
- [ ] C2.2 Laporan bagikan dan klaim
- [ ] C2.3 Resep bahasa bebas → JSON
- [ ] C2.4 Konfirmasi aturan
- [ ] C3.1 `/klinik/masuk` dan tata letak
- [ ] C3.2 `/klinik/pasien`
- [ ] C3.3 `/klinik/pasien/:id`
- [ ] C3.4 `/r/:token`
- [ ] C4.1 Ringkasan mingguan
- [ ] C4.2 Mode demo dan reset
- [ ] C4.3 Uji Vercel + Turso (bonus)
- [ ] C5.1 Kontribusi Adit di README
