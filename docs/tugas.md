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
- [x] A3.1 Panel ambang · 11 Nov · (commit ini) · batasBukaDetik 2 dari panel mengubah hasil sesi tanpa build ulang; reset demo mengembalikan data Dika (21 sesi)
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
- [x] B4.1 Manifest dan service worker · 11 Nov · a9bf415 · build+preview: SW aktif, model+WASM ter-cache, landing dan /dev/sesi?sumber=slider terbuka saat server mati; install di HP belum
- [x] B5.1 Naskah video · 11 Nov · a9bf415 · docs/video.md, menunggu tinjauan A dan C
- [ ] B5.2 Rekam dan edit
- [x] B6.1 Kontribusi Satya di README · 11 Nov · 9065635 · draf, Satya wajib membaca dan bisa menjelaskan

## C (Adit): server, database, AI, dashboard klinik

- [x] C0.1 Siapkan laptop dan kerangka Hono · 11 Nov · 66314d8 · JSON sehat via proxy Vite
- [x] C0.2 Database · 11 Nov · 66314d8 · migrasi dari nol dan seed idempoten
- [x] C0.3 Kontrak API, aturan, dan `panggil()` · 11 Nov · c54247f · contoh lolos skema, review terpisah dilewati atas arahan pemilik pekerjaan
- [x] C0.4 Tes penjaga · 11 Nov · 66314d8 · tes kontrak dan pembatasan akses
- [x] C0.5 Sesi login dan akses · 11 Nov · 7b74b30 · kode salah, respons login dokter seragam, dan cookie tidak valid
- [x] C1.1 Anak, masuk, saya · 11 Nov · 66314d8 · daftar dan pemeriksaan sesi dibuka
- [x] C1.2 Skrining dan aturan · 11 Nov · 66314d8 · skrining dan aturan default
- [x] C1.3 Simpan sesi, naik tahap, paparan · 11 Nov · 66314d8 · penyimpanan SQLite, kenaikan tahap, dan uji browser tanpa kamera
- [x] C1.4 Catatan, laporan, bagikan, paket · 11 Nov · 7b74b30 · catatan parsial, laporan seed, token bagikan, dan aktivasi paket
- [x] C2.1 Login dokter, daftar pasien, detail · 11 Nov · 66314d8 · login, daftar dan detail pasien, serta pembatasan akses dokter lain
- [x] C2.2 Laporan bagikan dan klaim · 11 Nov · 66314d8 · bagikan laporan dan klaim pasien di Chrome
- [ ] C2.3 Resep bahasa bebas → JSON
- [x] C2.4 Konfirmasi aturan · 11 Nov · 66314d8 · aturan baru terbaca di layar sesi keluarga
- [x] C3.1 `/klinik/masuk` dan tata letak · 11 Nov · 85371f6 · nama sesuai akun, login dan logout Chrome 390/1280 px
- [x] C3.2 `/klinik/pasien` · 11 Nov · 66314d8 · Dika tampil setelah klaim di Chrome
- [x] C3.3 `/klinik/pasien/:id` · 11 Nov · 66314d8 · alur resep dari cache di Chrome dan tangkapan layar 390/1280 px
- [x] C3.4 `/r/:token` · 11 Nov · 66314d8 · laporan dibuka di konteks browser terpisah dan berhasil diklaim
- [ ] C4.1 Ringkasan mingguan
- [x] C4.2 Mode demo dan reset · 11 Nov · 7b74b30 · reset menghapus data latihan, memulihkan Dika, dan mempertahankan cache
- [ ] C4.3 Uji Vercel + Turso (bonus)
- [x] C5.1 Kontribusi Adit di README · 11 Nov · 7b74b30 · kontribusi Adit, cara kerja AI, dan bantuan Codex di README
