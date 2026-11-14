# Suapin

PWA untuk balita 3–5 tahun yang sulit makan (gerakan tutup mulut, GTM). Anak dan karakter di layar bergiliran menggigit. Kamera membaca mulut anak langsung di browser, karakter meniru gerak mulutnya, lalu merayakan saat suapan diterima. Program mengurangi peran layar dalam empat tahap sampai anak makan tanpa aplikasi.

Tim BOOMERANG · LOGICODIX Hackathon 2026 · Cabang Web App, subtema Inclusive Health & Well-being.

- Aplikasi daring: https://suapin.vercel.app (akun demo bisa dipakai dengan sekali klik di halaman Masuk)
- Repositori: https://github.com/darryll08/Suapin
- Dokumen produk, PRD, dan panduan UI/UX: [`docs/produk/`](docs/produk/)

## Ringkasan

Di rumah, cara paling umum menyuapi balita yang menolak makan adalah sambil menonton video. Anak memang membuka mulut, tetapi matanya ke layar dan makan bisa sampai satu jam. Tanpa layar, anak menutup mulut dan menoleh dari sendok. Dokter biasanya meminta makan tanpa layar, tetapi keluarga tidak punya pengganti.

Suapin memakai layar untuk hal sebaliknya: makan bergiliran, bukan tontonan. Karakter menggigit duluan, lalu giliran anak. Saat anak menerima suapan, karakter merayakan. Saat anak menolak, karakter diam dan datar, supaya penolakan tidak menjadi hadiah. Setelah cukup sesi dengan banyak suapan diterima, program naik tahap: karakter makin jarang tampil, layar menjadi hitam, sampai pengasuh memimpin sendiri dan aplikasi hanya mencatat.

Keluarga bisa memakai program bawaan sendiri, atau membagikan laporan ke dokter anak. Dokter menulis aturan makan dengan kalimat biasa, AI mengubahnya menjadi aturan sesi dalam rentang aman, dan sesi keluarga berikutnya ikut berubah setelah dokter mengonfirmasi.

Suapin tidak mendiagnosis, tidak memberi menu atau dosis, dan tidak menggantikan dokter.

## Fitur

**Keluarga (HP atau laptop)**
- Daftar tanpa kata sandi: profil anak, sapaan pengasuh (Mbak, Bu, Oma, Ayah), lalu skrining tanda bahaya. Bila ada tanda bahaya, aplikasi tetap bisa dipakai, tetapi menampilkan pengingat untuk konsultasi ke dokter.
- Persiapan makan: pilih teman makan (6 karakter), menu dari 30 makanan, dan sisi duduk pengasuh.
- Pemanasan ±25 detik: karakter mengenalkan makanan hari ini dengan kalimat yang berganti tiap sesi (warna, bentuk, bau, bunyi), menggigit duluan, lalu memanggil nama anak.
- Sesi makan: tombol Suap besar di sisi pengasuh. Karakter meniru mulut anak secara langsung, merayakan suapan yang diterima, menunggu saat anak masih mengunyah, dan bertanya "Tadi masuk?" bila tidak yakin. Pengasuh bisa mengoreksi hasil suapan terakhir, menjeda sesi, atau mengakhiri sesi kapan saja.
- Bila kamera tidak bisa dipakai, sesi tetap jalan: pengasuh menjawab "Tadi masuk?" setelah setiap Suap.
- Beranda: tahap program, tracker menuju tahap berikutnya, suapan diterima per hari minggu ini, dan stiker harian.
- Laporan 14 hari, perjalanan tahap, ringkasan mingguan buatan AI, dan tautan laporan untuk dokter.

**Dokter (web)**
- Daftar anak yang dipegang, jadwal kontrol, dan penanda siap naik tahap atau saran turun tahap.
- Kartu pasien: grafik suapan 14 hari, perjalanan tahap, ringkasan AI, dan riwayat sesi.
- Resep dengan kalimat biasa, misalnya "maksimal 20 menit, tawarkan minum kalau ngemut". AI mengubahnya menjadi aturan sesi, dokter memeriksa, lalu mengonfirmasi.
- "Jadikan pasien saya" dari tautan laporan yang dibagikan keluarga.

**Klinik dan admin**
- Klinik melihat ringkasan semua dokter dan pasiennya.
- Admin (operator Suapin) mendaftarkan klinik dan akun dokter setelah ada kerja sama.

**Program lepas layar**

| Tahap | Layar | Naik ke tahap berikutnya |
|---|---|---|
| 1 · Karakter memandu | Karakter ikut makan bergiliran | ≥ 8 sesi, lalu 3 sesi berturut-turut dengan ≥ 70% suapan diterima |
| 2 · Pengasuh jadi contoh | Karakter hanya muncul saat giliran | ≥ 5 sesi + 3 sesi berturut-turut ≥ 70% |
| 3 · Layar hitam | Layar gelap, hanya suara | ≥ 5 sesi + 3 sesi berturut-turut ≥ 70% |
| 4 · Tanpa layar | Pengasuh memimpin, aplikasi hanya mencatat | Tahap akhir |

Sesi dengan kurang dari 5 suapan ditawarkan belum dihitung. Di jalur mandiri tahap naik otomatis, di jalur klinik dokter yang menaikkan. Dokter bisa mengatur syaratnya (persen 50–90, jumlah sesi, panjang deret). Angka 70% adalah asumsi desain yang perlu divalidasi saat pilot.

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
   DEMO_DOKTER_SANDI=<kata sandi akun demo, maksimal 72 byte>
   ```

   `OPENAI_API_KEY` boleh kosong: resep dan ringkasan AI memakai cache atau template. `OPENAI_MODEL` bawaannya `gpt-6-luna`.

4. Siapkan database lokal `local.db`, lalu jalankan aplikasi.

   ```bash
   npm run db:migrasi
   npm run db:seed
   npm run dev
   ```

- Web: http://localhost:5173 · API: http://127.0.0.1:8787 (Vite mem-proxy `/api`).
- Halaman Masuk punya panel **Akun Demo** (Keluarga, Dokter, Klinik, Admin) yang masuk dengan sekali klik selama `DEMO=1`. Akun yang sama juga bisa dipakai lewat email `keluarga@demo.test`, `dokter@demo.test`, atau `klinik@demo.test` dengan sandi dari `DEMO_DOKTER_SANDI`.
- `npm run db:seed` mengisi ulang akun dan data contoh. Tombol Reset data demo di `/dev/ambang` (atau `npx tsx scripts/reset-demo.ts` dengan `DEMO=1`) menghapus data latihan dan mengembalikan seed. Reset mempertahankan cache LLM.
- Kamera hanya jalan di `localhost` atau HTTPS. Untuk HP Android: `adb reverse tcp:5173 tcp:5173`, lalu buka `localhost:5173` di HP. Alamat `http://192.168.x.x` tidak bisa membuka kamera.
- Versi daring dideploy manual dengan `npm run deploy:vercel` (Vercel region `sin1`, database Turso Singapura). Lokal dan daring memakai kode yang sama; yang beda hanya `DATABASE_URL`.

### Pratinjau layar tanpa server

Isi `VITE_PAKAI_CONTOH=1` di `.env.local`. `panggil()` membalas dari `bersama/kontrak/contoh/`, jadi layar bisa dibangun sebelum endpoint siap. Mode ini tidak menguji database, login, atau AI.

### Alat pengembang

- `/dev/kamera`: angka mentah kamera, rekam sinyal, dan pencatat percobaan untuk uji akurasi.
- `/dev/sesi`: sesi makan dengan sumber sinyal kamera, slider, atau rekaman ulang.
- `/dev/ambang`: menyetel ambang deteksi saat aplikasi jalan dan reset data demo.
- `/sesi?debug=1`: panel angka engine di layar sesi.

### Pemeriksaan

- `npm run periksa`: cek tipe, lint (oxlint), 111 tes Vitest, dan build. Wajib hijau sebelum push.
- `npx tsx uji/mesin/akurasi.ts`: memutar ulang rekaman uji ke engine dan menghitung akurasi (lihat Hasil uji akurasi).

## Teknologi

| Bagian | Pilihan |
|---|---|
| Aplikasi | Vite 8, React 19, TypeScript strict, React Router, Tailwind CSS 4, PWA (`vite-plugin-pwa`) |
| Deteksi wajah | MediaPipe `FaceLandmarker` (`@mediapipe/tasks-vision`), model dan WASM disajikan dari server sendiri |
| API | Hono di Node.js, kontrak Zod yang dipakai bersama oleh layar dan server |
| Data | Drizzle ORM + SQLite (`local.db`) di lokal, Turso (libSQL) di versi daring |
| Login | Kode akses keluarga dan sandi dokter (bcrypt), cookie bertanda tangan |
| Model bahasa | OpenAI GPT-6 Luna, structured output yang divalidasi server |
| Suara karakter | Klip MP3 yang dibuat sekali dengan ElevenLabs (`npm run klip`), cadangan `speechSynthesis` browser |
| Notifikasi | Web Push (VAPID) |
| Hosting | Vercel (region `sin1`), deploy manual |

## Arsitektur

```text
Kamera -> FaceLandmarker (browser) -> sinyal {t, mulut, rahang, yaw, pitch, terlihat}
       -> state machine sesi -> karakter + suara + teks pengasuh
       -> SesiSelesai (angka saja) -> API Hono -> SQLite (lokal) / Turso (daring)
Dokter -> API Hono -> OpenAI GPT-6 Luna -> aturan sesi (setelah dikonfirmasi dokter)
```

Video kamera tidak pernah keluar dari perangkat.

## Struktur folder

Setiap folder punya `README.md` berisi pemilik dan titik integrasi.

| Folder | Isi | Pemilik |
|---|---|---|
| `bersama/kontrak/` | Kontrak Zod: sinyal, sesi, aturan, API, data contoh | Bersama |
| `bersama/konten/` | Makanan, kalimat klip suara, teks pengasuh | B |
| `src/deteksi/` | Kamera, FaceLandmarker, pengolah sinyal | A |
| `src/mesin/` | State machine sesi, kunyah, ambang, tahap, `useSesiMakan` | A |
| `src/dev/` | `/dev/kamera`, `/dev/sinyal`, `/dev/sesi`, `/dev/ambang` | A |
| `src/gaya/`, `src/komponen/` | Token tampilan dan komponen bersama | B |
| `src/karakter/`, `src/suara/` | Karakter dan mulut SVG, pemutar klip | B |
| `src/halaman/keluarga/` | Aplikasi keluarga | B |
| `src/halaman/klinik/`, `src/halaman/admin/`, `src/halaman/r/`, `src/komponen/klinik/` | Dasbor dokter dan klinik, admin, laporan bagikan | C |
| `src/lib/` | `panggil()` (satu-satunya `fetch` ke API) dan pembantu kecil | C |
| `server/`, `drizzle/`, `scripts/` | API Hono, database, LLM, seed, deploy | C, A |
| `uji/` | Tes Vitest dan skrip akurasi | A, B, C |
| `public/mediapipe/` | Model dan WASM MediaPipe lokal | A |
| `public/aset/`, `public/klip/`, `public/ikon/` | Gambar, suara, ikon PWA | B |
| `brand/` | Logo dan palet | Bersama |
| `docs/` | Tugas, status, gerbang, hasil uji, dokumen produk | Semua |

## Fitur AI

| Fitur | Teknologi | Di mana jalan |
|---|---|---|
| Membaca mulut, rahang, dan arah kepala anak | MediaPipe `FaceLandmarker` (blendshape `jawOpen`, landmark 3D, matriks pose) | Browser, di perangkat |
| Aturan makan dari kalimat dokter | OpenAI GPT-6 Luna, structured output, divalidasi skema dan rentang aman | Server |
| Ringkasan mingguan untuk keluarga dan dokter | OpenAI GPT-6 Luna, hanya boleh memakai angka yang ada di data, cadangan cache dan template | Server |

**Cara kerja deteksi.** Setiap frame kamera diolah menjadi satu sinyal `{ mulut, rahang, yaw, pitch, terlihat }` (`src/deteksi/`). Gerak rahang diukur dari jarak 3D dagu ke hidung, sehingga tidak berubah saat kepala mengangguk atau menoleh. Patokan diam diambil dari potongan paling tenang sejak awal sesi, karena balita jarang mau diam untuk kalibrasi. Bila dua wajah masuk kamera, wajah anak dipilih saat kalibrasi lalu dilacak dari posisi dan ukurannya.

Sinyal masuk ke state machine sesi (`src/mesin/sesi.ts`), fungsi murni tanpa waktu sistem atau DOM, sehingga rekaman kamera bisa diputar ulang dengan hasil yang selalu sama:

- **Diterima:** setelah Suap, mulut terbuka selama 0,3–6,5 detik lalu menutup, dan kepala tidak menoleh menjauhi pengasuh. Mulut yang sudah terbuka hingga 3 detik sebelum Suap ikut dihitung.
- **Menolak:** kepala menoleh menjauhi sisi pengasuh lebih dari 25° selama ≥ 1 detik, atau mulut tidak pernah terbuka.
- **Tidak pasti:** pengasuh ditanya "Tadi masuk?". Sistem tidak menebak bila sinyal tidak jelas.
- **Masih mengunyah:** bila rahang masih bergerak berirama saat Suap ditekan, sistem menahan penilaian dan meminta pengasuh menunggu. Siklus rahang yang terjadi bersamaan dengan anggukan diabaikan.
- **Ngemut:** setelah suapan diterima, mulut tertutup tanpa kunyahan selama 15 detik memunculkan pertanyaan "Sepertinya ngemut?".

Semua ambang ada di satu tempat (`src/mesin/ambang.ts`) dan bisa disetel saat aplikasi jalan lewat `/dev/ambang`.

**Cara kerja resep AI.** Kalimat dokter dikirim ke GPT-6 Luna dengan skema keluaran tetap (`server/llm/resep.ts`). Server menolak kolom di luar skema dan nilai di luar rentang aman, lalu dokter meninjau dan mengonfirmasi. Aturan baru dipakai di sesi keluarga berikutnya. Tanpa kunci API, resep contoh diambil dari cache.

## Privasi dan etika

- Video kamera diproses di browser dan tidak pernah direkam atau dikirim. Model dan WASM MediaPipe disajikan dari server sendiri, tanpa CDN.
- Yang dikirim ke server hanya angka sesi: waktu, hasil tiap suapan, durasi. Skema `SesiSelesai` menolak kolom tambahan, jadi landmark atau gambar tidak bisa ikut terkirim.
- Kunci API hanya di server. Browser tidak pernah memanggil OpenAI.
- Teks buatan AI selalu diberi label. Aturan hasil AI baru berlaku setelah dokter mengonfirmasi.
- Hadiah berupa stiker karena mau mencoba, bukan karena porsi habis. Klip suara tidak memakai kata "pintar", "habis", atau "gagal".
- Akses ke data anak di luar akun keluarga atau klinik yang berwenang dijawab HTTP 404.

## Hasil uji akurasi

Deteksi diuji pada 9 perilaku yang mewakili jebakan nyata saat menyuapi: anak menoleh ke sendok, mengangguk, mengunyah dengan bibir tertutup, membuka mulut sebelum sendok datang, dua wajah di kamera, dan menangis. Setiap perilaku diperagakan 10–18 kali oleh satu orang dewasa di depan webcam laptop (±14 fps), dengan sendok dan makanan asli untuk uji sendok dan kunyah. Rekaman sinyal disimpan di `uji/mesin/data/`, lalu diputar ulang ke engine dengan `npx tsx uji/mesin/akurasi.ts`. Rincian per percobaan ada di [`docs/gerbang.md`](docs/gerbang.md) dan [`docs/hasil-uji.md`](docs/hasil-uji.md).

Hasil ini evaluasi internal pada orang dewasa yang memperagakan perilaku balita, bukan uji pada balita atau bukti manfaat klinis.

| Uji | Syarat | Hasil | Lolos |
|---|---|---|---|
| Mulut terbuka setelah Suap | ≥ 9/10 diterima | 9/10 | ya |
| Sendok + makanan, disuapi dari samping | ≥ 8/10 diterima | 10/10 | ya |
| Mulut sudah terbuka ("aaa" 3 detik) lalu tutup | ≥ 8/10 diterima | 8/11 | belum |
| Menoleh menjauh | ≥ 9/10 ditolak | 10/10 | ya |
| Menoleh ke arah pengasuh | ≥ 9/10 tidak ditolak | 10/10 | ya |
| Angguk tanpa mengunyah | ≥ 9/10 tidak terbaca kunyah | 11/11 | ya |
| Kunyah bibir tertutup, makanan asli | ≥ 7/10 terbaca kunyah | 9/10 | ya |
| Dua wajah di kamera | ≥ 9/10 wajah anak tetap terpilih | 10/10 | ya |
| Mulut terbuka lama (pura-pura menangis) | ≥ 9/10 tidak diterima | 10/18 | belum |

| Ukuran (31 suapan harus diterima, 10 harus ditolak) | Hasil |
|---|---|
| Diterima: precision / recall / F1 | 1,00 / 0,87 / 0,93 |
| Ditolak: precision / recall / F1 | 0,91 / 1,00 / 0,95 |
| Hasil "tidak pasti" (ditanyakan ke pengasuh) | 3 dari 41 |

Temuan dari pengujian yang sudah diperbaiki di kode:
- Anggukan terbaca sebagai kunyahan karena jarak dagu-hidung diukur 2D. Sekarang diukur 3D, dan siklus rahang yang terjadi bersamaan dengan perubahan sudut angguk diabaikan (4/11 menjadi 11/11).
- Mulut yang terbuka saat kepala menoleh ke sendok sering lemah terbaca dan dinilai menolak. Sekarang tidak ada vonis menolak bila kepala condong ke arah pengasuh (7/10 menjadi 10/10).
- Batas lama mulut terbuka dinaikkan dari 4 ke 6,5 detik dari sebaran lama buka uji pertama (p90 5,3 detik).
- Patokan diam yang diambil dari 10 detik terakhir ikut terisi kunyahan bila anak terus mengunyah, sehingga kunyahan tidak terbaca. Sekarang patokan diambil dari potongan paling tenang sejak awal sesi.

## Bahan persiapan

Disusun sebelum dan selama Hacking Week sebagai acuan, bukan kode produk:
- Dokumen Produk Suapin versi 3.4, PRD (fitur F-01 sampai F-33 dengan kriteria terima), dan UI/UX Guidelines, ada di [`docs/produk/`](docs/produk/).
- Kajian pustaka: program Food Dudes (peniruan teman sebaya dan hadiah untuk mencoba makanan), video modeling untuk penerimaan sayur, tinjauan USDA tentang paparan berulang 8–10 kali, dan kriteria penguasaan pada terapi makan berbasis ABA.
- Identitas visual di [`brand/`](brand/) dan prompt pembagian tugas tiga anggota.

Seluruh kode ditulis selama Hacking Week (commit pertama 10 Nov 2026, 71 commit oleh tiga anggota); riwayat commit tidak di-squash.

## Penyesuaian terhadap Challenge Brief

Tidak ada perubahan cabang atau subtema. Suapin masuk subtema Inclusive Health & Well-being lewat pendampingan kesehatan anak di rumah: keluarga mendapat cara makan yang terukur tanpa bergantung pada tontonan, dan dokter mendapat data makan dari rumah yang biasanya hanya berupa cerita. Untuk tema NextGen Digital Innovation, AI dipakai di dua tempat: penglihatan komputer di perangkat untuk merespons anak saat makan, dan model bahasa untuk mengubah resep dokter menjadi aturan sesi.

Lingkup yang ditambahkan selama Hacking Week: jalur keluarga mandiri tanpa dokter (dengan skrining tanda bahaya), halaman admin untuk mendaftarkan klinik, versi daring di Vercel, dan pilihan 6 karakter.

## AI Use Declaration

**AI di dalam produk**
- **MediaPipe FaceLandmarker**: membaca landmark wajah, `jawOpen`, dan sudut kepala di browser. Semua keputusan (diterima, menolak, kunyah) dibuat oleh aturan kode di `src/mesin/`, bukan oleh model.
- **OpenAI GPT-6 Luna**: mengubah kalimat resep dokter menjadi aturan sesi terstruktur, dan menulis ringkasan mingguan untuk keluarga dan dokter. Keluaran divalidasi kode; resep baru dipakai setelah dokter mengonfirmasi, dan ringkasan yang memuat angka di luar data ditolak lalu diganti template.
- **ElevenLabs text-to-speech**: membuat klip suara karakter sekali di muka (`npm run klip`). Aplikasi hanya memutar file MP3; tidak ada panggilan ElevenLabs saat aplikasi berjalan.

**AI sebagai alat bantu pengembangan**
- Claude Code (Anthropic) dan OpenAI Codex dipakai anggota tim sebagai asisten menulis dan meninjau kode serta dokumen. Setiap anggota meninjau, menjalankan, dan bertanggung jawab atas kode yang di-commit atas namanya. Pengujian kamera, keputusan ambang, dan keputusan desain dilakukan tim.

**AI dalam pembuatan video demo**
- Video demo disusun dengan Remotion (komposisi React) dari rekaman layar aplikasi yang berjalan sungguhan. Tidak ada layar aplikasi yang dibuat ulang dengan AI.

## Third-Party Declaration

| Layanan / pustaka | Dipakai untuk | Lisensi |
|---|---|---|
| Model `public/mediapipe/face_landmarker.task` (float16, versi 1) | Deteksi wajah | Apache 2.0 |
| `@mediapipe/tasks-vision` 1.2.2 (WASM disalin ke `public/mediapipe/wasm/`) | Runtime deteksi wajah | Apache 2.0 |
| OpenAI API (GPT-6 Luna) | Resep ke aturan, ringkasan mingguan | Ketentuan OpenAI |
| ElevenLabs text-to-speech | Klip suara karakter di `public/klip/` (Voice by ElevenLabs) | Ketentuan ElevenLabs |
| Turso (libSQL) | Database versi daring | Ketentuan Turso |
| Vercel | Hosting versi daring | Ketentuan Vercel |
| npm: `react`, `react-dom`, `react-router`, `hono`, `@hono/node-server`, `drizzle-orm`, `@libsql/client`, `zod`, `openai`, `bcryptjs`, `web-push` | Kerangka aplikasi, API, database, validasi, login, notifikasi | MIT / Apache 2.0 |
| `@fontsource-variable/fraunces`, `@fontsource-variable/plus-jakarta-sans` | Huruf, disajikan lokal | SIL OFL 1.1 |
| Alat pengembangan: `vite`, `vite-plugin-pwa`, `tailwindcss`, `typescript`, `vitest`, `oxlint`, `drizzle-kit`, `tsx`, `esbuild` | Build, tes, lint | MIT |
| Karakter, makanan, stiker (`src/karakter/`, `public/aset/`), logo, dan ikon PWA | Dibuat tim (SVG), lihat [`docs/aset.md`](docs/aset.md) | Milik tim |

Seluruh data di versi lomba adalah data contoh, bukan data anak sungguhan.

## Kontribusi anggota

### Darryl (A)

Membangun mesin deteksi dan engine sesi: kamera dan `FaceLandmarker` lokal (GPU dengan cadangan CPU), pemilihan wajah anak, pengolah sinyal dengan rahang 3D dan sudut angguk, penghitung kunyahan, state machine sesi sebagai fungsi murni, saklar tahap lepas layar, dan hook `useSesiMakan`. Menyiapkan kerangka repo (Vite, TypeScript strict, kontrak Zod sinyal dan sesi, `npm run periksa`). Membangun alat uji: sinyal palsu dan rekaman ulang, `/dev/kamera`, `/dev/ambang`, dan `uji/mesin/akurasi.ts`. Menjalankan uji akurasi 9 perilaku dengan kamera dan memperbaiki engine dari temuannya. Menambahkan aturan naik tahap berbasis persen suapan dan tracker tahap, tombol Jeda dan Selesai, pemanasan dengan kalimat makanan, deploy Vercel dan Turso, serta README. Implementasi dibantu Claude Code.

**Keputusan teknis.**
- **Hasil suapan dari mulut buka-lalu-tutup, bukan kunyahan.** Kunyahan dengan bibir tertutup sulit dibaca, sedangkan momen mulut menutup di sendok terlihat jelas.
- **Engine sebagai fungsi murni.** Semua waktu datang dari kejadian, sehingga rekaman kamera bisa diputar ulang dan hasilnya selalu sama.
- **Ambang bisa disetel tanpa kode**, karena kode beku setelah submit sedangkan cahaya ruangan saat final bisa berbeda.

### Wayan Satya (B)

Membangun aplikasi keluarga: landing, daftar dan kode akses, skrining tanda bahaya, beranda, laporan dan bagikan ke dokter, halaman program, profil, serta layar sesi makan (persiapan, pemanasan, loop giliran, catatan). Membuat sistem tampilan (token warna tanpa merah, komponen dasar), karakter SVG dengan mulut parametrik, gambar makanan dan stiker, pemutar suara dengan antrean, klip ElevenLabs, PWA, halaman Masuk gabungan dengan login email dan panel akun demo, peran klinik dan dasbor dokter, notifikasi Web Push, halaman admin, dan naskah video. Implementasi dibantu Claude Code; keputusan desain dan pengujian di browser dicek sendiri.

**Keputusan desain.**
- **Karakter SVG flat, bukan ilustrasi berlapis.** Mulut digambar dari satu angka `mulut` (0–1) dari mesin deteksi, jadi bukaannya mengikuti mulut anak tanpa gambar per frame (`src/karakter/mulut.tsx`).
- **Perayaan hanya saat suapan diterima.** Saat menolak, karakter hanya berkedip, supaya penolakan tidak menjadi hadiah. Teks untuk pengasuh kecil di strip bawah dan tidak dibacakan.
- **Tombol di sisi pengasuh.** Sisi duduk dipilih dari arah anak menghadap layar. Suap (≥ 112 px), pratinjau kamera, dan Selesai ada di sisi itu; Jeda di sudut atas supaya tidak tertekan tidak sengaja.
- **PWA.** Model MediaPipe dan WASM ikut di-cache service worker, jadi aplikasi tetap terbuka walau server tidak terjangkau. API tidak di-cache.

### Adit (C)

Membangun API Hono dan kontrak Zod, autentikasi keluarga dan dokter dengan cookie bertanda tangan, migrasi dan data demo SQLite, penyimpanan sesi, laporan bagikan dan klaim pasien, serta dasbor klinik. Mengintegrasikan OpenAI untuk resep ke aturan dan ringkasan mingguan dengan validasi server. Implementasi dibantu OpenAI Codex, termasuk penulisan tes dan verifikasi integrasi.

## Batasan dan langkah berikutnya

- Deteksi diuji pada satu orang dewasa yang memperagakan perilaku balita, belum diuji pada balita.
- Tangisan dengan mulut setengah terbuka belum bisa dibedakan dari suapan pelan lewat kamera saja (10/18). Pengasuh bisa mengoreksi hasil suapan terakhir dengan satu ketukan.
- Mulut yang sudah terbuka lama sebelum Suap kadang dinilai "tidak pasti" (8/11), terutama bila anak baru selesai mengunyah. Hasil ini ditanyakan ke pengasuh, bukan dihitung salah diam-diam.
- Kecepatan kamera di laptop uji ±14 fps, sedikit di bawah target 15 fps. HP murah belum diuji menyeluruh.
- Klip suara, daftar skrining, dan syarat naik tahap 70% berstatus draf, belum ditinjau dokter anak atau ahli gizi.
- Ringkasan dan resep diproses di server OpenAI di Amerika Serikat. Yang dikirim hanya angka sesi dan teks resep, tanpa nama lengkap atau video.
- Mode demo di versi daring sengaja terbuka untuk juri dan akan dimatikan setelah lomba.

Langkah berikutnya: pilot dengan satu klinik tumbuh kembang, persetujuan etik dan izin keluarga, uji deteksi pada balita sungguhan, dan peninjauan klip suara serta syarat naik tahap oleh dokter anak.
