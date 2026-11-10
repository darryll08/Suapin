# Suapin — Product Requirements Document (PRD)

| | |
|---|---|
| Versi | 1.0 |
| Tanggal | 10 November 2026 |
| Tim | BOOMERANG, Universitas Airlangga: Darryl (A), Wayan Satya (B), Adit (C) |
| Lomba | LOGICODIX Hackathon 2026, cabang Web App, subtema Inclusive Health & Well-being |
| Status | Disusun dari keputusan yang sudah dikunci. Bukan usulan baru |
| Acuan | `Suapin - Dokumen Produk.md` Versi 3.4 (alasan dan bukti), `jobdesk/Prompt_Orang_*.md` (cara build, lebih baru dari dokumen produk), `brand/README.md` (identitas visual) |
| Dokumen pasangan | `Suapin - UI UX Guidelines.md` |

**Cara membaca.** Bagian 1–5 menjelaskan *apa* dan *untuk siapa*. Bagian 6–13 menjelaskan *bagaimana* dengan angka, skema, dan aturan yang bisa langsung dibangun. Bagian 14–18 berisi kualitas, uji, jadwal, risiko, dan hal yang belum pasti. Setiap kebutuhan punya ID (`F-xx`, `NF-xx`) dan kriteria terima yang bisa dijalankan. Bila PRD ini berbeda dengan dokumen produk, ikuti PRD ini dan jobdesk, karena keduanya sudah menyesuaikan sisa waktu.

---

## Daftar isi

1. Ringkasan produk
2. Masalah
3. Tujuan, non-tujuan, dan metrik
4. Pengguna dan konteks pakai
5. Ruang lingkup MVP
6. Arsitektur sistem
7. Kebutuhan fungsional: aplikasi keluarga
8. Kebutuhan fungsional: sesi makan
9. Kebutuhan fungsional: dashboard klinik dan laporan bagikan
10. Kebutuhan fungsional: alat demo dan pengembangan
11. Model data
12. API
13. Spesifikasi AI
14. Kebutuhan non-fungsional
15. Privasi, etika, regulasi
16. Pengujian, gerbang, dan definisi selesai
17. Jadwal, kepemilikan, dan rilis
18. Risiko
19. Pertanyaan terbuka dan validasi
20. Glosarium

---

## 1. Ringkasan produk

Suapin adalah PWA untuk balita 3–5 tahun yang sulit makan (GTM, gerakan tutup mulut). Aplikasi dipakai saat makan, di HP atau laptop yang diletakkan di depan anak.

1. **Pemanasan (sebelum makan, 60–180 detik).** Karakter animasi berkenalan dengan makanan hari ini: mencium, menyentuh, menggigit kecil, berekspresi senang.
2. **Loop giliran (saat makan).** Karakter menggigit, lalu giliran anak. Pengasuh menekan **Suap** saat menyodorkan sendok. Kamera membaca mulut anak dengan MediaPipe `FaceLandmarker` di browser. Mulut karakter meniru mulut anak secara live. Bila suapan diterima, karakter merayakan. Bila anak menolak, karakter menanggapi datar dan singkat.
3. **Jeda kunyah.** Layar meredup, karakter mengunyah pelan meniru rahang anak.
4. **Lepas layar.** Bantuan layar dikurangi dalam 4 tahap sampai pengasuh menjalankan ritual tanpa aplikasi.
5. **Dua jalur, satu aplikasi.** Keluarga bisa langsung memakai sendiri (B2C, program default dari aturan makan IDAI). Dokter bisa mengambil alih (B2B2C): dokter menulis aturan dalam bahasa bebas, LLM mengubahnya menjadi JSON, dokter mengonfirmasi, dan sesi keluarga ikut berubah.

Video kamera tidak pernah keluar dari perangkat. Yang dikirim ke server hanya angka sesi dan daftar suapan.

Produk ini tidak mendiagnosis, tidak memberi resep makanan, dan tidak menggantikan dokter.

---

## 2. Masalah

### 2.1 Kondisi

- Studi prasekolah di Jakarta menyebut prevalensi kesulitan makan 33,6%. Dari jumlah itu, 44,5% mengalami malnutrisi ringan sampai sedang, dan 79,2% berlangsung lebih dari tiga bulan.
- Angka antar studi berkisar sekitar 15% sampai 60,3% karena definisinya berbeda. Tidak ada angka nasional resmi. **Jangan sajikan satu angka sebagai fakta nasional.**
- Kaitan langsung dengan stunting belum terverifikasi. Tulis "dapat memengaruhi asupan dan pertumbuhan".

### 2.2 Kenyataan di rumah

- GTM kebanyakan ditangani sendiri: dibujuk, dicekoki, atau diberi YouTube. Tidak semua keluarga ke dokter.
- Orang tua bekerja, jadi pengasuh atau ART yang menyuapi.
- Anak disuapi sambil bengong menonton. Makan bisa sampai satu jam.
- Dokter hanya melihat anak beberapa menit saat kontrol. Aturan makan dokter ("tanpa layar, maksimal 30 menit") sulit dijalankan tanpa pengganti YouTube.

### 2.3 Celah yang diisi

| Yang ada sekarang | Kekurangannya | Yang dilakukan Suapin |
|---|---|---|
| YouTube saat makan | Anak pasif, makin tergantung layar | Layar seru hanya saat anak membuka mulut, lalu dikurangi bertahap |
| Aturan makan dari dokter | Tidak ada alat untuk menjalankannya di rumah | Aturan dokter langsung mengatur perilaku aplikasi |
| Game edukasi makanan | Dimainkan di luar jam makan | Dipakai *saat* makan, dengan makanan yang sama di piring |
| Bujukan pengasuh | Tanpa panduan, sering memaksa | Teks kecil memandu pengasuh, suara karakter mengajak pengasuh jadi contoh |

### 2.4 Dasar ilmiah yang dipakai sebagai bahan aktif

| Bukti | Dipakai di fitur |
|---|---|
| Food Dudes (Lowe dkk. 2004, 402 anak; Horne dkk. 2004, 749 anak): model sebaya + hadiah kecil menaikkan konsumsi buah/sayur | Karakter sebagai model + stiker sebagai hadiah non-makanan |
| Aston 2022 dan 2024 (4–6 tahun): video orang dewasa makan brokoli dengan ekspresi senang menaikkan asupan | Ekspresi "enak" karakter, pengasuh diajak menggigit duluan |
| Tinjauan USDA: penerimaan naik setelah 8–10 kali paparan | Pelacak makanan baru, target 10 paparan |
| Avery dkk. 2017 (13 studi, ~61 ribu anak): TV saat makan terkait diet lebih buruk | Layar redup saat jeda, program lepas layar |

Karakter interaktif yang meniru wajah **belum punya studi**. Posisikan sebagai kemasan baru dari bahan aktif yang sudah terbukti, dan rencanakan pilot. Buka paper asli sebelum angka dipakai di video atau slide.

---

## 3. Tujuan, non-tujuan, dan metrik

### 3.1 Tujuan

| ID | Tujuan |
|---|---|
| G1 | Waktu makan menjadi permainan bergiliran yang aktif, bukan tontonan pasif |
| G2 | Aturan makan dokter bisa dijalankan di rumah tanpa YouTube |
| G3 | Ketergantungan pada layar berkurang sampai lepas (tahap 4) |
| G4 | Dokter mendapat data perilaku makan di rumah antar kontrol |
| G5 | Lomba: lolos Top 8 lewat repo + video, lalu demo live di localhost pada 29 Nov |

### 3.2 Non-tujuan

- Tidak mengukur jumlah makanan atau gizi. "Suapan diterima" adalah ukuran perilaku, bukan asupan. Porsi hanya dari catatan pengasuh.
- Tidak mendiagnosis GTM, gangguan makan, atau penyakit.
- Tidak menyarankan menu, dosis, atau suplemen.
- Tidak mengobrol bebas dengan anak. Tidak ada LLM yang berbicara langsung ke anak.
- Tidak menyimpan, merekam, atau mengirim video, gambar wajah, atau landmark mentah.
- MVP tidak mendukung mode makan sendiri otomatis, Hand Landmarker, deteksi sendok, banyak karakter, notifikasi, pembayaran asli, atau integrasi rekam medis.

### 3.3 Metrik lomba (wajib terukur sebelum 13 Nov 18.00)

| Metrik | Target | Sumber |
|---|---|---|
| Gerbang go/no-go | Semua baris di bagian 16.2 terisi angka asli | `docs/gerbang.md` |
| Frame rate deteksi di laptop final | ≥ 15 fps | Panel ambang |
| Alur demo ujung ke ujung (bagian 17.4) | Jalan di localhost tanpa internet, kecuali panggilan LLM yang punya cadangan cache | Latihan demo |
| Akurasi "diterima" dan "menolak" | Precision, recall, F1 dilaporkan apa adanya, populasi "orang dewasa, n = …" | `docs/hasil-uji.md` |
| Tes otomatis | `npm run periksa` hijau | CI lokal |

### 3.4 Metrik produk (setelah lomba, dipakai di pitch)

| Tahap corong | Metrik |
|---|---|
| Daftar | Persentase pengunjung landing yang menyelesaikan onboarding + skrining |
| Aktivasi | Persentase keluarga yang menjalankan sesi pertama di hari daftar |
| Kebiasaan | Sesi per hari selama trial 5 hari |
| Konversi | Persentase trial yang membayar Program 30 Hari |
| Hasil | Persentase keluarga yang naik tahap; persentase yang mencapai tahap 4 (lulus) |
| Klinik | Jumlah dokter yang membuka link laporan; jumlah yang menekan "Jadikan pasien saya" |

Produk ini sengaja membuat keluarga lulus. Pertumbuhan datang dari keluarga baru dan jalur klinik, bukan dari menahan pengguna.

---

## 4. Pengguna dan konteks pakai

### 4.1 Peran

| Peran | Siapa | Yang dilakukan di aplikasi | Perangkat |
|---|---|---|---|
| Orang tua | Ibu/ayah, sering bekerja | Daftar, skrining, bayar, baca laporan, bagikan ke dokter | HP |
| Pengasuh | ART, nenek, orang tua sendiri | Menjalankan sesi: pilih menu, tekan Suap, jawab Ya/Tidak, ikut menggigit, isi catatan | HP atau tablet di meja makan, kadang laptop |
| Balita | 3–5 tahun (36–71 bulan) | Bergiliran makan dengan karakter. Tidak pernah menyentuh tombol | Hanya melihat layar |
| Dokter | Dokter anak swasta, klinik tumbuh kembang | Membuka laporan, menjadikan pasien, menulis aturan, memantau | Laptop, kadang HP |
| Tim (demo) | Anggota tim | Panel ambang, reset data demo, masuk sebagai persona | Laptop final |

### 4.2 Persona demo (data seed, ilustrasi, bukan kasus nyata)

- **Dika**, 4 tahun 2 bulan. Hanya mau makan sambil menonton YouTube. Dokter meminta makan tanpa layar, tetapi tanpa YouTube Dika menutup mulut.
- **Mbak Rini**, pengasuh Dika. Menyuapi dengan satu tangan memegang sendok dan tangan lain memegang mangkuk. Sapaan di aplikasi: `mbak`.
- **dr. Demo**, Klinik Tumbuh Kembang Contoh. Akun `dokter@demo.test`.

### 4.3 Konteks pakai yang membentuk kebutuhan

| Kondisi nyata | Akibat untuk produk |
|---|---|
| Tangan pengasuh penuh dan kotor | Tombol Suap ≥ 96 px, di sisi duduk pengasuh; tombol lain jarang dibutuhkan |
| Pengasuh duduk di samping anak dan kadang masuk ke kamera | `numFaces: 2`, wajah anak dipilih dan dilacak |
| Anak menoleh ke pengasuh untuk mengambil suapan | Menolak hanya bila menoleh *menjauhi* sisi pengasuh |
| Anak tidak mau diam untuk kalibrasi | Baseline bergulir, bukan kalibrasi sekali |
| Sesi 20–30 menit | Wake Lock; layar tidak boleh mati |
| Anak mendengar semua suara | Arahan sensitif ("jangan dibujuk") hanya teks, tanpa suara |
| Cahaya meja makan sering redup, makan lesehan | Pesan posisi/cahaya; pratinjau kamera kecil untuk pengasuh |
| Internet rumah tidak stabil | Sesi makan berjalan penuh tanpa internet |

---

## 5. Ruang lingkup MVP

### 5.1 Wajib selesai (inti demo, tidak boleh dipangkas)

1. Onboarding singkat dengan skrining 7 pertanyaan.
2. Sesi makan penuh: kalibrasi, pemanasan, loop giliran, karakter meniru mulut, perayaan, penolakan datar, tidak pasti, jeda kunyah.
3. 1 karakter, 1 makanan (brokoli, 3 gambar) + gambar umum, 1 sapaan (Mbak), 12–15 klip suara.
4. Tahap 1–3 sebagai saklar. Tahap 4 cukup tampilan "catat saja".
5. Resep bahasa bebas dokter → LLM → JSON → konfirmasi → sesi keluarga berubah.
6. Satu ringkasan AI dengan cadangan cache dan template.
7. Panel ambang dan tombol reset data demo (wajib sebelum kode beku 14 Nov).
8. Sumber sinyal palsu (slider dan rekaman ulang) untuk pengembangan, tes, dan cadangan demo.
9. Video demo 3–5 menit.

### 5.2 Disederhanakan untuk lomba

| Fitur | Versi lomba | Versi produksi |
|---|---|---|
| Progres di dashboard | Tabel | Grafik batang |
| Peta stiker | Stiker 7 hari + stiker penutup | Peta minggu bertema |
| Pelacak makanan baru | Angka "Brokoli 4/10" sebagai jalur langkah | Banyak makanan, daftar "sudah kenal" |
| Bagikan laporan | Token acak 32 byte tanpa masa berlaku | Masa berlaku 14 hari, bisa dicabut |
| Masuk ke jalur klinik | Tombol **Jadikan pasien saya** di `/r/:token` | Kode undangan 6 karakter, sekali pakai, 7 hari |
| Pembayaran | Tombol mock "Aktifkan program" | Midtrans/Xendit, QRIS, e-wallet, webhook bertanda tangan |
| Ringkasan AI | Satu versi keluarga + satu versi dokter per minggu | Sama, plus tren antar minggu |
| Offline | Service worker menyimpan aset; server di laptop yang sama | Antrean IndexedDB, sinkron saat online |
| Sapaan | Mbak saja | Mbak, Bu, Oma, Ayah |
| Login | Kode akses keluarga; satu akun dokter demo | OTP nomor HP atau magic link (Supabase Auth) |
| Skrining | Form checklist biasa | Ditinjau dokter penasihat, daftar klinik mitra terdekat bila ada tanda bahaya |

### 5.3 Ditunda (bukan MVP)

Payment gateway asli, Hand Landmarker, deteksi sendok, banyak karakter dan makanan, rekomendasi menu, notifikasi, integrasi RME, akun klinik kompleks, Supabase, mode makan sendiri otomatis, kode undangan.

### 5.4 Urutan pangkas bila tonggak terlewat

1. Grafik progres.
2. Deploy Vercel.
3. Ringkasan versi keluarga (versi dokter tetap).
4. Animasi pemanasan panjang (cukup 30 detik).
5. Paywall mock.
6. Makanan selain brokoli.

### 5.5 Rencana cadangan bila gerbang deteksi gagal

| Yang gagal | Perubahan | Cara |
|---|---|---|
| Deteksi kunyah | Jeda kunyah selesai lewat timer 15 detik atau tombol Lanjut; tidak ada `KEMUNGKINAN_NGEMUT` | `ambang.kunyahDariKamera = false` |
| Deteksi mulut terbuka atau menoleh | Hasil suapan dari tombol pengasuh Ya/Tidak; kamera hanya menggerakkan mulut karakter | `ambang.hasilDariKamera = false` |

Engine, layar, dan alur demo tetap sama di kedua cadangan.

---

## 6. Arsitektur sistem

### 6.1 Diagram

```text
                        PERANGKAT KELUARGA (browser / PWA)
 ┌────────────────────────────────────────────────────────────────────────┐
 │ Kamera ─► FaceLandmarker (WASM, model .task lokal) ─► Pengolah sinyal  │
 │                                                     {t,mulut,rahang,   │
 │ Sumber palsu (slider / rekaman JSON) ──────────────► yaw,nangis,       │
 │                                                      terlihat}         │
 │                                                          │             │
 │                                       State machine sesi (fungsi murni)│
 │                                                          │ perintah    │
 │                     ┌────────────────────┬───────────────┼──────────┐  │
 │                 Karakter SVG/WebP   Pemutar klip MP3  Strip teks  Catat│
 │                                                                 suapan │
 │                                                          │             │
 │                                       SesiSelesai (angka saja)         │
 └──────────────────────────────────────────────────────────┼─────────────┘
                                                            │ panggil()
                                 ┌──────────────────────────▼────────────┐
                                 │ API Hono (Node: @hono/node-server     │
                                 │ :8787 lokal / Vercel Function online) │
                                 │ akses cookie, aturan, naik tahap,     │
                                 │ laporan, token bagikan, proxy LLM     │
                                 └───────┬───────────────────────┬───────┘
                                         │ Drizzle + libsql      │ HTTPS (server saja)
                                 ┌───────▼──────────┐   ┌────────▼─────────┐
                                 │ SQLite file:     │   │ OpenAI           │
                                 │ local.db (final) │   │ gpt-6-luna       │
                                 │ Turso (online)   │   │ resep, ringkasan │
                                 └──────────────────┘   └──────────────────┘
 Dashboard klinik (browser dokter) ──► API yang sama
 ElevenLabs: hanya saat pengembangan, membuat MP3 sekali lewat skrip
```

### 6.2 Komponen

| Komponen | Jalan di | Butuh internet | Pemilik |
|---|---|---|---|
| Aplikasi keluarga (React 19 + Vite + TS strict + React Router + Tailwind 4) | Browser HP/laptop | Tidak untuk sesi; ya untuk laporan AI dan resep terbaru | B |
| Mesin deteksi + engine sesi | Browser | Tidak | A |
| Dashboard klinik + `/r/:token` | Browser dokter | Ya (lokal: tidak, server di laptop yang sama) | C |
| API Hono | Laptop (lomba), Vercel Functions (online bonus) | — | C |
| Database | SQLite file (lomba), Turso libSQL (online bonus), Supabase Postgres (produksi) | — | C |
| LLM | OpenAI, hanya dipanggil server | Ya, dengan cadangan cache | C |
| Suara | MP3 statis di `public/klip/`, dibuat dengan ElevenLabs sekali | Tidak | B |

### 6.3 Stack yang dikunci

| Lapisan | Pilihan |
|---|---|
| Frontend | React 19, Vite, TypeScript strict, React Router (mode library), Tailwind 4 |
| PWA | `vite-plugin-pwa` (Workbox), `registerType: "autoUpdate"` |
| Computer vision | `@mediapipe/tasks-vision` `FaceLandmarker`, WASM dan `face_landmarker.task` disajikan dari `public/mediapipe/` |
| Backend | Hono. Lokal `@hono/node-server` port 8787, Vite mem-proxy `/api`. Online lewat `api/index.ts` |
| Database | Drizzle ORM + `@libsql/client`. `DATABASE_URL=file:local.db` lokal; `libsql://...` + `TURSO_AUTH_TOKEN` online |
| Kontrak | Zod 4 di `bersama/kontrak/`, tipe lewat `z.infer` |
| LLM | OpenAI SDK, `gpt-6-luna`, structured output |
| Suara | ElevenLabs TTS `eleven_multilingual_v2` (cek nama model sebelum dipakai) |
| Tes | Vitest |
| Auth | Cookie bertanda tangan HMAC (`hono/cookie`), bcrypt untuk sandi dokter |

### 6.4 Prinsip arsitektur

1. Video tidak pernah keluar dari browser. Hanya angka yang lewat jaringan.
2. Browser tidak pernah memanggil OpenAI. Kunci API hanya di server.
3. State machine sesi adalah fungsi murni `next(keadaan, kejadian, konteks) → { keadaan, perintah[] }`. Tidak ada `Date.now()`, `setTimeout`, atau akses DOM di dalamnya, jadi bisa dites tanpa kamera.
4. Semua ambang deteksi dibaca dari satu objek (`src/mesin/ambang.ts`) yang bisa diubah saat aplikasi jalan. Kode beku 14 Nov, tetapi ambang tetap bisa disetel untuk final 29 Nov.
5. Server tidak menulis file selain database dan tidak bergantung pada proses yang nyala terus, supaya kode yang sama jalan di Vercel.
6. Semua panggilan layar ke API lewat `panggil(nama, { params, body })` yang memvalidasi request dan response dengan Zod.

---

## 7. Kebutuhan fungsional: aplikasi keluarga

Format: **Deskripsi**, **Aturan**, **Kriteria terima**. Rute dan endpoint lengkap ada di bagian 12.

### F-01 Landing `/`

- **Deskripsi:** halaman pertama untuk keluarga dan dokter.
- **Aturan:**
  - Isi: logo, judul, satu kalimat masalah, ilustrasi karakter, tombol **Mulai gratis untuk keluarga** (→ `/mulai`), tombol **Untuk klinik** (→ `/klinik/masuk`), tautan "Sudah punya kode? Masuk" (→ `/masuk`).
  - Tidak ada klaim "menyembuhkan", "pertama di Indonesia", atau "patuh UU PDP".
  - Memanggil `GET /api/sehat` diam-diam (tidak menampilkan apa pun bila gagal).
  - Mengetuk logo 5 kali dalam 3 detik membuka `/dev/ambang`.
- **Kriteria terima:** landing terbuka offline setelah kunjungan pertama; ketukan logo 5× membuka panel ambang; tidak ada teks klaim terlarang.

### F-02 Daftar keluarga `/mulai`

- **Deskripsi:** profil anak dan pengasuh dalam ±1 menit.
- **Aturan:**
  - Isian: panggilan anak (wajib, 1–20 karakter), tanggal lahir (input `date`, wajib, tidak boleh di masa depan), sapaan pengasuh (pilihan `mbak` | `bu` | `oma` | `ayah`), nama pengasuh (wajib, 1–30 karakter).
  - Usia di luar 36–71 bulan: tampilkan catatan "Program dirancang untuk usia 3–5 tahun." Tidak memblokir.
  - `POST /api/children` → server membuat anak dengan `plan = trial`, `trial_until = sekarang + 5 hari`, `stage = 1`, kode akses 12 karakter, dan memasang cookie `tm_keluarga`.
  - Kode akses ditampilkan **sekali** dalam kotak besar dengan tombol salin dan teks "Simpan kode ini untuk membuka di HP lain." Server hanya menyimpan hash-nya, jadi kode tidak bisa ditampilkan ulang.
  - Setelah pengguna menekan Lanjut, arahkan ke `/mulai/skrining`.
- **Kriteria terima:** anak baru tersimpan; kode bisa dipakai masuk di browser lain; menyegarkan halaman setelah kode tampil tidak menampilkan kode lagi.

### F-03 Masuk dengan kode `/masuk`

- **Aturan:** satu isian kode (12 karakter, huruf besar otomatis, spasi dibuang). `POST /api/masuk`. 401 → tampilkan pesan server "Kode tidak dikenal". Sukses → `/beranda`.
- **Kriteria terima:** kode benar masuk; kode salah menampilkan pesan tanpa memberi tahu apakah kode hampir benar.

### F-04 Skrining tanda bahaya `/mulai/skrining`

- **Deskripsi:** pengaman jalur mandiri. Wajib sebelum sesi pertama.
- **Pertanyaan (7, ya/tidak, semuanya wajib dijawab, urutan tetap):**
  1. Berat badan turun atau tidak naik beberapa bulan.
  2. Sering tersedak atau batuk saat makan.
  3. Sesak atau bibir kebiruan saat makan.
  4. Muntah berulang atau diare lama.
  5. Tampak kesakitan saat makan atau menelan.
  6. Keterlambatan perkembangan lain.
  7. Penyakit kronis atau alergi makanan berat.
- **Aturan:**
  - `POST /api/screenings` dengan `jawaban: boolean[7]`. `ada_tanda_bahaya = jawaban.some(Boolean)`.
  - Semua "tidak": server menulis aturan default (`source = default`, `stage = 1`), lalu arahkan ke `/beranda`.
  - Satu "ya": layar "Sebaiknya periksa ke dokter dulu". Sesi tidak dibuka. Tampilkan penjelasan bahwa setelah diperiksa, dokter bisa menjadikan anak pasiennya lewat link laporan, dan program dibuka dari sisi dokter. Akun tetap ada.
  - Teks kecil di bawah daftar: "Daftar ini draf dan sedang ditinjau dokter."
- **Kriteria terima:** jalur aman dan jalur tanda bahaya sama-sama dicoba; `GET /api/saya` mengembalikan `sesi_dibuka` yang benar untuk keduanya.

### F-05 Status akun (`plan`) dan penjaga rute

- **State `plan`:**

```text
          daftar
            │
            ▼
   ┌────► trial (5 hari) ──trial_until lewat──► expired (sesi terkunci, data aman)
   │        │ aktifkan                              │ aktifkan
   │        ▼                                       ▼
   │      program (30 hari) ──habis──► lanjutan (bulanan) / expired   [produksi]
   │
   └── dokter menekan "Jadikan pasien saya" dari status mana pun ──► klinik
```

| `plan` | Bisa sesi | Aturan dari | Paywall |
|---|---|---|---|
| `trial` | Ya, bila skrining aman | Default | Belum |
| `expired` | Tidak. Beranda dan laporan tetap bisa dibuka | — | Ya |
| `program` | Ya | Default | Tidak |
| `lanjutan` | Ya (produksi) | Default | Tidak |
| `klinik` | Ya, walau skrining berisi tanda bahaya (dokter sudah memeriksa) | Dokter; default sampai dokter mengonfirmasi | Tidak |

- **`GET /api/saya`** menghitung `plan` efektif (trial yang lewat diperbarui jadi `expired`), `sesi_dibuka`, dan `alasan_terkunci` (`skrining_belum` | `tanda_bahaya` | `trial_habis` | `null`).
- **Penjaga rute keluarga (`ButuhKeluarga`):** 401 → `/`; `skrining_belum` → `/mulai/skrining`; `trial_habis` → `/langganan` (beranda dan laporan tetap boleh dibuka); `tanda_bahaya` → sesi diganti pesan saran ke dokter.
- **Kriteria terima:** ubah `trial_until` ke masa lalu di database uji → sesi diarahkan ke `/langganan`; aktifkan → sesi terbuka lagi.

### F-06 Beranda `/beranda`

- **Isi:**
  - Salam dengan sapaan dan nama panggilan anak, misalnya "Halo Mbak Rini, siap makan bareng Dika?"
  - Kartu tahap (1–4) dengan satu kalimat penjelasan apa yang terjadi di tahap ini.
  - Stiker 7 hari terakhir: satu lingkaran per hari, terisi bila hari itu ada ≥ 1 sesi dengan ≥ 1 suapan diterima.
  - Pelacak makanan baru: "Brokoli 4/10" sebagai jalur 10 langkah.
  - Tombol utama **Mulai makan** (→ `/sesi`).
  - Tautan ke Laporan.
  - `plan = trial` → "Sisa trial X hari". Hari ke-4 trial → kartu progres "Dika menerima 6 suapan per sesi. Trial sisa 1 hari." `plan = klinik` → "Program dari dokter".
- **Keadaan:** belum ada sesi → ajakan sesi pertama; memuat → komponen `Memuat`; galat → `PesanGalat` dengan tombol coba lagi.
- **Kriteria terima:** data seed Dika tampil lengkap; anak baru tanpa sesi menampilkan ajakan.

### F-07 Catatan setelah sesi `/sesi/catatan?id=<session_id>`

- **Aturan:**
  - Karakter mengucap klip `penutup`. Stiker hari ini muncul dengan animasi pop sekali (600 ms).
  - `naik_tahap = true` → kartu "Naik ke tahap X" + apa yang berubah. `saran_turun_tahap = true` → kartu saran kembali ke tahap sebelumnya. `paparan` ada → "Brokoli dicoba 5/10 kali".
  - Pilihan porsi (`sedikit` | `setengah` | `habis`) dan mood (`senang` | `biasa` | `rewel`), keduanya opsional. Simpan → `POST /api/sessions/:id/notes` → `/beranda`.
  - Stiker diberikan karena anak mau mencoba, bukan karena porsi habis. Tidak ada kalimat yang memuji porsi habis.
- **Kriteria terima:** catatan tersimpan; beranda menampilkan stiker hari ini.

### F-08 Laporan `/laporan`

- **Isi:**
  - Daftar sesi 14 hari: tanggal, jam, menu, diterima, ditolak, ngemut, durasi.
  - Ringkasan keluarga minggu ini dengan label "Dibuat oleh AI dari data sesi" dan sumbernya (`ai` | `cache` | `template`). Bila belum ada: tombol "Buat ringkasan minggu ini" (`POST /api/summaries/:childId`).
  - Tombol **Bagikan ke dokter** → `POST /api/reports/share` → tampilkan link `/r/<token>` + tombol salin + `navigator.share` bila tersedia (judul "Laporan makan <panggilan>").
- **Kriteria terima:** link yang disalin bisa dibuka di jendela samaran dan menampilkan laporan versi dokter.

### F-09 Langganan `/langganan` (mock)

- **Isi:** Program 30 Hari Rp 49.000 dengan label "harga uji coba", daftar isi program, tombol **Aktifkan program**, keterangan "Mode demo lomba: tanpa pembayaran".
- **Aturan:** `POST /api/plan/activate` dengan `paket: "program_30"` → `plan = program`. Tidak ada data kartu, rekening, atau nomor HP yang diminta.
- **Kriteria terima:** trial habis → diarahkan ke sini → aktifkan → sesi terbuka.

### F-10 Hapus data (produksi)

Tombol di pengaturan menghapus anak beserta semua sesi, suapan, catatan, ringkasan, dan token bagikan. **Tidak ada di MVP**, tetapi skema harus memungkinkan hapus berantai (semua tabel turunan punya `child_id` atau `session_id`).

---

## 8. Kebutuhan fungsional: sesi makan

Sesi sama untuk jalur mandiri dan klinik. Bedanya hanya sumber aturan.

### F-11 Persiapan sesi `/sesi` (langkah 1)

- **Urutan dalam satu halaman bertahap:**
  1. **Pilih menu:** kartu bergambar dari `MAKANAN` (`brokoli`, `umum`) + pilihan "Lainnya" yang memakai gambar `umum`. Sakelar "Makanan baru?".
  2. **Sisi duduk pengasuh:** dua tombol besar "Kiri anak" / "Kanan anak" dengan ilustrasi tampak atas. Nilai disimpan sebagai `sisiPengasuh: "kiri" | "kanan"` dan dipakai untuk (a) membedakan menoleh ke sendok dari menoleh menolak, (b) menaruh tombol Suap di sisi layar yang dekat dengan pengasuh. Definisi arah dan pemetaan tanda yaw dijelaskan di UI/UX Guidelines bagian 10.7 dan harus disepakati A dan B.
  3. **Petunjuk posisi:** "Letakkan HP sedikit di samping depan anak, wajah anak terlihat. Jauhkan dari jangkauan tangan anak."
  4. Tombol **Mulai makan**. Handler-nya menjalankan berurutan: `bukaAudio()` (memutar buffer hening 50 ms supaya audio tidak diblokir), `muatSemua(idKlip)`, `navigator.wakeLock.request("screen")` (abaikan bila tidak didukung), lalu masuk layar makan.
- **Aturan tambahan:**
  - Aturan aktif diambil dari `GET /api/children/:id/rules` setiap awal sesi.
  - Tahap 4: halaman diganti pesan "Hari ini Mbak yang memimpin. Catat hasilnya setelah makan" + tombol ke `/sesi/catatan`.
  - `sesi_dibuka = false` → tampilkan alasan dan tombol ke skrining atau langganan.
- **Kriteria terima:** dari beranda ke layar makan ≤ 3 ketukan setelah menu dipilih; klip pertama terdengar di Chrome HP tanpa ketukan tambahan.

### F-12 Kamera dan FaceLandmarker

- **Aturan:**
  - `getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false })`.
  - Konteks tidak aman (`!window.isSecureContext`) → pesan "Buka lewat localhost atau HTTPS". `NotAllowedError` → penjelasan izin kamera + tombol "Lanjut tanpa kamera". `NotFoundError` → "Kamera tidak ditemukan" + "Lanjut tanpa kamera".
  - `FilesetResolver.forVisionTasks("/mediapipe/wasm")` lalu `FaceLandmarker.createFromOptions` dengan `modelAssetPath: "/mediapipe/face_landmarker.task"`, `delegate: "GPU"` (fallback `"CPU"` bila galat), `runningMode: "VIDEO"`, `numFaces: 2`, `outputFaceBlendshapes: true`, `outputFacialTransformationMatrixes: true`.
  - Loop memakai `video.requestVideoFrameCallback` (fallback `requestAnimationFrame`), dibatasi `ambang.fpsMaks` (awal 20). Frame dilewati bila jarak dari deteksi terakhir < `1000 / fpsMaks`.
  - Pratinjau kamera kecil di pojok, dicerminkan (`scaleX(-1)`), `muted playsInline`. Tidak direkam, tidak dikirim.
  - Tidak ada aset yang dimuat dari luar `localhost` saat sesi.
  - `visibilitychange` → `hidden`: jeda sesi; saat kembali: pasang ulang Wake Lock dan tampilkan "Lanjutkan makan?".
  - Keluar halaman: hentikan semua track kamera, `close()` landmarker, lepaskan Wake Lock.
- **Mode tanpa kamera:** `sumber = null`. Hasil suapan dari tombol Ya/Tidak pengasuh. Karakter tidak meniru; mulutnya mengikuti pose.
- **Kriteria terima:** DevTools Network saat `/dev/kamera` tidak memuat apa pun dari luar `localhost`; fps nyata ≥ 15 di laptop final.

### F-13 Pemilihan wajah anak

- **Aturan:**
  - Setiap wajah: kotak dari min/max landmark x,y; pusat; luas.
  - Saat kalibrasi: pilih wajah dengan skor `luas × (1 − jarak pusat ke tengah frame)` tertinggi. Simpan sebagai `wajahAnak`.
  - Pengasuh boleh mengetuk wajah yang benar di pratinjau (`pilihWajahDiTitik(x, y)`). Karena pratinjau dicerminkan, koordinat ketukan diubah dulu: `x_frame = 1 − x_layar`.
  - Frame berikutnya: pilih wajah dengan jarak pusat terdekat ke `wajahAnak` dan rasio luas 0,5–2. Perbarui `wajahAnak = 0,8 × lama + 0,2 × baru`.
  - Tidak ada wajah yang memenuhi selama 1,5 detik → `terlihat = false`.
- **Kriteria terima:** tes unit dua kotak sintetis; uji gerbang "dua wajah" ≥ 9/10.

### F-14 Pengolahan sinyal

Keluaran per frame, satu bentuk untuk sumber kamera dan sumber palsu (`SinyalSchema`, bagian 11.3):

| Sinyal | Rumus | Catatan |
|---|---|---|
| `mulut` | `jawOpen − baseline_mulut`, dihaluskan `0,4 × baru + 0,6 × sebelumnya`, dibatasi 0..1 | Untuk menilai suapan dan menggerakkan mulut karakter |
| `rahang` | `jarak(landmark 152 dagu, 1 ujung hidung) / jarak(10 dahi, 152)`, koordinat x,y dikali lebar/tinggi video, dikurangi baseline, dihaluskan sama | Untuk kunyah. Tetap bergerak walau bibir tertutup. Bila uji angguk gagal: putar titik ke koordinat lokal wajah dengan kebalikan matriks transformasi dulu |
| `yaw` | `atan2(m[8], m[10]) × 180/π` dari `facialTransformationMatrixes[i].data` (16 angka, kolom-mayor), dikurangi `baseline_yaw`, tandanya disesuaikan dengan `sisiPengasuh` | **Positif selalu berarti menoleh ke pengasuh, negatif menjauh.** Tanda diverifikasi manual di `/dev/kamera` |
| `nangis` | `rata(eyeSquintLeft, eyeSquintRight, browDownLeft, browDownRight) > ambang.nangis (0,5)` **dan** `mulut > ambang.terbuka` | Dugaan, belum dites |
| `terlihat` | Wajah anak ditemukan pada frame ini | — |
| `t` | `performance.now()` dalam ms | — |

**Baseline bergulir:** simpan nilai 10 detik terakhir hanya saat status bukan `MENILAI` dan bukan kunyah aktif (engine mengirim `baselineBoleh(bool)`). Baseline = persentil 20.

### F-15 Kalibrasi

- Status `KALIBRASI` ±3 detik. Klip `sapa_awal` ("Halo! Lihat aku dulu ya!"). Lingkaran panduan wajah di pratinjau.
- Mencatat `baseline_yaw` dan memilih wajah anak.
- Wajah tidak stabil terlihat → teks `wajah_tidak_terlihat` ("Wajah tidak terlihat. Geser HP atau tambah cahaya.").
- Balita jarang mau diam, jadi kalibrasi tidak boleh menahan sesi: setelah 3 detik sesi tetap lanjut memakai baseline bergulir.

### F-16 Pemanasan

- Urutan tetap 60–90 detik di MVP (dokumen produk: 2–3 menit; dipangkas ke 30 detik bila waktu habis): karakter memegang makanan → mencium (pose `enak`, klip `kenalan_makanan`) → menyentuh → gigit kecil (pose `menggigit`) → klip `ajak_makan_bareng`, dengan nama panggilan anak di teks layar.
- Animasi penuh, layar terang. Bagian ini paling didukung bukti modeling, jadi dibuat paling menarik.
- Tombol "Lewati" → `tekan("lewati_pemanasan")`. Selesai → `selesaiPemanasan()`.
- **Kriteria terima:** pemanasan jalan tanpa kamera (`?sumber=slider`) dan bisa dilewati.

### F-17 State machine sesi

Kejadian masuk: `sinyal` (per frame), `tombol` (`suap` | `lanjut` | `ya` | `tidak` | `stop` | `darurat` | `lewati_pemanasan` | `koreksi_diterima` | `koreksi_ditolak`), `detik` (tiap 250 ms, dikirim hook), `kalibrasi_selesai`, `pemanasan_selesai`.

Perintah keluar: `klip(id)`, `teks(id)`, `pose(p)`, `layar(mode)`, `makanan(tahap)`, `catatGigitan(g)`, `baselineBoleh(bool)`, `selesai(alasan)`.

| Status | Masuk ketika | Layar | Pose karakter | Klip / teks | Keluar ke |
|---|---|---|---|---|---|
| `KALIBRASI` | Sesi dimulai | Terang | `netral` | `sapa_awal` | `PEMANASAN` setelah ±3 detik |
| `PEMANASAN` | Kalibrasi selesai | Terang | Urutan tetap | `kenalan_makanan`, `ajak_makan_bareng` | `GILIRAN_KARAKTER` saat selesai atau dilewati |
| `GILIRAN_KARAKTER` | Awal tiap putaran | Terang | `menggigit` lalu `enak` (tahap 1) | `karakter_enak` lalu `giliranmu`. Tahap 1: `mbak_gigit_duluan` tiap putaran ke-3. Tahap 2–3: selalu `mbak_gigit_duluan`, tanpa pose `menggigit` | `MENUNGGU_SUAP` setelah 3–5 detik |
| `MENUNGGU_SUAP` | Giliran anak | Terang | `menunggu`, mulut meniru `mulut` anak | 60 detik tanpa Suap → teks `tawarkan_suapan_kecil` | `MENILAI` saat Suap ditekan |
| `MENILAI` | Suap ditekan | Terang | `menunggu`, meniru | — | `DITERIMA` / `MENOLAK` / `TIDAK_PASTI` (aturan F-18) |
| `DITERIMA` | Syarat diterima terpenuhi | Terang | `merayakan` (setelah mulut anak tertutup) | `hore` atau `tos_mbak`; catat `diterima` | `JEDA_KUNYAH` setelah 2 detik |
| `JEDA_KUNYAH` | Setelah perayaan | Redup (hitam 60%, transisi 400 ms) | `mengunyah`, mulut mengikuti `rahang` | `masih_ngunyah` (tidak diulang dalam 20 detik) | `GILIRAN_KARAKTER` saat kunyah selesai, timer 15 detik, atau Lanjut; `KEMUNGKINAN_NGEMUT` bila rahang hampir diam dan mulut tertutup > 15 detik |
| `KEMUNGKINAN_NGEMUT` | Dugaan ngemut | Redup | `santai` | Teks `ngemut` (tanya) | Ya: catat `ngemut`, teks `saran_ngemut` (isi `aturan.ngemut_hint`), lalu `GILIRAN_KARAKTER`. Tidak: `GILIRAN_KARAKTER` |
| `MENOLAK` | Penolakan terbaca | Terang | `santai` saja | `nanti_lagi` + teks `jangan_dibujuk`; catat `ditolak`. **Tidak pernah** `hore` atau `merayakan` | `GILIRAN_KARAKTER` setelah 60 detik, atau Suap |
| `TIDAK_PASTI` | Jendela habis tanpa hasil jelas | Terang | `netral`, diam menunggu | Teks `tadi_masuk` (tanya) | Ya: catat `diterima` (`dikoreksi: true`), perayaan singkat, `JEDA_KUNYAH`. Tidak: catat `ditolak` (`dikoreksi: true`), `GILIRAN_KARAKTER`. Tidak dijawab 10 detik: tidak dicatat, `GILIRAN_KARAKTER` |
| `TIDAK_TERLIHAT` | `terlihat = false` > 1,5 detik di luar `MENILAI` | Tetap | `menunggu` | Teks `wajah_tidak_terlihat` | Status sebelumnya saat terlihat lagi. Timer sesi tetap jalan |
| `SELESAI` | Batas waktu, batas menolak, Stop, Darurat | — | — | `waktunya_selesai` atau teks `akhiri_tidak_apa` | Hasil sesi disusun |

**Aturan lintas status:**

- Suap bisa ditekan dari status loop mana pun dan langsung masuk `MENILAI`.
- Suap saat kunyah masih aktif → teks `masih_ngunyah_tunggu`, tidak menilai.
- Mulut terbuka di luar jendela penilaian dan di luar buffer 3 detik sebelum Suap (tertawa, bicara) tidak dihitung.
- Klip yang sama tidak diminta lagi dalam 20 detik. Teks yang sama tidak diminta lagi dalam 60 detik, kecuali teks `tanya`.
- Pengasuh selalu bisa mengoreksi suapan terakhir (`koreksi_diterima` | `koreksi_ditolak`) → `dikoreksi: true`.

**Aturan global, dicek setiap kejadian `detik`:**

| Kondisi | Hasil |
|---|---|
| Waktu sesi ≥ `aturan.max_minutes` | `SELESAI`, `alasan_selesai = waktu_habis`, klip `waktunya_selesai` |
| Tidak ada suapan diterima selama `aturan.end_after_refusal_minutes` | `SELESAI`, `alasan_selesai = terlalu_lama_menolak`, teks `akhiri_tidak_apa` |
| Tombol Stop | `SELESAI`, `alasan_selesai = stop` |
| Tombol Darurat | `SELESAI`, `alasan_selesai = stop_darurat`, instruksi darurat tampil |

### F-18 Penilaian suapan (`MENILAI`)

Hasil suapan ditentukan oleh mulut terbuka lalu tertutup dan arah kepala, **bukan** oleh kunyahan.

| Hasil | Syarat |
|---|---|
| **Diterima** | Ada rentang `mulut > ambang.terbuka (0,3)` selama ≥ `minBukaDetik (0,3)` yang **berakhir** (mulut turun di bawah ambang) di dalam jendela; lama buka ≤ `batasBukaDetik (4)`; `nangis` tidak aktif selama rentang itu; tidak ada menolak oleh yaw. Rentang yang dimulai di buffer 3 detik sebelum Suap tetap sah |
| **Menolak** | `yaw < −yawMenolakDerajat (25°)` selama ≥ `yawMenolakDetik (1)`, **atau** jendela habis tanpa mulut pernah terbuka dan tanpa siklus rahang |
| **Tidak pasti** | Jendela habis tanpa syarat diterima atau menolak (misalnya buka terlalu lama atau nilai ngawur saat sendok masuk) |

- Jendela: `jendelaDetik (6)` sejak Suap + buffer `bufferSebelumSuapDetik (3)` sebelum Suap. Bila mulut masih terbuka saat jendela habis, diperpanjang sampai mulut tertutup, maksimal `jendelaMaksDetik (12)`.
- Tidak ada deteksi oklusi khusus. Sendok dan tangan bisa membuat nilai ngawur; yang dicari adalah transisi buka ke tutup, dengan koreksi pengasuh sebagai pengaman.
- Perayaan dikirim setelah mulut tertutup, supaya menangis atau berteriak "nggak mau" tidak dirayakan.
- `ambang.hasilDariKamera = false`: `MENILAI` langsung menampilkan teks `tadi_masuk` dan menunggu Ya/Tidak.

### F-19 Penghitung kunyahan

Fungsi murni `langkahKunyah(keadaan, sinyal, getarDiam, ambang) → { keadaan, aktif, selesai }`:

```text
getar_diam   = simpangan baku rahang_halus di jendela baseline (10 detik tanpa suapan & tanpa kunyah aktif)
ambangSiklus = max(kunyahKaliGetar (3) × getar_diam, kunyahMinimal (0,01))

setiap frame:
  arah = naik dan rahang mulai turun          → puncak = rahang, arah = turun
  arah = turun dan rahang mulai naik:
      bila puncak − rahang ≥ ambangSiklus     → catat waktu siklus
      arah = naik

aktif   = ≥ 3 siklus dalam 3 detik terakhir, jarak antar siklus 0,4–1,25 detik (0,8–2,5 Hz)
selesai = pernah aktif dan tidak ada siklus selama 4 detik
```

Kunyahan hanya dipakai untuk animasi karakter, akhir jeda kunyah, dan dugaan ngemut. Kamera tidak bisa membedakan ngemut dari sudah menelan; sistem hanya memberi tanda "kemungkinan", pengasuh yang mengonfirmasi.

### F-20 Karakter meniru

- Meniru hanya aktif di `MENUNGGU_SUAP`, `MENILAI`, `DITERIMA`, `JEDA_KUNYAH`.
- `mulutKarakter`:
  - `MENUNGGU_SUAP`, `MENILAI`, `DITERIMA`: `= sinyal.mulut`.
  - `JEDA_KUNYAH`: `= clamp((rahang − min) / (maks − min), 0, 1)` dari jendela 3 detik.
  - Status lain: dari pose (`netral` 0, `menggigit` 0,8).
- Spesifikasi gambar, lapisan, mulut SVG, kedip, dan urutan menggigit ada di UI/UX Guidelines bagian 11.
- **Kriteria terima:** dengan `?sumber=slider`, menggeser slider mulut menggerakkan mulut karakter tanpa jeda yang terasa; dengan `?sumber=rekaman:contoh`, karakter meniru buka-tutup dan mengunyah.

### F-21 Suara

- Semua klip MP3 sesi dimuat di awal (`fetch` + `decodeAudioData`, cadangan elemen `<audio>`), disimpan service worker.
- Satu klip berjalan dalam satu waktu. Klip baru menunggu. Antrean maksimal 2, klip terlama dibuang.
- Klip yang sama tidak diulang dalam 20 detik. Setiap klip punya 1–3 variasi (`<id>.mp3`, `<id>__2.mp3`), dipilih acak.
- Klip yang menyebut pengasuh dipilih sesuai sapaan (MVP: `mbak`).
- Tahap 3: layar hitam, suara tetap jalan. `saklarTahap.suara = false` → tidak diputar.
- Volume semua klip disamakan (`ffmpeg -af loudnorm=I=-16:TP=-1.5`). Total ukuran ≤ 3 MB.
- Semua klip berstatus **draf** sampai ditinjau dokter anak atau ahli gizi, dan ditulis begitu di README.

**Daftar klip minimum (boleh ditambah, tidak boleh dihapus setelah I0):**

| Id | Kapan | Kalimat draf |
|---|---|---|
| `sapa_awal` | Kalibrasi | "Halo! Lihat aku dulu ya!" |
| `kenalan_makanan` | Pemanasan | "Ini brokoli. Wanginya segar!" |
| `ajak_makan_bareng` | Akhir pemanasan | "Nanti kita makan bareng ya!" |
| `karakter_enak` | Giliran karakter | "Hmm, enak!" |
| `giliranmu` | Masuk menunggu suap | "Sekarang giliranmu!" |
| `mbak_gigit_duluan` | Tahap 2–3, atau tiap putaran ke-3 di tahap 1 | "Mbak, gigit duluan ya, biar dia lihat!" |
| `hore` | Diterima | "Hore, hebat!" |
| `tos_mbak` | Diterima, variasi | "Tos dulu sama Mbak!" |
| `masih_ngunyah` | Jeda kunyah | "Kita tunggu ya, masih ngunyah." |
| `nanti_lagi` | Menolak, datar | "Nanti lagi ya." |
| `waktunya_selesai` | Waktu habis | "Waktunya selesai. Terima kasih sudah makan bareng!" |
| `penutup` | Selesai | "Kamu dapat stiker!" |

### F-22 Teks untuk pengasuh

- Tampil di strip bawah layar sesi, 15–16 px, tanpa suara.
- Hilang sendiri setelah 8 detik, kecuali teks `tanya` (tetap sampai dijawab atau 10 detik habis untuk `tadi_masuk`).
- Teks yang sama tidak muncul lagi dalam 60 detik.

| Id | Tanya | Isi |
|---|---|---|
| `jangan_dibujuk` | tidak | "Jangan dibujuk. Tawarkan lagi sebentar lagi." |
| `tadi_masuk` | ya | "Tadi masuk? Ya / Tidak" |
| `ngemut` | ya | "Sepertinya ngemut? Ya / Tidak" |
| `masih_ngunyah_tunggu` | tidak | "Masih ngunyah, tunggu." |
| `tawarkan_suapan_kecil` | tidak | "Tawarkan suapan kecil." |
| `akhiri_tidak_apa` | tidak | "Sudah lama menolak. Akhiri makan, tidak apa-apa." |
| `waktu_habis` | tidak | "Waktu habis. Akhiri dengan senang." |
| `wajah_tidak_terlihat` | tidak | "Wajah tidak terlihat. Geser HP atau tambah cahaya." |
| `saran_ngemut` | tidak | Isi dari `aturan.ngemut_hint` |

### F-23 Tombol pengasuh di layar makan

| Tombol | Selalu ada | Fungsi |
|---|---|---|
| **Suap** | Ya, di sisi pengasuh, ≥ 96 px | `tekan("suap")` |
| **Lanjut** | Ya, kecil | Akhiri jeda kunyah |
| **Stop** | Ya, kecil | Konfirmasi singkat → `SELESAI`. Di dalam konfirmasi ada tombol **Darurat** |
| **Koreksi** | Setelah ada suapan tercatat | "Tadi diterima" / "Tadi ditolak" untuk suapan terakhir |
| **Ya / Tidak** | Saat teks `tanya` | Jawaban `tadi_masuk` atau `ngemut` |
| **Lewati** | Saat pemanasan | Lewati pemanasan |

**Darurat:** menampilkan "Jika anak tersedak dan tidak bisa bernapas, segera minta bantuan medis atau hubungi 119." lalu `tekan("darurat")`.

### F-24 Program lepas layar (saklar tahap)

`saklarTahap(stage)` dibaca engine dan layar:

| Tahap | `layar` | `karakterMenggigit` | `ajakPengasuhGigit` | `suara` | Yang terlihat |
|---|---|---|---|---|---|
| 1 | `nyala` | Ya | `kadang` (tiap putaran ke-3) | Ya | Loop penuh |
| 2 | `giliran_saja` | Tidak | `selalu` | Ya | Karakter hanya muncul saat giliran; pengasuh yang diajak menggigit duluan |
| 3 | `hitam` | Tidak | `selalu` | Ya | Layar hitam penuh. Hanya strip teks dan tombol Suap (opasitas rendah). Kamera tetap membaca |
| 4 | `catat_saja` | — | — | Tidak | Tidak ada sesi. Pengasuh menjalankan ritual sendiri lalu mengisi catatan |

- Browser tidak bisa mematikan layar atau mengatur kecerahan. Tahap 3 memakai layar hitam penuh (paling hemat di layar OLED). Jangan klaim "layar mati".
- Sejak tahap 1, karakter memakai kalimat dan gerakan yang sama dan mengajak pengasuh menirukannya, supaya ritualnya bisa dipindah ke pengasuh di tahap 4.

### F-25 Simpan sesi, naik tahap, paparan

- Saat `SELESAI`, hook menyusun `SesiSelesai` (bagian 11.4). Layar memanggil `POST /api/sessions`. Hook tidak memanggil API.
- Galat simpan: data disimpan di `sessionStorage` dan tombol "Coba simpan lagi" tampil sampai berhasil.
- Server, dalam satu transaksi: simpan `sessions` (dengan jumlah diterima/ditolak/ngemut), `bites`, perbarui paparan.
- **Paparan:** bila `makanan_baru` dan ≥ 1 diterima → `food_exposures.jumlah += 1` (upsert per anak + makanan). Target 10. Setelah 10, makanan pindah ke "sudah kenal" (produksi).
- **Naik tahap** (fungsi murni `cekNaikTahap`): ambil `N = advance_rule.sessions` sesi terakhir di tahap sekarang. Bila jumlahnya N dan semuanya punya `diterima ≥ min_accepted_bites` → siap naik.
  - Jalur mandiri: `children.stage += 1` (maks 4) dan tulis versi aturan baru dengan `stage` baru.
  - Jalur klinik: hanya ditandai `siap_naik_tahap` di dashboard. Dokter yang menaikkan.
- **Saran turun:** 3 sesi terakhir di tahap ≥ 2 semuanya `diterima = 0` → `saran_turun_tahap = true`. Jalur klinik: ditampilkan ke dokter.
- Respons: `session_id`, `naik_tahap`, `tahap_baru`, `saran_turun_tahap`, `paparan`.

---

## 9. Kebutuhan fungsional: dashboard klinik dan laporan bagikan

### F-26 Masuk dokter `/klinik/masuk`

- Form email + kata sandi. Tombol nonaktif saat mengirim. 401 → pesan di bawah form, **sama** untuk email tidak terdaftar dan sandi salah. Teks kecil "Akun demo lomba".
- Server: `bcrypt.compare`. Email tidak ada tetap menjalankan `bcrypt.compare` dengan hash palsu supaya waktunya sama.
- Cookie `tm_dokter` (isi doctor_id), 30 hari. Tombol Keluar di kepala halaman (`POST /api/clinic/logout`).
- Mendukung `?kembali=<path>` supaya kembali ke `/r/:token` setelah login.

### F-27 Daftar pasien `/klinik/pasien`

- Tabel (laptop) / kartu (HP): panggilan, usia, tahap, sesi 7 hari, diterima/ditolak 7 hari, label "Siap naik tahap" atau "Saran turun tahap", sumber aturan (`default` | `dokter`).
- Klik baris → detail.
- Kosong: "Belum ada pasien. Buka link laporan yang dibagikan keluarga, lalu tekan Jadikan pasien saya."
- Server: agregat 7 hari dengan satu kueri `GROUP BY child_id` (tanpa N+1).

### F-28 Detail pasien dan resep AI `/klinik/pasien/:id`

Bagian paling penting untuk penilaian Technology Innovation.

1. **Kepala:** panggilan, usia, tahap, label siap naik/turun.
2. **Resep:**
   - Textarea dengan petunjuk "Tulis aturan makan seperti biasa Anda menulis di catatan". Maksimal 1000 karakter, penghitung karakter tampil.
   - Tombol **Ubah jadi aturan** → `POST /api/rules/parse`.
   - Hasil tampil berdampingan: teks asli di kiri, kolom aturan di kanan sebagai isian yang bisa diubah dokter, sudah terisi nilai dari LLM.
   - Kolom bermasalah diberi garis jagung + alasannya (misalnya "60 menit di luar rentang aman 10–30" atau "Tidak disebut, isi manual atau pakai nilai sekarang").
   - `tidak_dipetakan` tampil sebagai "Bagian ini tidak dipakai sistem: …".
   - Label "Diubah oleh AI, periksa sebelum konfirmasi" + sumber (`ai` | `cache` | `gagal`).
   - Tombol **Konfirmasi** aktif hanya bila semua kolom lolos `AturanSchema` di klien.
   - Tombol **Isi manual** membuka form yang sama tanpa LLM.
   - `sumber = gagal` → "AI tidak tersedia, isi manual" dan form manual terbuka.
3. **Naik tahap:** saat siap naik, tombol "Naikkan ke tahap X" mengirim `rules/confirm` dengan `stage + 1` dan kolom lain sama.
4. **Riwayat aturan:** daftar versi (tanggal, sumber, teks asli). Versi lama tidak pernah dihapus.
5. **Progres:** tabel sesi 28 hari (tanggal, jam, menu, diterima, ditolak, ngemut, durasi, alasan selesai). Grafik batang hanya bila sempat setelah I3.
6. **Paparan makanan baru** dan jumlah ngemut yang dikonfirmasi.
7. **Ringkasan dokter minggu ini** dengan label AI + tombol "Buat ringkasan".
8. Kejujuran data: catatan kecil "Yang diukur adalah perilaku menerima suapan, bukan jumlah makanan. Porsi dari catatan pengasuh."

**Kriteria terima:** teks bebas → tabel → konfirmasi → sesi keluarga berikutnya memakai `max_minutes` atau tahap baru.

### F-29 Laporan bagikan `/r/:token`

- Baca-saja: panggilan, usia, tahap, tabel sesi 14 hari, ringkasan versi dokter (label AI). Tanpa kode akses, tanpa nama pengasuh.
- Dokter sudah login dan anak belum pasiennya → tombol **Jadikan pasien saya** → `POST /api/clinic/claim/:token` → `/klinik/pasien/:id`.
- Belum login → tombol "Masuk sebagai dokter" ke `/klinik/masuk?kembali=/r/<token>`.
- Anak sudah pasien klinik lain → 409 "Anak ini sudah menjadi pasien klinik lain".
- Klaim oleh klinik yang sama: idempoten (200).
- Setelah klaim: `children.clinic_id` terisi, `plan = klinik`. Aturan default tetap dipakai sampai dokter mengonfirmasi resep.
- Token salah → "Link tidak berlaku".

---

## 10. Kebutuhan fungsional: alat demo dan pengembangan

### F-30 Sumber sinyal palsu

- Antarmuka `SumberSinyal = { mulai(onSinyal), berhenti() }` dengan tiga implementasi: `sumberKamera`, `sumberSlider`, `sumberRekaman(url)`.
- Slider: `mulut`, `rahang`, `yaw` + checkbox `nangis`, `terlihat`, 20 fps. Tombol cepat "Buka-tutup" (0→0,6→0 dalam 1,5 detik) dan "Kunyah 5 detik" (sinus 1,5 Hz).
- Rekam dan unduh `RekamanSinyal` JSON dari `/dev/kamera`; putar ulang sesuai `t`.
- Dipilih lewat `?sumber=kamera|slider|rekaman:<nama>` di `/sesi`.
- Rekaman contoh `bersama/kontrak/contoh/rekaman-sinyal.json`: 30 detik, 20 fps (600 baris), 3 siklus mulut 0→0,6 (0,5 s) tahan 0,8 s turun ke 0, masing-masing diikuti 5 detik rahang 1,5 Hz amplitudo 0,04; satu bagian yaw −35° selama 2 detik; `terlihat = false` 2 detik di tengah.

### F-31 Panel ambang `/dev/ambang`

- Satu input angka per kunci `AMBANG_AWAL` (bagian 11.6) + sakelar `hasilDariKamera`, `kunyahDariKamera`. Simpan ke `localStorage` kunci `tm_ambang_v1` (dibungkus try/catch). Tombol "Kembalikan awal".
- Pratinjau kamera kecil + angka live: `mulut`, `rahang`, `yaw`, `nangis`, fps.
- Tombol **Reset data demo** (dengan konfirmasi) → `POST /api/demo/reset`.
- Tombol masuk demo `keluarga_dika` / `dokter_demo` → `POST /api/demo/masuk` (cookie lama dihapus dulu).
- Status `GET /api/sehat`: DB, kunci OpenAI ada (boolean, tidak pernah menampilkan nilai kunci), mode demo.
- Dibuka dari landing (ketuk logo 5× dalam 3 detik) atau URL langsung.
- **Kriteria terima:** mengubah `batasBukaDetik` langsung mengubah hasil sesi tanpa build ulang (dites dengan rekaman "buka lama"); reset mengembalikan data Dika.

### F-32 Mode demo dan reset

- Hanya aktif bila env `DEMO=1`. Selain itu endpoint demo membalas 404.
- Reset menghapus **semua** anak beserta turunannya, lalu menjalankan fungsi seed yang sama dengan `npm run db:seed`. `llm_cache` tidak dihapus.
- Seed idempoten: menjalankan dua kali menghasilkan jumlah baris yang sama.
- Seed berisi: klinik "Klinik Tumbuh Kembang Contoh", dr. Demo; Dika (4 th 2 bln, `mbak`, "Mbak Rini", `trial` sisa 3 hari, tahap 1, aturan default, skrining aman, 14 hari sesi 1–2 per hari jam 07.00/12.00/18.00, menu brokoli/nasi/umum, diterima 3–9, ditolak 0–5, sesi malam sengaja lebih banyak ditolak supaya ringkasan AI punya pola, paparan brokoli 4, beberapa ngemut, catatan porsi/mood, satu ringkasan AI minggu lalu); Nara (untuk tes akses); satu pasien milik "dr. Lain"; cache LLM untuk kalimat resep demo.

### F-33 Halaman dev lain

| Rute | Isi |
|---|---|
| `/dev/kamera` | Pratinjau, fps nyata, angka sinyal, tombol Suap pencatat waktu, log per percobaan gerbang, tombol Rekam/Unduh |
| `/dev/sinyal` | Slider sumber palsu |
| `/dev/sesi` | Satu sesi penuh dengan tampilan angka (status, pose, mulut), `?tahap=` |
| `/dev/gaya` | Semua komponen dan lapisan karakter |

---

## 11. Model data

### 11.1 Tabel (Drizzle `sqliteTable`, id teks UUID dari `crypto.randomUUID()`, waktu ISO string)

| Tabel | Kolom | Catatan |
|---|---|---|
| `clinics` | id, nama | — |
| `doctors` | id, clinic_id, nama, email (unik), sandi_hash | bcrypt cost 10 |
| `children` | id, clinic_id (null = mandiri), panggilan, tanggal_lahir, kode_akses_hash (unik), sapaan, nama_pengasuh, plan (`trial`\|`expired`\|`program`\|`lanjutan`\|`klinik`), trial_until, stage (1–4), data_contoh (bool), dibuat | Kode akses hanya sebagai hash SHA-256 |
| `screenings` | id, child_id, jawaban_json, ada_tanda_bahaya, tanggal | — |
| `rules` | id, child_id, source (`default`\|`dokter`), source_text, rules_json, stage, confirmed_at, doctor_id | Versi baru ditambah, lama tidak dihapus. Aturan aktif = `confirmed_at` terbaru |
| `sessions` | id, child_id, stage, menu, makanan_baru, mulai, selesai, durasi_detik, alasan_selesai, diterima, ditolak, ngemut | Jumlah disimpan supaya kueri dashboard ringan |
| `bites` | id, session_id, detik, hasil (`diterima`\|`ditolak`\|`ngemut`), dikoreksi | — |
| `session_notes` | session_id (PK), porsi, mood | — |
| `food_exposures` | id, child_id, makanan, jumlah, terakhir | Unik (child_id, makanan) |
| `weekly_summaries` | id, child_id, minggu (ISO week, zona Asia/Jakarta), keluarga, dokter, sumber, model, dibuat | Unik (child_id, minggu) |
| `shared_reports` | token (PK), child_id, dibuat | Produksi: + kedaluwarsa, dicabut |
| `llm_cache` | kunci (PK, sha256 jenis + input), jenis, hasil_json, dibuat | Tidak dihapus saat reset |

Indeks: `sessions(child_id, mulai)`, `bites(session_id)`, `rules(child_id, confirmed_at)`.

**Tidak ada tabel atau kolom untuk video, gambar, atau landmark.**

Produksi pindah ke Postgres (Supabase): skema diganti `pgTable`, kode lain tetap karena memakai Drizzle. Hindari fitur khusus SQLite.

### 11.2 Konten bersama (`bersama/konten/`)

- `makanan.ts`: `MAKANAN = [{ id: "brokoli", nama: "Brokoli", gambar: ["/aset/makanan/brokoli_0.webp", "/aset/makanan/brokoli_1.webp", "/aset/makanan/brokoli_2.webp"] }, { id: "umum", ... }]`.
- `klip.ts`: `IdKlip = z.enum([...])`, `KLIP: Record<IdKlip, { kalimat; variasi[]; sapaan? }>`.
- `teks.ts`: `IdTeks = z.enum([...])`, `TEKS: Record<IdTeks, { isi; tanya }>`.

### 11.3 Kontrak sinyal (`bersama/kontrak/sinyal.ts`)

```ts
export const SinyalSchema = z.object({
  t: z.number(),            // ms, performance.now()
  mulut: z.number(),        // 0..1, jawOpen dikurangi baseline, dihaluskan
  rahang: z.number(),       // jarak dagu-hidung / tinggi wajah, dikurangi baseline, dihaluskan
  yaw: z.number(),          // derajat; positif = menoleh KE sisi pengasuh, negatif = menjauh
  nangis: z.boolean(),      // dugaan dari eyeSquint + browDown, belum tervalidasi
  terlihat: z.boolean(),    // wajah anak ditemukan dan titik mulut stabil
});
export const RekamanSinyalSchema = z.object({
  versi: z.literal(1), fps: z.number(), catatan: z.string(),
  sinyal: z.array(SinyalSchema),
});
```

### 11.4 Kontrak sesi (`bersama/kontrak/sesi.ts`)

```ts
export const StatusSesi = z.enum([
  "KALIBRASI","PEMANASAN","GILIRAN_KARAKTER","MENUNGGU_SUAP","MENILAI",
  "DITERIMA","JEDA_KUNYAH","KEMUNGKINAN_NGEMUT","MENOLAK","TIDAK_PASTI",
  "TIDAK_TERLIHAT","SELESAI",
]);
export const Pose = z.enum(["netral","menunggu","menggigit","enak","merayakan","santai","mengunyah"]);
export const ModeLayar = z.enum(["terang","redup","hitam"]);
export const HasilGigitan = z.enum(["diterima","ditolak","ngemut"]);
export const GigitanSchema = z.object({
  detik: z.number().min(0), hasil: HasilGigitan, dikoreksi: z.boolean(),
});
export const TampilanSesiSchema = z.object({
  status: StatusSesi, pose: Pose,
  mulutKarakter: z.number().min(0).max(1),
  layar: ModeLayar,
  makananTahap: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  teks: z.object({ id: IdTeks, tanya: z.boolean() }).nullable(),
  klip: z.object({ id: IdKlip, nonce: z.number() }).nullable(), // nonce naik = putar klip baru
  gigitan: z.array(GigitanSchema),
  detikBerjalan: z.number(),
  tahap: z.number().int().min(1).max(4),
});
export const AlasanSelesai = z.enum(["waktu_habis","terlalu_lama_menolak","stop","stop_darurat"]);
export const SesiSelesaiSchema = z.object({
  child_id: z.string(), menu: z.string(), makanan_baru: z.boolean(),
  mulai: z.string().datetime(), selesai: z.string().datetime(),
  durasi_detik: z.number().int().min(0),
  tahap: z.number().int().min(1).max(4),
  alasan_selesai: AlasanSelesai,
  gigitan: z.array(GigitanSchema),
}).strict();   // tidak bisa diselipi landmark atau gambar
```

### 11.5 Kontrak aturan (`bersama/kontrak/aturan.ts`)

```ts
export const AturanSchema = z.object({
  max_minutes: z.number().int().min(10).max(30),
  stage: z.number().int().min(1).max(4),
  advance_rule: z.object({
    sessions: z.number().int().min(1).max(7),
    min_accepted_bites: z.number().int().min(1).max(15),
  }),
  end_after_refusal_minutes: z.number().int().min(5).max(15),
  ngemut_hint: z.string().max(100),
});
export const ATURAN_DEFAULT = {
  max_minutes: 30, stage: 1,
  advance_rule: { sessions: 5, min_accepted_bites: 5 },
  end_after_refusal_minutes: 15,
  ngemut_hint: "Tunggu sebentar, tawarkan minum sedikit, jangan dipaksa menelan",
};
```

Program default mengikuti aturan makan IDAI yang ditulis dari ingatan (maksimal 30 menit, tanpa distraksi, tanpa paksaan, makanan tidak dijadikan hadiah, tawarkan ulang netral, akhiri setelah 10–15 menit menolak). Wajib dicek ke dokumen IDAI asli dan ditinjau dokter penasihat. Naik tahap memakai 5 sesi, karena belum ada bukti seberapa cepat bantuan layar boleh dikurangi.

### 11.6 Ambang (`src/mesin/ambang.ts`)

| Kunci | Awal | Arti |
|---|---|---|
| `terbuka` | 0,3 | Ambang `mulut` dianggap terbuka |
| `minBukaDetik` | 0,3 | Lama buka minimal untuk suapan |
| `batasBukaDetik` | 4 | Lama buka maksimal. Final = persentil 90 lama buka saat uji sendok + 1 detik, dibulatkan 0,5 |
| `jendelaDetik` | 6 | Jendela penilaian sejak Suap |
| `jendelaMaksDetik` | 12 | Batas perpanjangan jendela |
| `bufferSebelumSuapDetik` | 3 | Sinyal sebelum Suap yang ikut dibaca |
| `yawMenolakDerajat` | 25 | Sudut menoleh menjauh |
| `yawMenolakDetik` | 1 | Lama menoleh menjauh |
| `nangis` | 0,5 | Ambang rata-rata blendshape mata/alis |
| `kunyahKaliGetar` | 3 | Kelipatan getar diam untuk satu siklus |
| `kunyahMinimal` | 0,01 | Batas bawah ambang siklus |
| `timerJedaDetik` | 15 | Akhir jeda kunyah bila kunyah tidak terbaca |
| `ngemutDetik` | 15 | Mulut tertutup + rahang diam untuk dugaan ngemut |
| `menolakTungguDetik` | 60 | Lama di `MENOLAK` sebelum putaran baru |
| `tidakPastiTungguDetik` | 10 | Waktu tunggu jawaban `tadi_masuk` |
| `tidakTerlihatDetik` | 1,5 | Batas wajah hilang |
| `fpsMaks` | 20 | Batas frame deteksi |
| `hasilDariKamera` | true | false = hasil suapan dari tombol pengasuh |
| `kunyahDariKamera` | true | false = jeda kunyah dari timer/Lanjut saja |

Tidak ada angka ambang yang ditulis langsung di `src/mesin/sesi.ts`.

---

## 12. API

Semua endpoint didefinisikan sekali di `bersama/kontrak/api.ts` (metode, path, akses, skema request, skema response). Layar hanya memanggil lewat `panggil()`. Endpoint baru wajib masuk tabel ini dulu, dan setiap endpoint harus dipakai minimal satu halaman.

Kode galat: 400 validasi, 401 belum masuk, 403 sesi terkunci, 404 tidak ada atau bukan milikmu (dipakai juga untuk data orang lain supaya keberadaannya tidak bocor), 409 konflik klaim. Body galat: `{ galat: string }` dalam bahasa Indonesia, siap ditampilkan.

### 12.1 Keluarga

| Endpoint | Akses | Request | Response |
|---|---|---|---|
| `POST /api/children` | publik | `panggilan`, `tanggal_lahir`, `sapaan`, `nama_pengasuh` | `child_id`, `kode_akses` (sekali) + cookie `tm_keluarga` |
| `POST /api/masuk` | publik | `kode_akses` | 204 + cookie; 401 |
| `GET /api/saya` | keluarga | — | `child` (id, panggilan, usia_bulan, sapaan, nama_pengasuh, plan, trial_until, stage), `sesi_dibuka`, `alasan_terkunci` |
| `POST /api/screenings` | keluarga | `jawaban: boolean[7]` | `ada_tanda_bahaya` |
| `GET /api/children/:id/rules` | keluarga (anak sendiri) | — | `aturan`, `source`, `confirmed_at` |
| `POST /api/sessions` | keluarga | `SesiSelesaiSchema` | `session_id`, `naik_tahap`, `tahap_baru`, `saran_turun_tahap`, `paparan` \| null. 403 bila sesi terkunci |
| `POST /api/sessions/:id/notes` | keluarga | `porsi`, `mood` | 204 |
| `GET /api/children/:id/report` | keluarga | — | `tahap`, `stiker_minggu_ini` (7 bool), `paparan[]`, `sesi[]` 14 hari, `ringkasan_keluarga` \| null, `plan`, `trial_sisa_hari` |
| `POST /api/summaries/:childId` | keluarga atau dokter pasiennya | `minggu` opsional, `?ulang=1` | `keluarga`, `dokter`, `sumber` (`ai`\|`cache`\|`template`) |
| `POST /api/reports/share` | keluarga | — | `token`, `url` |
| `POST /api/plan/activate` | keluarga | `paket: "program_30"` | `plan: "program"` |

### 12.2 Klinik dan laporan bagikan

| Endpoint | Akses | Request | Response |
|---|---|---|---|
| `GET /api/r/:token` | token | — | `child` (panggilan, usia_bulan), `tahap`, `sesi[]` 14 hari, `ringkasan_dokter` \| null, `sudah_pasien_klinik`, `pasien_saya` |
| `POST /api/clinic/login` | publik | `email`, `kata_sandi` | 204 + cookie `tm_dokter`; 401 pesan sama |
| `POST /api/clinic/logout` | dokter | — | 204 |
| `POST /api/clinic/claim/:token` | dokter | — | `child_id`; 409 bila pasien klinik lain |
| `GET /api/clinic/patients` | dokter | — | `pasien[]` (id, panggilan, usia_bulan, tahap, sesi_7_hari, diterima_7_hari, ditolak_7_hari, siap_naik_tahap, saran_turun_tahap, source_aturan) |
| `GET /api/clinic/patients/:id` | dokter (pasiennya) | — | `child`, `aturan_aktif`, `riwayat_aturan[]`, `sesi[]` 28 hari, `ngemut_dikonfirmasi`, `paparan[]`, `siap_naik_tahap`, `ringkasan_dokter` \| null |
| `POST /api/rules/parse` | dokter | `teks` (≤ 1000) | `aturan` (parsial), `kolom_bermasalah[]` (kolom + alasan), `tidak_dipetakan[]`, `sumber` (`ai`\|`cache`\|`gagal`) |
| `POST /api/rules/confirm` | dokter (pasiennya) | `child_id`, `aturan` (penuh), `source_text` | `rule_id`; `children.stage = aturan.stage` |

### 12.3 Demo dan kesehatan

| Endpoint | Akses | Request | Response |
|---|---|---|---|
| `POST /api/demo/masuk` | demo (`DEMO=1`) | `sebagai: "keluarga_dika" \| "dokter_demo"` | 204 + cookie baru (semua cookie lama dihapus dulu) |
| `POST /api/demo/reset` | demo | — | `ok`, jumlah baris |
| `GET /api/sehat` | publik | — | `db`, `openai_key` (bool), `demo` (bool) |

### 12.4 Akses dan sesi login

- `kode_akses`: 12 karakter dari `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (tanpa 0/O/1/I), dibuat dengan `crypto.getRandomValues`, disimpan sebagai SHA-256 hex.
- Cookie bertanda tangan HMAC dengan `SESI_RAHASIA`: `tm_keluarga` (child_id, 180 hari) dan `tm_dokter` (doctor_id, 30 hari). `httpOnly`, `sameSite=Lax`, `secure` hanya di produksi, `path=/`.
- Middleware `denganAkses(akses)`: `publik` lewat; `keluarga` → `c.var.childId` atau 401; `dokter` → `c.var.doctor` atau 401; `demo` → 404 bila `DEMO !== "1"`.
- Handler keluarga selalu membandingkan `:id` dengan `child_id` di cookie. Handler dokter selalu mencocokkan `children.clinic_id` dengan `doctor.clinic_id`. Tidak cocok → 404.
- Token bagikan: 32 byte acak base64url (43 karakter). Bukan ID berurutan.

### 12.5 Environment variable (`.env.example`, tanpa nilai)

`DATABASE_URL`, `TURSO_AUTH_TOKEN`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `SESI_RAHASIA`, `DEMO`, `DEMO_DOKTER_SANDI`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `VITE_PAKAI_CONTOH`.

`VITE_PAKAI_CONTOH=1` membuat `panggil()` membalas dari `bersama/kontrak/contoh/<nama>.json` setelah jeda 300 ms, supaya layar bisa dibangun sebelum server siap.

---

## 13. Spesifikasi AI

### 13.1 Peta AI

| Fungsi | Teknologi | Jalan di | Peran |
|---|---|---|---|
| Baca wajah, rahang, arah kepala | MediaPipe `FaceLandmarker` | Browser | Inti interaksi live |
| Resep bahasa bebas → aturan JSON | OpenAI `gpt-6-luna`, structured output | Server | Dokter cukup menulis kalimat biasa, lalu mengonfirmasi |
| Ringkasan mingguan dengan pola | OpenAI `gpt-6-luna`, structured output | Server | Menunjukkan pola yang tidak bisa dibuat template |
| Suara karakter | ElevenLabs | Hanya saat pengembangan | Klip MP3 tersimpan |

Arahan live (teks pengasuh, reaksi karakter) memakai aturan tetap, bukan LLM.

### 13.2 Resep → aturan (`POST /api/rules/parse`)

- **Klien:** `new OpenAI({ apiKey, timeout: 8000, maxRetries: 0 })`. Tanpa kunci → `null`.
- **Skema keluaran LLM** (semua nullable, karena dokter mungkin tidak menyebut semuanya):

```ts
const KeluaranResep = z.object({
  max_minutes: z.number().int().nullable(),
  stage: z.number().int().nullable(),
  advance_sessions: z.number().int().nullable(),
  advance_min_accepted_bites: z.number().int().nullable(),
  end_after_refusal_minutes: z.number().int().nullable(),
  ngemut_hint: z.string().nullable(),
  tidak_dipetakan: z.array(z.string()),   // bagian teks yang tidak punya kolom
});
```

- **Panggilan:** `client.responses.parse({ model: env.OPENAI_MODEL, input: [system INSTRUKSI, user teks], text: { format: zodTextFormat(KeluaranResep, "resep") } })`. Bila `zodTextFormat` bermasalah dengan Zod 4, pakai JSON Schema manual dengan `strict: true`.
- **Instruksi sistem (bahasa Indonesia), isinya wajib:**
  - Hanya memetakan kalimat dokter ke kolom yang tersedia.
  - Kolom yang tidak disebut diisi `null`. Jangan menebak.
  - Jangan menambah saran medis, menu, atau dosis.
  - Satuan waktu menit.
  - Contoh: "naik tahap kalau 3 sesi berturut-turut minimal 5 suap" → `advance_sessions: 3, advance_min_accepted_bites: 5`.
  - `ngemut_hint` hanya bila dokter menyebut apa yang dilakukan saat anak mengemut.
- **Sebelum dikirim:** nama panggilan anak di teks diganti "anak".
- **Validasi per kolom** terhadap rentang `AturanSchema`:

| Kolom | Rentang aman |
|---|---|
| `max_minutes` | 10–30 |
| `end_after_refusal_minutes` | 5–15 |
| `stage` | 1–4 |
| `advance_rule.sessions` | 1–7 |
| `advance_rule.min_accepted_bites` | 1–15 |
| `ngemut_hint` | ≤ 100 karakter, hanya tampil ke pengasuh |

  Kolom di luar rentang dikosongkan dan masuk `kolom_bermasalah` dengan alasan. Kolom `null` masuk `kolom_bermasalah` dengan alasan "tidak disebut, isi manual atau pakai nilai sekarang".
- **Cache:** kunci `sha256("resep:" + teks.trim().toLowerCase())`. Sukses → simpan. Gagal/timeout/tanpa kunci → cari cache (`sumber: cache`). Tidak ada → `sumber: gagal`, semua kolom bermasalah, form manual.
- **Konfirmasi wajib.** Aturan hasil LLM tidak pernah berlaku sebelum dokter menekan Konfirmasi dan `AturanSchema.parse` penuh lolos di server.
- **Kalimat demo** (cache diisi di seed): "Maksimal 20 menit, akhiri kalau 10 menit menolak, kalau ngemut tawarkan air sedikit, naik tahap kalau 3 sesi berturut-turut minimal 5 suapan masuk, mulai tahap 1."

Contoh hasil yang benar:

```json
{
  "max_minutes": 20,
  "stage": 1,
  "advance_rule": { "sessions": 3, "min_accepted_bites": 5 },
  "end_after_refusal_minutes": 10,
  "ngemut_hint": "Tawarkan air sedikit"
}
```

### 13.3 Ringkasan mingguan (`POST /api/summaries/:childId`)

- **Data masuk** (ISO week, Asia/Jakarta, tanpa nama, pakai "anak"): jumlah sesi, rata durasi, diterima, ditolak, ngemut dikonfirmasi, tahap, siap naik, paparan, mood, dan **per sesi**: jam mulai, menu, diterima, ditolak, ngemut.

```json
{
  "minggu": "2026-W46", "sesi": 9, "rata_durasi_menit": 18,
  "gigitan_diterima": 54, "gigitan_ditolak": 12, "ngemut_dikonfirmasi": 3,
  "tahap": 1, "siap_naik_tahap": true, "paparan_baru": { "brokoli": 4 },
  "per_sesi": [{ "jam": "18:05", "menu": "nasi", "diterima": 3, "ditolak": 5, "ngemut": 1 }]
}
```

- **Skema keluaran:** `{ keluarga: string (≤ 400 karakter), dokter: string (≤ 500 karakter), pola: string[] (1–2) }`.
- **Instruksi:** tunjukkan 1–2 pola yang benar-benar terlihat dari data per sesi (misalnya penolakan lebih tinggi di sesi malam, ngemut sering saat nasi) dan sebut angkanya. Versi keluarga menyemangati tanpa istilah medis. Versi dokter ringkas dan faktual. Dilarang diagnosis, saran menu, dosis, atau menyalahkan pengasuh.
- **Validasi:** mengandung kata `diagnosis`, `gangguan`, `penyakit`, `harus`, `gagal`, atau `salah` → pakai template. Setiap angka di `pola` harus muncul di data masuk.
- **Simpan** di `weekly_summaries` (upsert per anak + minggu). Endpoint membalas dari tabel bila sudah ada, kecuali `?ulang=1`.
- **Cadangan:** cache LLM → template berisi angka yang sama ("Minggu ini ada 9 sesi, 54 suapan diterima…"), `sumber: template`.
- **Label:** setiap ringkasan diberi "Dibuat oleh AI dari data sesi". Ringkasan template diberi label "Ringkasan otomatis dari data sesi".

### 13.4 Biaya LLM (kurs Rp 16.500/$, harga dari catatan, cek ulang di dashboard OpenAI)

- `gpt-6-luna`: $0,10 input / $0,50 output per 1 juta token.
- Satu panggilan ±2.000 token masuk + 400 keluar ≈ $0,0004.
- Per pengguna per bulan (1 ubah aturan + 4 ringkasan) ≈ Rp 30.
- Selama lomba ≈ $0,2.

---

## 14. Kebutuhan non-fungsional

| ID | Kebutuhan | Target | Cara cek |
|---|---|---|---|
| NF-01 | Frame rate deteksi | ≥ 15 fps di laptop final; produksi HP murah boleh turun ke 10 fps | fps nyata di panel ambang |
| NF-02 | Latensi mulut karakter | Mulut karakter berubah di frame yang sama dengan sinyal; tidak ada `setState` 20×/detik di level halaman | Slider di `/dev/sesi` |
| NF-03 | Offline | Sesi lengkap, stiker, catatan jalan tanpa internet. Service worker menyimpan kode, model, WASM, gambar, klip | DevTools Offline setelah satu kunjungan |
| NF-04 | Cache model PWA | `maximumFileSizeToCacheInBytes: 15 × 1024 × 1024`, `globPatterns` memuat `**/*.{js,css,html,webp,svg,mp3,task,wasm,json}`, `navigateFallbackDenylist: [/^\/api\//]`, API tidak di-cache | Cache Storage berisi `face_landmarker.task` |
| NF-05 | Tanpa sumber luar saat sesi | Tidak ada request ke luar `localhost` | DevTools Network |
| NF-06 | Ukuran aset | Lapisan karakter ≤ 150 KB WebP, total klip ≤ 3 MB, model ±3,6 MB | Ukuran file |
| NF-07 | Layar tetap nyala | Wake Lock selama sesi, dipasang ulang saat `visibilitychange` | Sesi 5 menit di HP |
| NF-08 | Audio | Klip pertama bunyi tanpa ketukan tambahan | Chrome Android |
| NF-09 | Responsif | Semua layar benar di 390 px dan 1280 px, `scrollWidth === innerWidth` | Screenshot di `docs/layar/` |
| NF-10 | Aksesibilitas | Kontras teks ≥ 4,5:1, target sentuh ≥ 48 px, Suap ≥ 96 px, `prefers-reduced-motion` dihormati | UI/UX Guidelines bagian 15 |
| NF-11 | Keamanan | Kunci API hanya di server, cookie bertanda tangan, 404 untuk data orang lain, bcrypt, token 32 byte | Tes K1, K2 |
| NF-12 | Kompatibilitas server | Kode server sama untuk Node dan Vercel; tidak menulis file selain DB | `vercel dev` dengan Turso |
| NF-13 | Kontrak | Semua request dan response tervalidasi Zod di klien dan server | Tes kontrak |
| NF-14 | Tanpa warna merah | `grep -rn "red-" src` kosong | CI |
| NF-15 | Browser | Chrome/Edge desktop terbaru (final), Chrome Android. iOS Safari belum dites, dan kamera di PWA standalone iOS bisa berbeda | Tes manual |
| NF-16 | Kamera di HP | Hanya lewat `localhost`, `adb reverse tcp:5173 tcp:5173`, atau HTTPS. `http://192.168.x.x` tidak didukung | Tes Android |

---

## 15. Privasi, etika, regulasi

### 15.1 Privasi

- Video diproses di perangkat, tidak disimpan, tidak dikirim. `grep -rn "toDataURL\|toBlob\|MediaRecorder" src` harus kosong.
- `SesiSelesaiSchema` `.strict()`: payload dengan kolom tambahan (misalnya `landmark`) ditolak 400.
- Data anak minimum: panggilan (bukan nama lengkap), tanggal lahir, sapaan, nama pengasuh, angka sesi.
- LLM hanya menerima angka dan teks aturan, tanpa nama anak, tanpa gambar.
- Laporan bagikan tidak memuat kode akses atau nama pengasuh.
- Hanya klinik terkait yang melihat data pasiennya.
- Kunci API hanya di `.env.local` dan environment variable Vercel. Repo publik.
- Produksi: tombol hapus data, izin orang tua eksplisit, token bagikan kedaluwarsa dan bisa dicabut.

### 15.2 Pengaman klinis dan perilaku

- Skrining tanda bahaya wajib di jalur mandiri.
- Tidak ada target menghabiskan makanan. Stiker diberikan karena mau mencoba.
- Karakter tidak pernah membujuk atau memaksa. Respons menolak sengaja datar, karena perhatian setelah menolak bisa menjadi hadiah dan membuat penolakan makin sering.
- Layar redup saat jeda, dikurangi per tahap.
- Hadiah berupa stiker, bukan makanan atau tontonan.
- Tombol Darurat memberi instruksi mencari bantuan medis.
- Saran turun tahap bila anak menolak terus di tahap baru.

### 15.3 Regulasi (belum diverifikasi, teks asli belum dibaca)

- KMK 951/2026 dilaporkan mencakup software dan AI alat kesehatan, termasuk analisis sinyal. Membaca rahang dari kamera bisa dianggap analisis sinyal.
- PP 33/2026 berlaku 16 Januari 2027 dan mengatur data anak.
- Posisi produk: program kebiasaan makan dan prototipe, bukan terapi medis.
- Jangan klaim patuh UU PDP, ramah lingkungan, menyembuhkan GTM, atau "pertama di Indonesia" tanpa bukti.

### 15.4 Klaim yang wajib ditulis di README dan video

- "Deteksi diuji pada orang dewasa, belum diuji pada balita."
- "Klip suara berstatus draf, belum ditinjau dokter anak atau ahli gizi."
- "Daftar skrining adalah draf."
- Deklarasi AI: Claude Code (alat bantu menulis kode), OpenAI gpt-6-luna, MediaPipe, ElevenLabs.
- Atribusi "Voice by ElevenLabs".
- Pihak ketiga: model `face_landmarker.task` (Apache 2.0) dan sumbernya.

---

## 16. Pengujian, gerbang, dan definisi selesai

### 16.1 Tes otomatis (Vitest)

| Yang dites | Kasus minimum |
|---|---|
| Penghitung kunyahan | Sinus 1,5 Hz amplitudo 0,04 di atas derau 0,003 → aktif ≤ 3 detik; derau saja → tidak aktif; sinus 0,3 Hz (angguk lambat) → tidak aktif; berhenti 4 detik → selesai |
| Penilaian suapan | Buka-tutup setelah Suap → diterima; mulut terbuka 1 detik sebelum Suap lalu tutup → diterima; buka 6 detik → tidak pasti; buka + nangis → bukan diterima; yaw −35° 1,2 detik → menolak; yaw +35° → bukan menolak; tertawa 5 detik sebelum Suap → tidak dihitung |
| State machine | Menolak tidak pernah memicu `hore`/`merayakan`; waktu habis → selesai; 15 menit tanpa diterima → selesai; Suap saat kunyah aktif → tidak menilai; `hasilDariKamera=false` → teks `tadi_masuk`; rekaman gerbang menghasilkan jumlah yang tercatat |
| Saklar tahap | Per tahap; `?tahap=3` → layar selalu `hitam` |
| Naik tahap | 5 sesi × 5 diterima → naik; 4 sesi → tidak; satu sesi 4 diterima → tidak; tahap 4 tidak naik; jalur klinik tidak menaikkan |
| Resep LLM | LLM tiruan valid → lengkap; `max_minutes: 60` → bermasalah, tidak tersimpan; timeout → cache atau gagal; tanpa kunci → cache kalimat demo |
| Ringkasan | LLM tiruan dengan pola sesi malam → lolos; tanpa kunci → template; kata terlarang → template |
| Akses | Tanpa cookie → 401 di semua endpoint non-publik; cookie Nara ke data Dika → 404; dokter lain → 404; cookie diubah satu karakter → 401 |
| Kontrak | Setiap entri `api.ts` terdaftar di app Hono; semua contoh lolos skema; `fetch(` hanya di `src/lib/panggil.ts` dan `src/suara/` |
| Seed | Dua kali → jumlah baris sama; reset menghapus anak latihan dan mengembalikan Dika |

### 16.2 Gerbang go/no-go (paling lambat 11 Nov 12.00)

3 anggota tim × 10 percobaan per uji, di laptop final:

| Uji | Lolos jika |
|---|---|
| Mulut terbuka setelah Suap | ≥ 9/10 terdeteksi |
| Sama, dengan sendok berisi makanan asli, disuapi dari samping | ≥ 8/10 diterima |
| Mulut sudah terbuka saat Suap, atau "aaa" 3 detik lalu tutup | ≥ 8/10 diterima |
| Dua wajah di kamera | Wajah anak tetap terpilih 9/10 |
| Menoleh menjauh | ≥ 9/10 terdeteksi |
| Menoleh ke arah pengasuh | ≥ 9/10 tidak terbaca menolak |
| Frame rate | ≥ 15 fps |
| Kunyah bibir tertutup, makanan asli | ≥ 7/10 terdeteksi |
| Angguk tanpa mengunyah | ≥ 9/10 tidak memicu siklus |
| Mulut terbuka lama (pura-pura menangis) | ≥ 9/10 tidak terbaca diterima |

Catat lama mulut terbuka setiap suapan (min, median, persentil 90). Simpan minimal 3 rekaman per uji di `uji/mesin/data/` untuk tes regresi. Keputusan (lolos semua / cadangan kunyah / cadangan hasil kamera) ditulis di `docs/gerbang.md`.

### 16.3 Uji akurasi (13 Nov)

Minimal 10 sesi pendek orang dewasa dengan izin, 5–8 suapan per sesi dengan sendok dan makanan asli, campur menolak dan "aaa" lama. Label manual per suapan. Skrip `uji/mesin/akurasi.ts` memutar ulang rekaman ke engine dan mencetak precision, recall, F1 untuk "diterima" dan "menolak". Hasil ditulis apa adanya dengan klaim populasi. Jangan memakai video anak dari internet. Tes balita hanya dengan izin tertulis orang tua.

### 16.4 Jebakan yang wajib punya bukti (K1–K19)

| # | Jebakan | Bukti lolos |
|---|---|---|
| K1 | Endpoint tanpa cek cookie | Semua endpoint non-publik tanpa cookie → 401 |
| K2 | Keluarga A membuka data keluarga B | Cookie Nara ke data Dika → 404 |
| K3 | Layar memanggil endpoint yang tidak ada | Semua entri `api.ts` terdaftar; `fetch(` hanya di `panggil.ts` |
| K4 | Bentuk sinyal berubah diam-diam | Rekaman contoh lolos `SinyalSchema` |
| K5 | Video/landmark terkirim | Payload `landmark` → 400; tidak ada `toDataURL`/`toBlob`/`MediaRecorder` |
| K6 | Vercel Hobby tidak men-deploy commit kolaborator | Deploy lewat GitHub Actions dengan token A |
| K7 | Kamera gagal lewat IP LAN | Uji lewat localhost, `adb reverse`, atau HTTPS |
| K8 | Audio diblokir | `bukaAudio()` di tombol Mulai makan |
| K9 | Layar HP mati | Wake Lock + pasang ulang |
| K10 | Ambang ditulis mati di kode | Tidak ada angka ambang di `src/mesin/sesi.ts` |
| K11 | Penolakan dihibur | Tes: `MENOLAK` tanpa `hore`/`merayakan` |
| K12 | LLM mengisi di luar rentang | `max_minutes: 60` → bermasalah |
| K13 | Internet final buruk | Tanpa kunci → cache/template |
| K14 | Data demo rusak | Seed idempoten + reset |
| K15 | Gagal di Vercel karena menulis file | Uji `vercel dev` dengan Turso |
| K16 | Commit saling timpa | Kepemilikan folder, `git shortlog -sne` |
| K17 | Wajah pengasuh terpilih | Uji gerbang dua wajah 9/10 |
| K18 | Video dan README ditunda | Kerangka README di I0, naskah video sebelum I2 |
| K19 | Model tidak masuk cache PWA | Batas Workbox 15 MB, `face_landmarker.task` di Cache Storage |

### 16.5 Definisi selesai per titik integrasi

- `npm run periksa` (`tsc -b --noEmit && eslint . && vitest run && vite build`) hijau sebelum push.
- Setiap layar dicek di 390 px dan 1280 px, tanpa galat console, screenshot di `docs/layar/<rute>.png`.
- Setiap aksi tulis dicoba di database lokal lalu dikembalikan dengan reset demo.
- Sesi diuji minimal sekali di HP Android sungguhan (kamera, suara, Wake Lock).
- Tidak menulis "selesai" untuk sesuatu yang belum dijalankan.

---

## 17. Jadwal, kepemilikan, dan rilis

### 17.1 Tonggak (WIB)

| Waktu | Tonggak | Lolos bila |
|---|---|---|
| 10 Nov, 23.00 | **I0 Kontrak** | `bersama/kontrak/` dikunci bertiga; contoh lolos skema; `npm run dev` jalan di tiga laptop; tes penjaga K1–K3 ada (boleh merah); `/dev/kamera` menampilkan `jawOpen` live |
| 11 Nov, 12.00 | **Gerbang** | `docs/gerbang.md` terisi angka asli; keputusan cadangan; keputusan aset (ilustrasi berlapis atau SVG flat) |
| 11 Nov, 23.00 | **I1 Sesi minimum** | Webcam → karakter meniru → Suap → diterima/menolak/tidak pasti → tersimpan di SQLite |
| 12 Nov, 23.00 | **I2 Inti utuh** | Alur demo 17.4 jalan ujung ke ujung di localhost, termasuk resep LLM yang mengubah sesi keluarga |
| 13 Nov, 18.00 | **I3 Bekukan fitur** | Ringkasan AI + cadangan, panel ambang + reset, PWA offline, tuning dengan sendok asli, mode demo |
| 13 Nov, 19.00–23.00 | Rekam video | Bertiga, sesuai `docs/video.md` |
| 14 Nov, 09.00–12.00 | Edit video, README final, tag `submission-logicodix` | — |
| 14 Nov, ≤ 15.00 | **Submit** repo + video | Jam resmi dicek di grup WA panitia |

Setelah submit, kode tidak boleh diubah. Penyesuaian untuk final 29 Nov hanya lewat panel ambang.

### 17.2 Kepemilikan

| Orang | Area | Folder utama |
|---|---|---|
| A Darryl | Mesin deteksi, engine sesi, panel ambang, uji akurasi, repo, README, deploy (bonus) | `src/deteksi/`, `src/mesin/`, `src/dev/`, `public/mediapipe/`, `uji/mesin/`, konfigurasi proyek, `README.md`, `docs/gerbang.md`, `docs/hasil-uji.md` |
| B Satya | Aplikasi keluarga, sistem tampilan, karakter dan mulut SVG, aset, klip, PWA, video | `src/main.tsx`, `src/app.tsx`, `src/gaya/`, `src/komponen/`, `src/karakter/`, `src/suara/`, `src/halaman/keluarga/`, `public/aset/`, `public/klip/`, `public/ikon/`, `bersama/konten/`, `docs/video.md` |
| C Adit | Server, database, akses, AI, dashboard klinik, `/r/:token`, demo dan reset | `server/`, `api/`, `drizzle/`, `src/lib/panggil.ts`, `src/halaman/klinik/`, `src/halaman/r/`, `src/komponen/klinik/`, `uji/server/`, `scripts/reset-demo.ts` |
| Bersama | Kontrak | `bersama/kontrak/` (diubah hanya bila ketiganya setuju) |

### 17.3 Syarat lomba yang mengikat

| Syarat | Pemenuhan |
|---|---|
| Source code di GitHub | Repo publik milik A, commit dari laptop masing-masing dengan email GitHub sendiri, waktu asli, tidak di-squash |
| Video demo 3–5 menit tanpa suara presentasi | Teks di layar; boleh tidaknya suara aplikasi ditanyakan ke panitia. Pemeran "anak" anggota tim dewasa |
| Menampilkan fitur AI | FaceLandmarker live, resep LLM, ringkasan AI |
| Kode tidak diubah setelah deadline | Freeze 14 Nov, panel ambang untuk penyesuaian |
| Jalan di localhost saat final | SQLite lokal, aset dan klip lokal, cache LLM |
| Penyisihan | Dinilai dari repo + video. Tidak ada syarat deploy, proposal, atau deck |
| Final 29 Nov | 15 menit: 1 setup, 7 presentasi + live demo, 3 Q&A, 4 penilaian |

### 17.4 Alur demo (dasar video dan final)

| # | Adegan | Durasi |
|---|---|---|
| 1 | Cerita Dika (label ilustrasi) + data GTM | 30 dtk |
| 2 | Keluarga mandiri daftar: profil, skrining, lolos | 30 dtk |
| 3 | Pemanasan: karakter berkenalan dengan brokoli | 30 dtk |
| 4 | Juri jadi anak: karakter menggigit, juri buka mulut dan mengunyah, karakter meniru lalu merayakan | 75 dtk |
| 5 | Juri menutup mulut dan menoleh menjauhi sisi pengasuh: respons datar, teks pengasuh muncul | 40 dtk |
| 6 | Anggota tim jadi pengasuh, diajak menggigit duluan | 20 dtk |
| 7 | Bagikan ke dokter → Jadikan pasien saya → aturan bebas → JSON → konfirmasi → aplikasi keluarga berubah | 60 dtk |
| 8 | Lepas layar (tahap 3 layar hitam), model bisnis hibrida, privasi | 45 dtk |

Cadangan demo: data contoh, klip lokal, ringkasan cache, sumber sinyal palsu, video rekaman, lampu kecil, panel ambang.

### 17.5 Model bisnis (untuk konteks keputusan produk)

| Produk | Harga (estimasi, belum diuji) |
|---|---|
| Keluarga, coba | Gratis 5 hari |
| Program 30 Hari | Rp 49.000 sekali bayar |
| Lanjutan | Rp 19.000–29.000 per bulan |
| Klinik | Rp 299.000 per bulan untuk 20 pasien aktif |
| Pasien tambahan | Rp 10.000–15.000 per pasien per bulan |
| Paket keluarga dari klinik | Rp 75.000–150.000 per 4 minggu, klinik ambil margin |

Biaya tetap awal Rp 0 (paket gratis). Biaya variabel ±Rp 30 per pengguna per bulan. Naik ke Pro (±Rp 742.000–825.000 per bulan) hanya setelah ada pemasukan.

---

## 18. Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Deteksi pada balita kurang akurat | Fungsi inti gagal | Gerbang dini, koreksi pengasuh, cadangan tombol, klaim terbatas |
| Kritik "layar saat makan" | Dianggap kontra-narasi | Pemanasan di luar makan, redup saat jeda, lepas layar, pengasuh jadi contoh |
| Karakter interaktif belum terbukti | Juri mempertanyakan bukti | Bahan aktif terbukti, rencana pilot |
| Anak tergantung karakter | Sama seperti YouTube | Syarat naik tahap, ritual dipindah ke pengasuh |
| Anak yang terbiasa YouTube bosan dengan karakter datar | Kasus terberat gagal | Pemanasan paling menarik; disebut hipotesis pilot |
| Jalur mandiri tanpa dokter | Kasus berat terlewat | Skrining wajib, posisi program kebiasaan |
| Ambang tidak cocok di ruangan final, kode beku | Demo gagal | Panel ambang, reset, lampu kecil |
| Fitur AI dianggap gimmick | Nilai Technology Innovation turun | Resep dari kalimat dokter apa adanya, ringkasan yang menunjukkan pola, form manual |
| Aset karakter memakan waktu | Jadwal molor | 1 karakter, mulut SVG parametrik, keputusan SVG flat 11 Nov 12.00 |
| Penyisihan dinilai dari video | Tidak lolos walau aplikasi lengkap | Video 13 Nov malam, prioritas cerita dan bukti |
| Internet final buruk | Demo macet | Inti offline, cache LLM |
| Lisensi free tier | Tidak boleh dipakai jualan | ElevenLabs Starter sebelum jualan; Vercel Hobby non-komersial |
| Regulasi SaMD | Pivot pasca-lomba | Baca KMK 951/2026, posisi prototipe |
| Mirip Talkly | Dipertanyakan juri | Kode baru, kasus berbeda, tanya panitia |

---

## 19. Pertanyaan terbuka dan validasi

| # | Pertanyaan | Kapan harus terjawab | Penanggung jawab |
|---|---|---|---|
| 1 | Tanda yaw: menoleh ke kanan kamera positif atau negatif di FaceLandmarker? | Gerbang | A |
| 2 | Definisi "kiri/kanan anak" di layar persiapan (lihat UI/UX Guidelines 10.7) | I0 | A + B |
| 3 | `batas_buka_detik` final dari data uji sendok | Gerbang | A |
| 4 | Apakah angguk memicu siklus palsu (perlu koordinat lokal wajah)? | Gerbang | A |
| 5 | Ilustrasi berlapis atau SVG flat | 11 Nov 12.00 | B |
| 6 | Nama model aktif OpenAI, kompatibilitas `zodTextFormat` dengan Zod 4 | Sebelum C2.3 | C |
| 7 | Nama model ElevenLabs | Sebelum B1.4 | B |
| 8 | Pola entry Hono di Vercel | Sebelum A4.1 | A + C |
| 9 | Boleh tidaknya suara aplikasi di video; status Talkly | Sebelum rekam | Tim, ke panitia |
| 10 | Validasi dokter anak: karakter + lepas layar bisa diterima? Skrining? Default naik tahap 5 sesi? | Sebelum pitch final | Tim |
| 11 | Cek Play Store dan App Store: "anak susah makan", "GTM", "picky eater", "mpasi" | Sebelum klaim pembeda | Tim |
| 12 | Aturan makan IDAI asli, KMK 951/2026, PP 33/2026 | Sebelum pitch final | Tim |
| 13 | Ketersediaan nama Suapin (Play Store, PDKI, domain) | Setelah lomba | Tim |

---

## 20. Glosarium

| Istilah | Arti |
|---|---|
| GTM | Gerakan tutup mulut, anak menolak makan |
| PWA | Website yang bisa di-install seperti aplikasi dan jalan offline |
| FaceLandmarker | Model MediaPipe yang membaca titik wajah dan blendshape di browser |
| `jawOpen` | Blendshape 0–1, seberapa lebar mulut terbuka |
| Baseline bergulir | Nilai normal yang terus diperbarui dari 10 detik terakhir (persentil 20) |
| State machine | Daftar status dan perpindahannya; engine sesi ditulis sebagai fungsi murni |
| Jendela penilaian | Waktu setelah Suap (6–12 detik) plus buffer 3 detik sebelumnya |
| Ngemut | Makanan ditahan di mulut tanpa dikunyah atau ditelan |
| Paparan berulang | Menawarkan makanan yang sama berkali-kali sampai diterima (target 8–10) |
| Lepas layar | Mengurangi bantuan layar bertahap (tahap 1–4) |
| Structured output | Fitur LLM yang memaksa jawaban berbentuk JSON sesuai skema |
| Token bagikan | Kode acak 32 byte di link laporan |
| Wake Lock | API browser yang mencegah layar mati |
| Sumber sinyal palsu | Slider atau rekaman JSON yang menggantikan kamera |
| Panel ambang | Halaman `/dev/ambang` untuk menyetel angka deteksi saat aplikasi jalan |
