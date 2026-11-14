# Suapin — Dokumen Produk

Tim BOOMERANG, Universitas Airlangga  
LOGICODIX Hackathon 2026, cabang Web App, subtema Inclusive Health & Well-being  
Versi 3.4, 10 November 2026. Status: konsep dan infrastruktur dikunci Darryl, belum dibangun. Versi 3.1 memasukkan masukan Wayan (sinyal deteksi, potongan scope, gerbang go/no-go) dan analisis celah teknis (II.19). Versi 3.2 menambal hasil review lanjutan: syarat buka-lalu-tutup, tanpa deteksi oklusi khusus, efek angguk kepala, jadwal per orang, aset paralel sejak 9 Nov, video 13 Nov malam, klaim uji hanya pada dewasa. Versi 3.3 memasukkan review ronde 3 (Wayan) dan cross-check what-if: suapan dinilai dari transisi buka ke tutup dengan buffer sebelum Suap, status tidak pasti, batas lama buka diukur dari tes, gerbang dengan sendok asli, sinyal palsu sejak 9 Nov, mulut karakter SVG parametrik, pemilihan wajah anak, panel ambang runtime untuk final, prioritas video, penguatan fitur AI, default naik tahap 5 sesi. Setelah versi ini, revisi dokumen dihentikan dan kritik dijawab dengan hasil tes. Versi 3.4 (10 November 2026) hanya mengunci keputusan infrastruktur dan hasil cek guidebook: SQLite lokal + Drizzle, versi online di Vercel + Turso, API Hono yang jalan lokal dan sebagai Vercel Functions, penyisihan dinilai dari repo + video tanpa syarat deploy. **Versi 3.5 (14 November 2026)** menyesuaikan dokumen dengan aplikasi yang sudah dibangun selama Hacking Week (repo `main`, commit `7b384a0`): lihat bagian "Pembaruan versi 3.5" di bawah. Bagian 1, 2, 10, dan 12 ditulis ulang langsung; bagian lain yang berbeda dicatat di tabel itu. Rincian teknis yang mengikat ada di PRD v1.1.

## Pembaruan versi 3.5: yang sudah dibangun (14 November 2026)

Semua kartu inti selesai dan diuji di browser, di versi daring https://suapin.vercel.app (Vercel `sin1` + Turso Singapura), dan dengan kamera laptop. Perbedaan dari rencana versi 3.4:

| Topik | Rencana 3.4 | Kondisi 14 Nov |
|---|---|---|
| Karakter | PNG berlapis, satu karakter | SVG flat dengan mulut parametrik. 6 teman makan dipilih di persiapan (Raka, Nara, Jeru, Pao, Dino, Tung). Tanpa gambar AI di aplikasi maupun landing |
| Menu | Brokoli dulu | 30 makanan, kapsul makanan bisa diketuk untuk mendengar namanya |
| Pemanasan | 2–3 menit | ±25 detik, 8 babak; kalimat kenalan makanan berganti tiap sesi |
| Login | Kode akses keluarga, email dokter | Satu halaman `/masuk` email + kata sandi untuk keluarga, dokter, klinik, admin; panel akun demo sekali klik |
| Peran | Keluarga, dokter | Ditambah **klinik** (ringkasan semua dokter dan pasien, jadwal kontrol) dan **admin** (operator Suapin mendaftarkan klinik dan dokter setelah kerja sama) |
| Skrining | Tanda bahaya menutup sesi | Tanda bahaya menjadi pengingat konsultasi ke dokter; program tetap jalan |
| Kode undangan (II.11) | Kode undangan klinik | Diganti tombol **Jadikan pasien saya** di laporan bagikan `/r/:token` |
| Hasil suapan | Buka 0,3–4 dtk | Buka 0,3–6,5 dtk; kepala condong ke pengasuh tanpa bukaan → tanya pengasuh; Suap ditahan bila anak masih mengunyah |
| Kunyahan | Jarak dagu-hidung 2D | Jarak 3D + sudut angguk (`pitch`), supaya anggukan tidak terbaca kunyah; patokan diam dari potongan paling tenang sejak awal sesi |
| Menolak | Karakter netral sebentar | Jeda datar 5 detik, lalu karakter mengambil giliran menggigit |
| Naik tahap | 5 sesi berturut-turut ≥ 5 suapan | Tahap 1 minimal 8 sesi (paparan 8–10 kali), tahap 2–3 minimal 5 sesi, lalu 3 sesi berturut-turut ≥ 70% suapan diterima dari ≥ 5 ditawarkan. Tracker tahap di beranda, laporan, kartu pasien |
| Tombol sesi | Suap + Stop | Suap di tengah bawah; Lanjut + Selesai di sisi pengasuh; Jeda (Lanjut Makan · Akhiri · Darurat 119) di pojok sisi jauh; koreksi "Tadi" |
| Navigasi | Tanpa tab bar | Menu bawah Beranda · Laporan · Profil; halaman Profil (data anak, program, notifikasi, akun) |
| Beranda | Pelacak "Brokoli 4/10" | Cincin "Hari makan x/7 minggu ini", grafik suapan per hari, stiker harian, tracker tahap; pelacak paparan tetap di catatan setelah sesi |
| Notifikasi | Tidak ada | Toast galat, pengingat (≥ 2 hari tanpa sesi, trial/program hampir habis), Web Push |
| AI | gpt-6-luna | Diuji dengan API asli: resep ±6,5 detik, ringkasan ±9 detik (timeout 20 detik); ringkasan hanya boleh memakai angka yang ada di data |
| Deploy | Bonus | Sudah daring, deploy manual (`npm run deploy:vercel`) |
| Tipografi | Font sistem | Fraunces + Plus Jakarta Sans, disajikan lokal |

**Hasil uji akurasi (satu orang dewasa, 9 perilaku, 41 suapan):** diterima precision/recall/F1 1,00/0,87/0,93; ditolak 0,91/1,00/0,95; 3 dari 41 ditanyakan ke pengasuh. Dua syarat belum lolos: mulut sudah terbuka 3 detik sebelum Suap (8/11) dan pura-pura menangis (10/18). Belum diuji pada balita. Rincian di README repo dan `docs/hasil-uji.md`.

**Jadwal di bagian 20 sudah lewat.** Submit penyisihan 14 Nov 2026 23.59 WIB (repo + video demo); final luring 29 Nov.

## Daftar isi

1. Ringkasan
2. Riwayat keputusan
3. Keputusan yang berlaku
4. Masalah dan urgensi
5. Dasar ilmiah
6. Solusi dan pembeda
7. Model bisnis hibrida
8. Struktur website
9. Alur pengguna
10. Sesi makan
11. Pesan ke pengasuh
12. Program lepas layar
13. Deteksi
14. Karakter dan aset
15. AI
16. Arsitektur dan data
17. Tools dan biaya
18. Privasi, etika, regulasi
19. Syarat lomba dan peta penilaian
20. Rencana MVP
21. Skrip demo
22. Risiko
23. Yang wajib divalidasi
24. Sumber

Bagian II — Cara kerja rinci (II.1–II.19), setelah bagian 23: siapa menjalankan apa, peran pihak, proses bisnis, status akun, onboarding, sesi makan teknis (kamera, kalibrasi, kunyahan, state machine, karakter, suara), lepas layar, makanan baru, resep AI, ringkasan AI, bagikan laporan, program default, offline, produksi aset, repo dan API, tes, contoh satu minggu, glosarium.

---

## 1. Ringkasan

Suapin adalah PWA untuk balita 3–5 tahun yang sulit makan (GTM). Sebelum makan, karakter animasi berkenalan dengan makanan hari ini. Saat makan, karakter dan anak bergiliran menggigit. Kamera membaca mulut anak langsung di browser, karakter meniru gerak mulut anak, lalu merayakan saat suapan diterima. Karakter juga mengajak pengasuh ikut makan dan memberi contoh. Program dikurangi bertahap sampai anak makan tanpa layar dan pengasuh menjalankan ritualnya sendiri.

Keluarga bisa langsung memakai sendiri (B2C). Kasus berat diarahkan ke dokter, dan dokter melanjutkan di aplikasi yang sama (B2B2C).

Bahan aktifnya sudah punya bukti: contoh dari model yang terlihat senang makan, hadiah non-makanan, dan paparan berulang. Kemasannya yang baru: karakter yang bereaksi pada mulut anak dan program lepas layar.

Produk ini tidak mendiagnosis, tidak memberi resep makanan, dan tidak menggantikan dokter.

## 2. Riwayat keputusan

| Tanggal | Versi atau usulan | Hasil | Alasan |
|---|---|---|---|
| 6 Nov | v1: kamera menghitung kunyahan, kereta jalan saat anak mengunyah | Ditolak | Kunyahan bukan target klinis. Kereta = layar sebagai hadiah, mirip ChewView, bertentangan dengan aturan makan tanpa layar. Pengasuh sudah melihat sendiri anaknya mengunyah |
| 8 Nov | Pelatih menyuapi untuk pengasuh lewat earphone | Ditolak | Terlalu basic, cuma panduan, tidak menyelesaikan GTM |
| 8 Nov | Kumpulan animasi edukasi untuk membujuk anak | Diubah | Konten pasif dan basic. Animasi yang diputar terus saat makan sama dengan YouTube |
| 8 Nov | Karakter makan bareng + lepas layar + panduan pengasuh | Diterima | Anak aktif, bahan aktif terbukti, ada jalan keluar dari layar |
| 8 Nov | Earphone | Dibuang | Ribet untuk pengasuh. Diganti suara karakter + teks kecil |
| 8 Nov | Model B2B2C klinik saja | Diubah ke hibrida | GTM kebanyakan ditangani di rumah tanpa dokter |
| 11 Nov | Karakter PNG berlapis | Diganti SVG flat | Gerbang aset 11 Nov 12.00: lebih cepat dibuat, mulut parametrik menyatu |
| 12 Nov | Kode akses keluarga | Diganti email + kata sandi semua peran | Satu halaman masuk; keluarga bisa pindah HP tanpa menyimpan kode |
| 12 Nov | `batasBukaDetik` 4 | Dinaikkan ke 6,5 | Uji gerbang: suapan pelan sering lebih dari 4 detik |
| 12 Nov | Suap di sisi pengasuh | Suap di tengah bawah | Lebih rapi dan terjangkau dari kedua sisi; desain dikunci |
| 13 Nov | Tanda bahaya menutup sesi | Jadi pengingat ke dokter | Keluarga tetap terdampingi; dokter melihat hasil skrining |
| 13 Nov | Naik tahap N sesi ≥ X suapan | Minimal sesi + 3 sesi berturut-turut ≥ 70% | Persen lebih adil untuk porsi berbeda; tahap 1 mengikuti paparan 8–10 kali |
| 13 Nov | Tanpa tab bar | Menu bawah Beranda · Laporan · Profil | Hasil uji alur: notifikasi dan profil perlu tempat tetap |

Konsekuensi: model hibrida melanggar sebagian kriteria #11 Darryl ("hindari B2C"). Kriteria itu sengaja dilonggarkan karena kenyataan pasar.

## 3. Keputusan yang berlaku

| Topik | Keputusan | Alasan |
|---|---|---|
| Kasus | Kesulitan makan balita (GTM) | Sering, emosional, satu kasus |
| Usia target | 3–5 tahun | Bukti modeling ada mulai sekitar 4 tahun; di bawah 3 tahun tidak ada bukti |
| Pengguna | Keluarga/pengasuh, balita, dokter/klinik | Pola Talkly tetap ada lewat jalur klinik |
| Bentuk | PWA laptop-first, juga HP/tablet | Final wajib localhost |
| Interaksi anak | Loop giliran gigit, karakter meniru wajah | Anak aktif, bukan menonton pasif |
| Interaksi pengasuh | Suara karakter mengajak + teks kecil di layar | Tanpa earphone |
| Layar | Penuh saat pemanasan, redup saat jeda kunyah, dikurangi per tahap | Menjawab kritik layar saat makan |
| Deteksi | MediaPipe `FaceLandmarker` di perangkat | Tanpa training ML, video tidak keluar perangkat |
| Animasi | Boneka digital dirender live dari kode | Tidak ada video generate, tidak ada biaya per pengguna |
| LLM | OpenAI gpt-6-luna | Darryl sudah punya saldo |
| Suara | ElevenLabs, klip dibuat sekali lalu disimpan | Murah dan offline |
| Bisnis | Hibrida B2C freemium + B2B2C klinik | Pasar besar + kredibilitas |
| Struktur | Satu aplikasi keluarga + satu dashboard klinik | Sesi makan cukup dibangun sekali |
| Biaya | Mulai dari paket gratis, naik ke Pro setelah ada pemasukan | Darryl tidak mau biaya tetap di awal |
| Identitas visual (10 Nov) | Nama Suapin, logo sendok miring, palet nasi-jagung-ubi ungu-kerupuk; detail dan file di `brand/` | Makanan lokal yang anak suka; tidak mirip palet Talkly |
| Database (10 Nov) | SQLite lokal lewat Drizzle; versi online Vercel + Turso (libSQL), kode sama; Supabase untuk produksi | Final wajib localhost dan offline; penyisihan tidak mensyaratkan deploy; teman tetap bisa akses lewat link Vercel |

## 4. Masalah dan urgensi

### Kesulitan makan sering terjadi

- Satu studi prasekolah di Jakarta menyebut prevalensi 33,6%; 44,5% di antaranya malnutrisi ringan sampai sedang, dan 79,2% berlangsung lebih dari tiga bulan.
- Angka antar studi berkisar sekitar 15% sampai 60,3% karena definisi berbeda. Tidak ada angka nasional resmi yang ditemukan. Jangan sajikan satu angka sebagai fakta nasional.
- Kaitan langsung dengan stunting belum terverifikasi. Tulis "dapat memengaruhi asupan dan pertumbuhan", dan cek data SSGI terbaru sebelum menyebut stunting.

### Kenyataan di rumah

- GTM kebanyakan ditangani sendiri: dibujuk, dicekoki, atau diberi YouTube. Tidak semua keluarga ke dokter.
- Waktu makan jadi drama setiap hari.
- Orang tua kerja, pengasuh atau ART yang menyuapi.
- Anak disuapi sambil bengong menonton, makan bisa sampai satu jam.
- Dokter hanya melihat anak beberapa menit saat kontrol.

### Kesenjangan

- Aturan makan dokter sulit dijalankan di rumah tanpa pengganti YouTube.
- Pengasuh jarang mendapat pelatihan langsung.
- Aplikasi dan game yang ada mengarah ke hiburan layar, bukan makan bersama.

### Kasus nyata

Belum ada kisah keluarga yang tervalidasi. Wawancarai minimal satu keluarga dan satu dokter sebelum pitch. Ilustrasi berikut wajib diberi label ilustrasi:

> Dika, 4 tahun, hanya mau makan sambil menonton YouTube. Ibunya bekerja, dan Mbak Rina menyuapinya selama satu jam. Dokter meminta makan tanpa layar, tetapi tanpa YouTube Dika menutup mulut.

## 5. Dasar ilmiah

Temuan berikut berasal dari ringkasan hasil pencarian 8 November 2026. Buka paper asli sebelum angka dipakai di slide.

| Bukti | Temuan | Batasan |
|---|---|---|
| Food Dudes, Lowe dkk. 2004 (402 anak, 4–11 tahun) | Video teman sebaya yang suka buah/sayur + hadiah kecil menaikkan konsumsi dan rasa suka, juga di rumah. Kenaikan terbesar pada anak yang awalnya makan sangat sedikit | Terkontrol, bukan RCT, di sekolah |
| Food Dudes, Horne dkk. 2004 (749 anak, 5–11 tahun) | Konsumsi naik dibanding sekolah kontrol | Bukan RCT |
| Aston 2022 dan 2024 (4–6 tahun) | Video orang dewasa makan brokoli dengan ekspresi senang menaikkan asupan brokoli | Kemauan mencoba tidak naik |
| Hanks, Pediatrics (anak SD) | Karakter kartun di salad bar + video menaikkan pilihan sayur dari 10% ke hampir 35% | Video kartun saja tidak signifikan |
| Studi Belanda (3–7 tahun) | Karakter buku cerita + hadiah non-makanan menaikkan kemauan mencicipi | Efek diduga dari hadiah |
| Tinjauan USDA, paparan berulang | Penerimaan naik setelah 8–10 kali paparan; sebagian anak cukup kurang dari 8 | Data di bawah 24 bulan tipis |
| Avery dkk. 2017 (13 studi, ~61 ribu anak) | TV saat makan berkaitan dengan kualitas diet lebih buruk | Korelasi |
| Studi balita Tiongkok 2022 (879 anak) | Screen time harian tidak terkait picky eating setelah penyesuaian | Bukan layar saat makan |

Kesimpulan untuk desain:

1. Modeling saja lemah. Gabungkan modeling, ekspresi senang, hadiah non-makanan, dan paparan berulang.
2. Modeling paling kuat ditaruh sebelum makan, jadi fase Pemanasan wajib ada.
3. Karakter interaktif yang meniru wajah belum punya studi. Posisikan sebagai kemasan baru dari bahan aktif yang terbukti, dan rencanakan pilot.
4. Tidak ada studi kausal layar saat makan ke GTM, tetapi TV saat makan terkait diet lebih buruk. Karena itu layar dibatasi dan ada program lepas layar.
5. Tidak ditemukan aplikasi yang dirancang untuk dipakai saat makan. Ini celah, tetapi juga berarti belum ada bukti langsung.

Aturan pemberian makan IDAI dipakai sebagai batas: jadwal teratur, maksimal 30 menit, tanpa distraksi, tanpa paksaan, makanan tidak dipakai sebagai hadiah, tawarkan ulang dengan netral saat anak menolak, akhiri setelah 10–15 menit menolak. Isinya ditulis dari ingatan dan wajib dicek ke dokumen IDAI asli.

## 6. Solusi dan pembeda

### Nilai utama

| Pengguna | Nilai |
|---|---|
| Keluarga mandiri | Bisa mulai sendiri hari ini, ada pengganti YouTube yang punya jalan keluar |
| Pengasuh | Diajak ikut main dan memberi contoh, tahu kapan menunggu dan kapan berhenti |
| Balita | Makan terasa seperti main bergiliran, tanpa paksaan |
| Dokter/klinik | Program yang bisa diresepkan, data antar kontrol, layanan baru |

### Beda dengan YouTube

| | YouTube | Suapin |
|---|---|---|
| Anak | Pasif, disuapi sambil bengong | Aktif meniru, sadar sedang makan |
| Isi | Acak | Makanan yang sama dengan di piring |
| Reaksi | Tidak ada | Bereaksi pada mulut anak |
| Layar | Seru terus | Seru hanya saat anak mau membuka mulut |
| Arah | Makin tergantung | Dikurangi sampai lepas layar |
| Pengasuh | Penonton | Ikut jadi contoh |
| Dokter | Tidak terlibat | Bisa mengatur tahap |

### Inovasi yang dijual

1. Karakter yang meniru wajah anak secara live di browser.
2. Loop giliran gigit yang mengubah modeling menjadi permainan aktif.
3. Program lepas layar dengan syarat naik tahap yang diukur kamera.
4. Ritual karakter dipindahkan ke pengasuh.
5. Resep dokter dalam bahasa bebas langsung menjadi perilaku aplikasi.
6. Video tidak pernah keluar dari perangkat.

### Kompetitor

- Indonesia: pencarian web belum menemukan produk sejenis. Yang berdekatan: aplikasi pemantauan MPASI, e-PedNutr, game edukasi makanan.
- Luar negeri:
  - ChewView: video jalan saat anak mengunyah, iPhone/iPad dengan kamera Face ID.
  - SlowEat: deteksi kunyahan untuk tempo makan.
  - YumEats: picky eating lewat tantangan bertahap.
  - Kiddio: game untuk orang tua, bukan anak.
  - Vegemi, Vegetable Maths Masters: anak memberi makan karakter di game.
- Jangan klaim "pertama di Indonesia" sebelum cek manual Play Store dan App Store.

## 7. Model bisnis hibrida

GTM kebanyakan ditangani di rumah, jadi keluarga bisa mulai langsung (B2C). Kasus berat atau dengan tanda bahaya diarahkan ke dokter, dan dokter melanjutkan di aplikasi yang sama (B2B2C).

| Jalur | Siapa | Aturan makan dari | Bayar |
|---|---|---|---|
| Keluarga mandiri (B2C) | Keluarga tanpa dokter | Program default berbasis aturan IDAI | Gratis 5 hari, lalu Program 30 Hari |
| Keluarga klinik (B2B2C) | Pasien klinik mitra | Resep dokter | Lewat klinik |
| Klinik | Dokter anak swasta, klinik tumbuh kembang, RSIA swasta | — | Langganan klinik |

Jembatan antar jalur: keluarga mandiri bisa menekan **Bagikan laporan ke dokter** dan membawanya saat kontrol. Dokter melihat manfaatnya, lalu klinik berlangganan. Keluarga juga bisa pindah ke jalur klinik kapan saja dengan kode undangan, dan riwayatnya tetap.

### Harga (estimasi, belum diuji)

| Produk | Harga |
|---|---|
| Keluarga mandiri, coba | Gratis 5 hari |
| Program 30 Hari | Rp 49.000 sekali bayar |
| Lanjutan | Rp 19.000–29.000 per bulan |
| Klinik | Rp 299.000 per bulan untuk 20 pasien aktif |
| Klinik, pasien tambahan | Rp 10.000–15.000 per pasien per bulan |
| Paket keluarga dari klinik | Rp 75.000–150.000 per 4 minggu, klinik ambil margin |

### Balik modal

- Fase awal memakai paket gratis, jadi biaya tetap sekitar Rp 0. Untung sudah dari pembeli pertama, dipotong fee pembayaran.
- Jika nanti naik ke Pro (~Rp 742.000–825.000 per bulan): cukup sekitar 16 pembeli Program 30 Hari per bulan, atau 3 klinik.
- Biaya variabel sekitar Rp 30 per pengguna per bulan, jadi hampir semua pendapatan tambahan menjadi margin.
- Belum dihitung: fee payment gateway, pajak, marketing.

### Kemahalan atau tidak

- Rp 299.000 per bulan untuk klinik kira-kira setara 1–2 konsultasi dokter anak (perkiraan, belum dicek). Klinik bisa menutupnya dari 2–4 paket keluarga.
- Rp 49.000 untuk keluarga lebih murah dari satu kali konsultasi.

### Pengaman jalur mandiri

Skrining tanda bahaya wajib sebelum program dimulai. Jika ada tanda bahaya, program tidak dimulai dan keluarga diarahkan ke dokter.

## 8. Struktur website

Bukan dua mode terpisah. Ada dua tampilan berdasarkan peran. B2C dan B2B2C memakai layar keluarga yang sama dan dibedakan oleh kolom `plan`.

| Tampilan | Pengguna | Isi |
|---|---|---|
| Aplikasi keluarga | Orang tua/pengasuh, kedua jalur | Onboarding, beranda, sesi makan, laporan |
| Dashboard klinik | Dokter | Daftar pasien, resep, progres |

Percabangan hanya di 3 tempat:

| Titik | `plan = trial/program` (mandiri) | `plan = klinik` |
|---|---|---|
| Sumber aturan | Program default | Resep dokter |
| Paywall | Muncul setelah 5 hari | Tidak ada |
| Tombol Bagikan ke dokter | Ada | Tidak perlu, data otomatis terlihat dokter |

### Peta halaman

```text
/                         Landing: [Mulai gratis untuk keluarga] [Untuk klinik]

Aplikasi keluarga
/mulai                    Profil anak, sapaan dan nama pengasuh
/mulai/skrining           Checklist tanda bahaya
/mulai/kode               Opsional: masukkan kode klinik
/beranda                  Tahap, peta stiker, pelacak makanan baru, [Mulai makan]
/sesi                     Pilih menu, pemanasan, loop giliran, penutup
/sesi/catatan             Porsi dan mood
/laporan                  Ringkasan AI mingguan, [Bagikan ke dokter]
/langganan                Paywall Program 30 Hari (lomba: mock)
/r/:token                 Laporan yang dibagikan, bisa dibuka dokter

Dashboard klinik
/klinik/masuk             Login dokter (lomba: akun demo)
/klinik/pasien            Daftar pasien
/klinik/pasien/:id        Resep bebas -> JSON -> konfirmasi, tahap, progres, ringkasan AI
/klinik/undang            Buat kode undangan keluarga
```

### Skrining tanda bahaya (draf, wajib divalidasi dokter)

- Berat badan turun atau tidak naik beberapa bulan.
- Sering tersedak atau batuk saat makan.
- Sesak atau bibir kebiruan saat makan.
- Muntah berulang atau diare lama.
- Tampak kesakitan saat makan atau menelan.
- Keterlambatan perkembangan lain.
- Penyakit kronis atau alergi makanan berat.

Jika satu terisi "ya": tampilkan "Sebaiknya periksa ke dokter dulu", program tidak dimulai, tawarkan memasukkan kode klinik.

## 9. Alur pengguna

### Keluarga mandiri (B2C)

1. Buka website atau install PWA di HP.
2. Isi profil anak (panggilan, tanggal lahir) dan sapaan pengasuh (Mbak, Bu, Oma, Ayah) beserta namanya, sekitar 1 menit.
3. Isi skrining tanda bahaya.
4. Jika aman, program default aktif dan trial 5 hari dimulai.
5. Pilih menu dari daftar makanan.
6. Sesi makan pertama langsung bisa dimulai.
7. Setelah 5 hari, paywall Program 30 Hari muncul.
8. Kapan saja bisa membagikan laporan ke dokter atau memasukkan kode klinik.

### Keluarga klinik (B2B2C)

1. Dokter memeriksa anak dan menyingkirkan tanda bahaya.
2. Dokter membuat kode undangan.
3. Keluarga memasukkan kode saat onboarding, atau belakangan dari beranda.
4. Aturan dan tahap mengikuti resep dokter. Tidak ada paywall.

### Dokter

1. Masuk dashboard.
2. Isi profil singkat pasien.
3. Tulis aturan dengan bahasa bebas. LLM mengubahnya jadi JSON, lalu dokter mengonfirmasi.
4. Pilih tahap awal dan syarat naik tahap.
5. Pantau progres dan ringkasan AI, ubah aturan saat kontrol.
6. Buka laporan yang dibagikan keluarga mandiri.

## 10. Sesi makan

Sesi makan sama untuk kedua jalur.

### Persiapan

1. Pengasuh memilih teman makan (6 karakter), menu hari ini dari 30 makanan, dan sisi duduknya (dari arah anak menghadap layar).
2. HP atau laptop diletakkan sedikit di samping depan anak.
3. Sistem mengecek wajah dan pencahayaan (kalibrasi 3 detik, karakter menyapa). Bila kamera tidak bisa dipakai, sesi tetap jalan dan pengasuh menjawab "Tadi masuk?" setelah setiap Suap.

### Pemanasan (±25 detik, sebelum makan)

1. Karakter mengintip makanan, mencium wanginya, mengenalkan dengan kalimat yang berganti tiap sesi (warna, bentuk, bau, bunyi), lalu berani mencoba dan menggigit kecil.
2. Karakter memanggil nama anak dan mengajak makan bareng. Pemanasan bisa dilewati.

Animasi penuh di fase ini. Bagian ini yang paling didukung bukti modeling.

### Saat makan: loop giliran

```text
┌─> (1) GILIRAN KARAKTER — layar terang, 3–5 detik
│       Karakter gigit, ekspresi enak, "Sekarang Dika!"
│       Kadang karakter meminta pengasuh yang gigit duluan.
│
│   (2) GILIRAN ANAK — layar terang
│       Pengasuh menekan Suap saat menyodorkan sendok.
│       Karakter membuka mulut menunggu dan meniru wajah anak.
│       Mulut terbuka lalu tertutup (menerima suapan) -> karakter merayakan.
│       Tidak jelas -> teks "Tadi masuk? Ya / Tidak" ke pengasuh.
│       Menolak (mulut tak pernah terbuka / menoleh menjauh) -> karakter netral
│       5 detik tanpa animasi lucu + teks untuk pengasuh, lalu karakter
│       mengambil giliran: "Oke. Aku gigit dulu."
│       Anak masih mengunyah saat Suap ditekan -> "tunggu, masih mengunyah".
│
│   (3) JEDA KUNYAH — layar redup
│       Karakter duduk mengunyah pelan meniru anak, tanpa cerita baru.
│       Kunyahan selesai (atau timer 15 detik / tombol Lanjut) -> kembali ke (1).
└──────────────────────────────────────────┘
```

- Respons saat menolak sengaja datar. Perhatian atau hiburan setelah anak menolak bisa membuat penolakan makin sering.
- Tombol Suap bisa ditekan kapan saja dan langsung masuk giliran anak, jadi pengasuh tidak harus menunggu animasi.
- Anak yang makan sendiri memakai mode makan sendiri (II.6.5).
- Layar redup hanya di jeda (3), supaya anak fokus mengunyah.
- Momen paling seru ada di (2), dan anak harus beraksi untuk mendapatkannya.
- Batas waktu dari aturan. Saat habis, karakter mengajak selesai.
- Sesi juga diakhiri jika anak terus menolak melewati batas aturan.
- Tombol **Suap** di tengah bawah; **Lanjut** dan **Selesai** di sisi pengasuh; **Jeda** di pojok atas sisi jauh (Lanjut Makan, Akhiri, atau Darurat 119). Hasil suapan terakhir bisa dikoreksi dengan tombol "Tadi".

### Setelah makan

1. Karakter menutup: "Terima kasih sudah makan bareng!"
2. Anak mendapat stiker di peta minggu. Stiker diberikan karena mau mencoba, bukan karena menghabiskan porsi.
3. Makanan baru yang dicoba menambah satu langkah di pelacak paparan (target 8–10 kali).
4. Pengasuh mencatat porsi dan mood secara singkat.

## 11. Pesan ke pengasuh

Earphone tidak dipakai. Pesan dibagi dua jalur.

| Jalur | Isi | Alasan |
|---|---|---|
| Suara karakter, keras | Ajakan main yang melibatkan pengasuh | Anak boleh mendengar, jadi bagian permainan |
| Teks kecil di pojok layar, tanpa suara | Arahan sensitif | Anak tidak perlu mendengar "jangan dipaksa" |

Contoh suara karakter:

- "Mbak, gigit brokolinya duluan ya, biar Dika lihat!"
- "Wah, Mbak makan juga! Enak nggak?"
- "Suapan kecil aja ya, segini."
- "Dika masih ngunyah, kita tunggu ya."
- "Hore, Dika hebat! Tos dulu sama Mbak!"

Contoh teks pojok (nama pengasuh boleh tampil di teks):

- "Jangan dibujuk. Tawarkan lagi sebentar lagi."
- "Sudah lama menolak. Akhiri makan, tidak apa-apa."
- "Sepertinya ngemut? Ya / Tidak"
- "Tadi masuk? Ya / Tidak"
- "Waktu habis. Akhiri dengan senang."

Klip suara memakai sapaan generik (Mbak, Bu, Oma, Ayah), satu set per sapaan, supaya tidak perlu membuat klip per nama. Nama anak di suara memakai klip tanpa nama ("Sekarang giliranmu!") atau TTS satu kali saat setup, diputuskan saat build. Semua kalimat harus ditinjau dokter anak atau ahli gizi. Klip yang dibuat selama hacking week berstatus **draf** sampai ditinjau, dan disebut begitu di README.

## 12. Program lepas layar

| Tahap | Layar | Syarat naik tahap (default) |
|---|---|---|
| 1 · Karakter memandu | Loop penuh | ≥ 8 sesi, lalu 3 sesi berturut-turut dengan ≥ 70% suapan diterima |
| 2 · Pengasuh jadi contoh | Karakter hanya muncul saat giliran; pengasuh yang diajak menggigit duluan | ≥ 5 sesi + 3 sesi berturut-turut ≥ 70% |
| 3 · Layar hitam | Suara saja, layar hitam penuh, kamera tetap membaca | ≥ 5 sesi + 3 sesi berturut-turut ≥ 70% |
| 4 · Tanpa layar | Pengasuh memimpin, aplikasi hanya mencatat | Tahap akhir; dicek di laporan atau saat kontrol |

- Sesi dengan kurang dari 5 suapan ditawarkan belum dihitung. Angka 70% adalah asumsi desain yang perlu divalidasi saat pilot.
- Jalur mandiri: syarat default, naik tahap otomatis. Tracker tahap tampil di beranda dan laporan.
- Jalur klinik: dokter mengatur syarat (persen 50–90, jumlah sesi, panjang deret) dan menaikkan tahap sendiri.
- Sejak tahap 1, karakter selalu memakai kalimat dan gerakan yang sama dan mengajak pengasuh menirukannya. Di tahap 4, pengasuh yang menjadi contoh.

## 13. Deteksi

### Model

| Kebutuhan | Pilihan | Catatan |
|---|---|---|
| Wajah, rahang, arah kepala | MediaPipe Tasks Vision `FaceLandmarker` | Sekitar 3,8 MB, jalan di browser, ada blendshape |
| Tangan | `HandLandmarker` | Bukan MVP |
| Sendok | Tidak dibuat | Diganti tombol Suap |

### Sinyal

- **Mulut terbuka:** blendshape `jawOpen`. Dipakai untuk menilai suapan diterima dan menggerakkan mulut karakter.
- **Gerak rahang (kunyah):** jarak titik dagu ke titik hidung dibagi tinggi wajah. Tetap bergerak walau bibir tertutup, karena rahang bawah naik turun. `jawOpen` tidak dipakai untuk kunyahan karena hampir diam saat anak mengunyah dengan bibir terkatup. Jarak ini juga berubah saat kepala mengangguk; jika tes 9 Nov menunjukkan angguk memicu siklus palsu, jarak dihitung di koordinat lokal wajah (landmark diputar balik dengan matriks transformasi) sehingga angguk tidak ikut terhitung.
- **Arah kepala:** dari matriks transformasi wajah, dibandingkan dengan sisi duduk pengasuh (kiri/kanan, diisi saat persiapan).
- **Keterlihatan:** wajah ditemukan dan titik mulut stabil.
- **Input pengasuh:** tombol Suap, Lanjut, dan koreksi hasil.

**Hasil gigitan ditentukan oleh mulut terbuka dan arah kepala, bukan oleh kunyahan.** Kunyahan hanya dipakai untuk animasi karakter, penanda akhir jeda kunyah, dan dugaan ngemut.

### Hitung kunyahan

1. Ambil sinyal rahang 15–20 kali per detik.
2. Haluskan, lalu cari puncak dan lembah.
3. Ambang satu siklus ditentukan relatif terhadap getaran sinyal saat diam (misalnya 3 kali simpangan baku dari jendela baseline bergulir), bukan angka tetap.
4. Mengunyah aktif jika minimal 3 siklus dalam 3 detik, ritme 0,8–2,5 Hz.
5. Kunyahan selesai jika tidak ada siklus selama 4 detik.
6. Jika deteksi kunyahan tidak lolos gerbang 9 Nov, akhir jeda memakai timer 15 detik atau tombol Lanjut.

Semua angka adalah titik awal dan wajib dituning.

### Status

| Status | Syarat | Reaksi |
|---|---|---|
| Menunggu giliran | Wajah terlihat | Loop berjalan |
| Menilai | Jendela 6 detik sejak Suap ditekan, ditambah sinyal 3 detik sebelum Suap; diperpanjang selama mulut masih terbuka (maksimal 12 detik) | Mencari transisi buka ke tutup. Tidak ada deteksi oklusi khusus |
| Diterima | Mulut terbuka minimal 0,3 detik lalu tertutup di dalam jendela (termasuk mulut yang sudah terbuka sebelum Suap), lama buka tidak melewati `batas_buka_detik`, tidak terdeteksi menangis, kepala tidak menoleh menjauhi pengasuh | Karakter merayakan setelah mulut tertutup |
| Masih mengunyah | Mulut tertutup tetapi rahang bergerak | Bukan menolak; teks "Masih ngunyah, tunggu" |
| Selesai mengunyah | Siklus berhenti, atau timer/tombol Lanjut | Kembali ke giliran karakter |
| Kemungkinan ngemut | Setelah diterima, rahang hampir diam dan mulut tertutup lebih dari 15 detik | Teks konfirmasi ke pengasuh |
| Menolak | Mulut tidak pernah terbuka di jendela, atau kepala menoleh menjauhi pengasuh | Karakter netral dan singkat, teks ke pengasuh |
| Tidak pasti | Jendela habis tanpa syarat diterima atau menolak (misalnya buka terlalu lama atau nilai ngawur) | Karakter diam menunggu, teks "Tadi masuk? Ya / Tidak" ke pengasuh |
| Tidak terlihat | Titik mulut hilang lebih dari 1,5 detik di luar jendela penilaian | Penilaian berhenti, karakter menunggu |
| Selesai sesi | Batas waktu atau batas menolak | Penutup |

Kamera tidak bisa membedakan ngemut dari sudah menelan, karena keduanya terlihat sebagai mulut tertutup dan rahang diam. Sistem hanya memberi tanda "kemungkinan", dan pengasuh yang mengonfirmasi.

**Batas lama buka.** Balita sering membuka mulut sejak sendok mendekat dan menahannya sampai sendok masuk, apalagi saat pengasuh kerepotan. Batas yang terlalu pendek akan menolak suapan sungguhan. Karena itu:

- Yang dinilai adalah saat mulut menutup di dalam jendela, bukan saat mulut mulai terbuka. Mulut yang sudah terbuka sebelum Suap ditekan (anak meniru karakter yang menunggu, atau "aaa" menunggu sendok) tetap sah.
- `batas_buka_detik` adalah parameter, awal 4 detik. Angka akhirnya diambil dari lama buka mulut yang dicatat saat tes menyuap sungguhan dengan sendok dan makanan (9 Nov), lalu disetel lewat panel ambang. Tes itu pada orang dewasa, jadi angkanya tetap perkiraan untuk balita.
- Menangis tidak dibedakan dari lama buka saja. Blendshape mata dan alis (`eyeSquintLeft/Right`, `browDownLeft/Right`) yang tinggi bersamaan dengan mulut terbuka dipakai sebagai dugaan menangis. Ini belum dites; jika tidak membantu, cukup batas lama buka dan koreksi pengasuh.

### Kasus tepi

| Kasus | Penanganan |
|---|---|
| Sendok atau tangan menutupi mulut | FaceLandmarker tidak memberi tanda oklusi dan bisa mengeluarkan nilai ngawur. Tidak dibuat deteksi oklusi khusus: yang dinilai cukup urutan buka lalu tutup di jendela, dengan koreksi pengasuh sebagai pengaman. Opsi setelah tes: tandai frame dengan lonjakan gerak titik mulut yang tidak wajar |
| Menangis atau berteriak "nggak mau" | Mulut terbuka melewati `batas_buka_detik`, atau mata menyipit dan alis turun bersamaan, tidak dihitung diterima. Teriakan pendek tetap bisa lolos, jadi pengasuh mengoreksi. Perayaan baru muncul setelah mulut tertutup |
| Mulut sudah terbuka saat Suap ditekan | Sah. Buffer 3 detik sebelum Suap ikut dibaca; yang dinilai saat mulut menutup di dalam jendela |
| Jendela habis tanpa hasil jelas | Status tidak pasti, pengasuh menjawab Ya / Tidak |
| Anak menoleh ke arah pengasuh untuk mengambil suapan | Bukan menolak; menolak hanya jika menoleh menjauhi sisi pengasuh |
| Anak tertawa melihat karakter | Mulut terbuka di luar jendela penilaian tidak dihitung |
| Tangan menutupi mulut | Tidak terlihat |
| Anak bicara atau menangis | Bisa keliru terbaca, sajikan sebagai perkiraan |
| Anak bergerak | Tahan status sebentar, lalu tidak terlihat |
| Cahaya buruk | Minta pindah posisi |

### Evaluasi

Dataset publik kunyahan balita tidak ditemukan. ByteTrack memakai anak 7–9 tahun dengan F1 70,6%, dan akses datanya belum jelas.

1. Rekam 10–20 sesi orang dewasa dengan izin.
2. Label kunyahan, suapan, dan menolak secara manual.
3. Hitung precision, recall, dan F1.
4. Tes balita hanya dengan izin tertulis orang tua.

Klaim akurasi hanya berlaku untuk populasi yang diuji. Jangan pakai video anak dari internet.

## 14. Karakter dan aset

### Cara kerja: boneka digital, bukan video

Tidak ada video yang di-generate. Karakter adalah gambar yang dirakit dari potongan (kepala, mata, mulut) dan digerakkan kode secara live di browser, seperti wayang.

```text
Kamera -> FaceLandmarker -> jawOpen = 0.7
                         -> tinggi mulut karakter = 0.7 × maksimum
                         -> mulut karakter membuka 70%, saat itu juga
Loop giliran -> karakter menggigit gambar makanan
Menu hari ini -> brokoli / nasi / wortel (3 gambar: utuh, digigit 1, digigit 2)
```

- Bank video tidak dipakai karena video tidak bisa meniru mulut anak secara live.
- AI generate live tidak dipakai karena lambat, mahal, dan butuh internet saat demo.
- Semua aset dibuat sekali, disimpan di repo, dipakai semua pengguna, dan tetap jalan offline.
- Menambah makanan cukup menambah 3 gambar. Kodenya sama.
- Jika menu anak tidak ada di daftar, karakter memakai gambar umum (sendok berisi makanan atau mangkuk), jadi tidak perlu aset untuk semua makanan.

### Daftar aset MVP

| Aset | Cara buat | Jumlah |
|---|---|---|
| Karakter | Badan, kepala, mata dari ilustrasi PNG/WebP berlapis; mulut SVG parametrik di kode. Rencana B: seluruhnya SVG flat | 1, sekitar 6–8 lapisan (lihat II.6.6) |
| Ekspresi | Netral, menunggu, enak, merayakan, santai saat ditolak | 5, dipakai ulang untuk semua makanan |
| Makanan | Gambar statis, boleh dibuat sekali dengan AI image lalu dirapikan | 3 makanan × 3 tahap gigitan |
| Suara | ElevenLabs, klip tersimpan | Sekitar 20–30 klip + variasi sapaan |
| Stiker | Gambar statis | Beberapa |

- Bagus tidaknya karakter ditentukan gambarnya, bukan formatnya. PNG berlapis dipilih karena gaya gambar bebas (ilustrator atau AI image yang dirapikan) dan kodenya tetap sederhana.
- Memotong 6 bentuk mulut yang konsisten dari gambar AI itu sulit. Karena itu mulut dibuat SVG parametrik, dan ilustrasi cukup untuk badan, kepala, dan mata.
- **Keputusan aset di akhir 9 Nov:** jika ilustrasi belum bagus atau lapisannya tidak pas, langsung pakai SVG flat dari bentuk sederhana. Aset tidak boleh menahan hari 11.
- SVG flat juga dipakai jika ada anggota yang jago vektor.
- Rive paling halus (dipakai Duolingo) tetapi perlu belajar 1–2 hari. Hanya dipakai jika ada anggota yang sudah bisa. Harga plan Rive belum dicek.
- Lottie kurang cocok untuk gerakan yang mengikuti input terus-menerus.
- Gunakan aset dengan lisensi jelas.

## 15. AI

| Fungsi | Pilihan | Catatan |
|---|---|---|
| Wajah dan rahang | MediaPipe `FaceLandmarker` | On-device |
| Resep dokter jadi aturan | OpenAI gpt-6-luna | Output JSON, dokter wajib konfirmasi |
| Ringkasan mingguan | OpenAI gpt-6-luna | Menunjukkan pola yang tidak bisa dibuat template (jam atau menu dengan penolakan tinggi, tren antar minggu), label AI, fallback cache |
| Variasi kalimat karakter | LLM saat pengembangan | Ditinjau manusia lalu disimpan |
| Suara | ElevenLabs | Klip tersimpan |

Arahan live memakai aturan tetap, bukan LLM.

Pertanyaan juri yang harus siap dijawab:

- **"Kenapa resep pakai LLM, bukan form 5 kolom?"** Dokter cukup menulis kalimat yang biasa ia tulis di catatan atau ucapkan ke keluarga, lalu tinggal mengonfirmasi. Form manual tetap ada sebagai cadangan.
- **"Ringkasan dari angka bisa pakai template?"** Template hanya mengulang angka. LLM diberi data per sesi (jam, menu, hasil) dan diminta menunjukkan 1–2 pola, tanpa diagnosis atau saran menu.

Aturan AI:

- Input LLM hanya angka dan catatan terstruktur, tanpa video atau gambar wajah.
- LLM tidak menyarankan diagnosis, dosis, atau menu.
- Output selalu dilabeli buatan AI.
- API key hanya di server.
- Cek nama dan harga model aktif sebelum build.

Contoh aturan hasil LLM:

```json
{
  "max_minutes": 25,
  "stage": 1,
  "advance_rule": { "sessions": 3, "min_accepted_bites": 5 },
  "end_after_refusal_minutes": 10,
  "ngemut_hint": "Tawarkan minum air sedikit"
}
```

Program default jalur mandiri memakai JSON yang sama, diisi dari aturan IDAI.

## 16. Arsitektur dan data

```text
Kamera -> FaceLandmarker (browser) -> Rule engine -> Karakter + suara + teks pengasuh
                                         |
                                  Ringkasan sesi (angka)
                                         |
Aplikasi keluarga + dashboard klinik <-> API (Node.js) + database
                                         |
                                  Proxy LLM -> OpenAI gpt-6-luna
```

### Stack

| Lapisan | Pilihan |
|---|---|
| Frontend | React, Vite, TypeScript, React Router |
| PWA | `vite-plugin-pwa` |
| Computer vision | `@mediapipe/tasks-vision` |
| Karakter | Lapisan PNG/WebP di React + CSS, opsional `@rive-app/canvas` |
| Backend | Node.js + Hono sebagai API dan proxy LLM. Satu kode jalan lokal (`@hono/node-server`) dan sebagai Vercel Functions. Tidak boleh bergantung pada server yang nyala terus atau file lokal selain database |
| ORM | Drizzle + `@libsql/client` |
| Database lomba (laptop, final) | SQLite file: `DATABASE_URL=file:local.db` |
| Database online (Vercel, untuk teman/tim) | Turso: `DATABASE_URL=libsql://...` + `TURSO_AUTH_TOKEN` |
| Database produksi | Supabase (skema Drizzle diganti ke `pgTable` + migrasi data) |
| Hosting online | Vercel Hobby (lomba, non-komersial). HTTPS otomatis, jadi kamera jalan |
| Tes | Vitest untuk rule engine dan penghitung kunyahan |
| Repo | GitHub |

### Struktur data

- `clinics`: id, nama.
- `doctors`: id, clinic_id, nama.
- `children`: id, clinic_id (kosong untuk keluarga mandiri), panggilan, tanggal_lahir, kode_akses, sapaan_pengasuh, nama_pengasuh, plan (trial/program/klinik), trial_until.
- `screenings`: id, child_id, jawaban_json, ada_tanda_bahaya, tanggal.
- `invites`: kode, clinic_id, dipakai_oleh, kedaluwarsa.
- `rules`: id, child_id, source (default/dokter), source_text, rules_json, stage, confirmed_at.
- `sessions`: id, child_id, stage, menu, mulai, selesai, durasi.
- `bites`: id, session_id, waktu, hasil (diterima/ditolak/ngemut), dikoreksi.
- `food_exposures`: id, child_id, makanan, tanggal, dicoba.
- `session_notes`: session_id, porsi, mood.
- `weekly_summaries`: child_id, minggu, audiens (keluarga/dokter), teks, model.
- `shared_reports`: id, child_id, token, dibuat, kedaluwarsa.

Tidak ada tabel video atau gambar wajah.

### Performa

- Target deteksi 15–20 fps.
- Model, runtime, aset karakter, dan klip suara disimpan lokal.
- HP lewat `http://192.168.x.x` gagal mengakses kamera. Gunakan localhost atau USB port forwarding.

## 17. Tools dan biaya

Kurs dipakai Rp 16.500/$. Harga layanan dari catatan sebelumnya dan ingatan; cek ulang sebelum masuk slide.

### Tools

| Bagian | Tool | Biaya |
|---|---|---|
| Frontend dan PWA | React, Vite, TypeScript, `vite-plugin-pwa` | Gratis |
| Deteksi wajah | `@mediapipe/tasks-vision` | Gratis |
| Karakter | Lapisan PNG/WebP + mulut SVG parametrik, rencana B SVG flat, Rive opsional | Gratis |
| Gambar | Figma gratis atau AI image, sekali buat | Rp 0–300.000 sekali |
| Suara | ElevenLabs | Free untuk lomba; Starter $5 sekali saat membuat klip komersial |
| LLM | OpenAI gpt-6-luna ($0,10 input / $0,50 output per 1 juta token) | Bayar sesuai pemakaian dari saldo yang sudah ada |
| Backend | Node.js + Hono, Drizzle | Gratis |
| Database | SQLite (laptop), Turso free (versi online lomba), Supabase free (awal jualan) | Gratis |
| Hosting | Localhost (final), Vercel Hobby (versi online lomba), hosting gratis yang boleh komersial (awal jualan) | Gratis |
| Tes dan repo | Vitest, GitHub | Gratis |

### Hitungan LLM

- Satu panggilan sekitar 2.000 token masuk + 400 token keluar ≈ $0,0004.
- Per pengguna per bulan: 1 ubah aturan + 4 ringkasan ≈ Rp 30.
- Pemakaian selama lomba ≈ $0,2 ≈ Rp 3.000.

### Biaya per fase

| Fase | Biaya tetap/bulan | Biaya lain |
|---|---|---|
| Lomba | Rp 0 | LLM ~Rp 3.000 |
| Awal jualan | Rp 0 (Supabase free + hosting gratis yang boleh komersial) | LLM ~Rp 30/pengguna/bulan, ElevenLabs Starter ~Rp 82.000 sekali |
| Sudah ramai | ~Rp 742.000–825.000 (Vercel Pro $20, Supabase Pro $25, ElevenLabs $5 di bulan produksi klip) | Dibayar dari pemasukan |

### Batas paket gratis

| Layanan | Batas | Kapan perlu bayar |
|---|---|---|
| ElevenLabs free | Lisensi non-komersial, wajib atribusi ("Voice by ElevenLabs" di README) | Sebelum jualan, langganan Starter sebulan untuk membuat klip |
| Vercel Hobby | Dilarang untuk komersial | Saat jualan, atau pakai hosting gratis lain yang boleh komersial |
| Supabase free | 500 MB, pause jika 7 hari tidak dipakai, tanpa backup harian | Saat ada klinik berbayar; sebelum itu buat backup otomatis sendiri |

| Turso free | Batas database, penyimpanan, dan baca/tulis per bulan (angka belum dicek) | Cukup untuk lomba; cek sebelum dipakai klinik |

Status lisensi hosting gratis alternatif, batas Supabase free, dan batas Turso free belum dicek.

## 18. Privasi, etika, regulasi

- Video diproses di perangkat, tidak disimpan, tidak dikirim.
- Data anak hanya angka minimum. Izin orang tua wajib, dan data bisa dihapus.
- Hanya klinik terkait yang melihat data pasiennya. Laporan bagikan memakai token yang kedaluwarsa.
- API key hanya di server.

Peringatan regulasi:

- KMK 951/2026 dilaporkan mencakup software dan AI alat kesehatan, termasuk analisis sinyal. Membaca rahang dari kamera bisa dianggap analisis sinyal. Teks asli belum dibaca.
- PP 33/2026 berlaku 16 Januari 2027 dan mengatur data anak. Teks asli belum dibaca.
- Jalur mandiri berarti aplikasi dipakai tanpa dokter, jadi posisikan sebagai program kebiasaan makan, bukan terapi medis.
- Jangan klaim patuh UU PDP, ramah lingkungan, atau menyembuhkan GTM tanpa bukti.

Pengaman klinis:

- Skrining tanda bahaya wajib di jalur mandiri.
- Tidak ada target menghabiskan makanan.
- Karakter tidak pernah membujuk atau memaksa saat anak menolak.
- Layar redup saat jeda dan dikurangi per tahap.
- Hadiah berupa stiker, bukan makanan atau tontonan.
- Tombol Stop memberi instruksi mencari bantuan medis saat darurat.

## 19. Syarat lomba dan peta penilaian

### Syarat wajib

| Syarat | Pemenuhan |
|---|---|
| Source code di GitHub | Repo publik, README lengkap |
| Video demo 3–5 menit tanpa suara presentasi | Teks di layar; tanya panitia apakah suara aplikasi boleh terdengar. Guidebook (dicek 10 Nov): penyisihan dinilai dewan juri dari repo GitHub + video saja, tanpa proposal/deck dan tanpa syarat link deploy. Video = satu-satunya cara juri melihat produk jalan |
| Deploy | Tidak wajib. Link Vercel di README sebagai bonus agar juri/teman bisa mencoba. Mekanisme submission lanjutan diumumkan di grup WA, cek di sana |
| Menampilkan fitur AI | FaceLandmarker live, LLM resep ke aturan, ringkasan AI |
| Kode tidak diubah setelah deadline | Freeze 14 Nov. Ambang deteksi diubah lewat panel ambang saat aplikasi jalan, bukan lewat kode, plus tombol reset data demo (II.6.5) |
| Jalan di localhost saat final | SQLite lokal, aset dan klip lokal, ringkasan cache |
| Integrated Mentoring | Diikuti |

### Peta penilaian

| Kriteria | Bobot | Strategi |
|---|---|---|
| Problem-Solution Fit | 25% | Data prevalensi, kenyataan GTM di rumah, bukti modeling dan paparan berulang, wawancara |
| Technology Innovation | 25% | Karakter meniru wajah secara live, resep bahasa bebas jadi aturan, lepas layar adaptif |
| Software Engineering | 25% | Rule engine dan penghitung kunyahan yang dites, satu sesi untuk dua jalur, README, arsitektur |
| UI/UX | 15% | Onboarding 1 menit, layar anak sederhana, teks pengasuh tidak mengganggu, dashboard ringkas |
| Green IT & Ethics | 10% | Video tidak keluar perangkat, data minimum, label AI, skrining, program mengurangi layar |

## 20. Rencana MVP

| Tanggal | Target | Bukti selesai |
|---|---|---|
| 9 Nov | Repo, kerangka halaman, tes `FaceLandmarker` dengan sendok asli. **Gerbang go/no-go**. Bentuk data sinyal dikunci + sumber sinyal palsu. Aset mulai digambar, keputusan rencana B aset | Kriteria di bawah terpenuhi atau rencana cadangan dipilih |
| 10 Nov | Sinyal dan state machine; skema SQLite + API dasar; aset karakter selesai | Status berubah live dari webcam |
| 11 Nov | Karakter meniru mulut + loop giliran + pemanasan; LLM resep ke JSON | Karakter bereaksi pada wajah |
| 12 Nov | Suara draf, teks pengasuh, saklar tahap, Wake Lock; onboarding + skrining; dashboard klinik | Satu sesi lengkap dari daftar sampai selesai |
| 13 Nov | Ringkasan AI + cache, bagikan + Jadikan pasien saya, paywall mock, tuning, panel ambang + reset demo; **rekam video malam ini** | Resep dokter mengubah sesi keluarga, video jadi |
| 14 Nov | README final, cek repo, submit sebelum siang. Tidak ada fitur baru | GitHub dan video terkirim |

### Jadwal per orang

Aset tidak punya hari sendiri, jadi dikerjakan paralel sejak hari pertama.

| Tanggal | Orang 1: deteksi dan engine | Orang 2: aset dan layar anak | Orang 3: backend, AI, dokumen |
|---|---|---|---|
| 9 Nov | Tes FaceLandmarker, uji gerbang dengan sendok dan makanan asli; kunci bentuk data sinyal; sumber sinyal palsu (slider + rekaman ulang landmark JSON) | Gambar karakter (badan, kepala, mata), brokoli 3 tahap + gambar umum. Akhir hari: putuskan ilustrasi atau SVG flat | Repo, kerangka halaman, skema SQLite |
| 10 Nov | Sinyal mulut, rahang, kepala, nangis; penghitung kunyahan; state machine + tes Vitest | Selesaikan aset, ekspresi, stiker; mulai komponen karakter + mulut SVG memakai sinyal palsu | API dasar (anak, skrining, sesi, aturan), daftar kalimat klip |
| 11 Nov | Sambungkan engine ke karakter | Komponen karakter meniru mulut, loop giliran, pemanasan | LLM resep ke JSON + validasi rentang aman, buat klip suara draf |
| 12 Nov | Suara, teks pengasuh, saklar tahap 1–3, Wake Lock, izin audio | Onboarding + skrining, beranda, stiker penutup | Dashboard klinik: daftar pasien, resep, progres sebagai tabel (tanpa grafik) |
| 13 Nov | Tuning ambang dengan tes menyuap sungguhan, panel ambang + reset data demo, perbaikan bug; jika tuning beres, grafik progres di dashboard | Polish UI, bantu rekam video | Ringkasan AI + cache, bagikan + Jadikan pasien saya, paywall mock, README draf, rekam video malam |
| 14 Nov | Cek akhir | Cek akhir | README final, submit |

- Beban hari 12 berat di Orang 2 dan 3. Orang 1 tidak diberi tugas dashboard di hari 12 karena hari itu ia juga padat; dashboard disederhanakan jadi tabel, dan grafik baru diambil Orang 1 di hari 13.
- Jika jadwal Integrated Mentoring jatuh di 9–13 Nov, target hari itu dikurangi. Yang dipotong dulu adalah daftar "Disederhanakan", bukan inti demo.
- **Prioritas:** penyisihan kemungkinan dinilai dari video dan repo (cek guidebook). Jika benar, cerita video dan bukti Problem-Solution Fit lebih penting daripada kelengkapan dashboard. Saat waktu habis, potong fitur dashboard, bukan kualitas video.

### Gerbang go/no-go 9 November

Dites ke 3 anggota tim, 10 percobaan per orang, di laptop final:

| Uji | Lolos jika |
|---|---|
| Mulut terbuka setelah Suap | Minimal 9 dari 10 terdeteksi |
| Uji di atas diulang dengan sendok berisi makanan sungguhan, disuapi orang lain dari samping | Minimal 8 dari 10 terdeteksi diterima |
| Mulut sudah terbuka saat Suap, atau "aaa" menunggu sendok 3 detik lalu menutup | Minimal 8 dari 10 terdeteksi diterima |
| Dua wajah di kamera (pengasuh ikut masuk) | Wajah anak tetap terpilih di 9 dari 10 percobaan |
| Kepala menoleh menjauh | Minimal 9 dari 10 terdeteksi |
| Menoleh ke arah pengasuh | Minimal 9 dari 10 tidak terbaca menolak |
| Frame rate | Minimal 15 fps |
| Kunyah bibir tertutup lewat sinyal rahang, dengan makanan asli | Minimal 7 dari 10 terdeteksi |
| Angguk kepala tanpa mengunyah | Minimal 9 dari 10 tidak memicu siklus kunyah |
| Mulut terbuka lama (pura-pura menangis) setelah Suap | Minimal 9 dari 10 tidak terbaca diterima |

Selama uji dengan sendok, catat lama mulut terbuka di setiap suapan. Angka ini yang dipakai untuk `batas_buka_detik`, bukan tebakan.

Gerbang ini menguji kelayakan teknis pada orang dewasa. Hasilnya bukan bukti akurasi pada balita. Di video dan README, klaimnya ditulis: "diuji pada orang dewasa, belum diuji pada balita".

Rencana cadangan:

- Kunyah gagal: kunyahan cuma untuk animasi, akhir jeda pakai timer 15 detik atau tombol Lanjut.
- Mulut terbuka atau menoleh gagal: hasil gigitan pakai tombol pengasuh (Diterima/Ditolak), kamera hanya untuk karakter meniru. Produk tetap bisa didemokan.

### Wajib selesai (inti demo)

- Onboarding singkat dengan skrining.
- Sesi makan penuh: kalibrasi, pemanasan, loop giliran, karakter meniru, perayaan, penolakan.
- 1 karakter, 1 makanan (brokoli, 3 gambar) + gambar umum, 1 sapaan (Mbak), 12–15 klip.
- Tahap 1–3 sebagai saklar sederhana. Tahap 4 cukup tampilan.
- Resep bebas dokter diubah LLM jadi JSON, dikonfirmasi, lalu mengubah sesi keluarga. Ini bagian paling menonjol untuk Technology Innovation.
- Satu ringkasan AI dengan fallback cache.
- Panel ambang dan tombol reset data demo. Wajib sebelum freeze, karena kode tidak boleh diubah setelah 14 Nov.
- Sumber sinyal palsu, untuk pengembangan, tes, dan cadangan demo.

### Disederhanakan untuk lomba

- Dashboard klinik: progres sebagai tabel; grafik hanya jika sempat.
- Peta stiker: cukup stiker penutup.
- Pelacak makanan baru: cukup angka "brokoli dicoba 4/10 kali", karena paparan berulang adalah salah satu bukti terkuat.
- Bagikan laporan: link dengan token acak tanpa masa berlaku. Jangan pakai ID berurutan.
- Kode undangan diganti tombol **Jadikan pasien saya** di halaman laporan yang dibagikan.
- Paywall: tombol mock "Aktifkan program".
- Ringkasan AI: satu versi netral.
- Offline: sesi jalan lokal, service worker hanya menyimpan aset. Tanpa sinkron IndexedDB.
- Sapaan Bu/Oma/Ayah ditunda.
- Login: akun dokter demo + kode akses keluarga.
- Skrining: form checklist biasa.

Ditunda: payment gateway asli, Hand Landmarker, deteksi sendok, banyak karakter dan makanan, rekomendasi menu, notifikasi, integrasi RME, akun klinik kompleks, Supabase, mode makan sendiri otomatis.

Pembagian tim 3 orang ada di tabel jadwal per orang di atas.

## 21. Skrip demo

Satu cerita yang menunjukkan kedua jalur:

1. Cerita Dika dengan label ilustrasi, 30 detik.
2. Keluarga mandiri daftar: profil, skrining, lolos, 30 detik.
3. Pemanasan: karakter berkenalan dengan brokoli, 30 detik.
4. Juri menjadi anak: karakter menggigit, juri membuka mulut dan mengunyah, karakter meniru lalu merayakan, 75 detik.
5. Juri menutup mulut dan menoleh **menjauhi sisi pengasuh** (menoleh ke arah pengasuh tidak dihitung menolak): karakter netral dan singkat, teks pengasuh muncul, 40 detik.
6. Anggota tim menjadi pengasuh dan diajak menggigit duluan, 20 detik.
7. Laporan keluarga dibagikan ke dokter. Dokter menekan Jadikan pasien saya, mengetik aturan bebas, JSON muncul, dikonfirmasi, aplikasi keluarga ikut berubah, 60 detik.
8. Program lepas layar, model bisnis hibrida, dan privasi, 45 detik.

Video submission wajib 3–5 menit tanpa suara presentasi. Gunakan teks di layar.

Cadangan demo: data contoh, klip suara lokal, ringkasan cache, sumber sinyal palsu, dan video rekaman. Saat setup 1 menit di final, ambang disesuaikan dengan cahaya ruangan lewat panel ambang.

## 22. Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Kritik layar saat makan | Dianggap kontra-narasi | Pemanasan di luar makan, redup saat jeda, lepas layar bertahap, pengasuh jadi contoh |
| Karakter interaktif belum terbukti | Juri mempertanyakan bukti | Bahan aktif terbukti, kemasan diuji lewat pilot |
| Anak tergantung pada karakter | Sama seperti YouTube | Syarat naik tahap, ritual dipindah ke pengasuh |
| Jalur mandiri tanpa dokter | Kasus berat terlewat | Skrining wajib, arahkan ke dokter, posisikan sebagai program kebiasaan |
| Marketing B2C mahal | Pengguna sedikit | Jalur klinik sebagai kanal, tombol bagikan ke dokter |
| Deteksi pada balita kurang akurat | Fungsi inti gagal | Tes dini, koreksi pengasuh, klaim terbatas |
| Aset karakter memakan waktu | Jadwal molor | 1 karakter, 1 makanan + gambar umum, mulut SVG parametrik, keputusan rencana B SVG flat di akhir 9 Nov |
| Ambang tidak cocok di ruangan final, kode sudah beku | Demo gagal | Panel ambang saat aplikasi jalan, reset data demo, lampu kecil |
| Fitur AI dianggap gimmick | Nilai Technology Innovation turun | Ringkasan yang menunjukkan pola, resep dari kalimat dokter apa adanya, form manual sebagai cadangan |
| Anak yang terbiasa YouTube bosan dengan karakter yang sengaja datar | Kasus target terberat gagal | Pemanasan dibuat paling menarik; sebut sebagai hipotesis pilot, jangan klaim berhasil |
| Penyisihan dinilai dari video | Tidak masuk Top 8 walau aplikasi lengkap | Video direkam 13 Nov, prioritas cerita dan bukti |
| Jadwal 6 hari padat | Fitur tidak selesai | Form sederhana, pembayaran mock, potong fitur tunda |
| Lisensi free tier | Tidak boleh dipakai jualan | ElevenLabs Starter sebelum jualan, cek hosting |
| Regulasi | Pivot pasca-lomba | Baca KMK, posisikan sebagai prototipe |
| Klinik tidak mau bayar | Jalur B2B2C lemah | Wawancara sebelum pitch, B2C tetap jalan |
| Mirip Talkly | Dipertanyakan juri | Kode baru, kasus dan konsep berbeda, tanya panitia |
| Kompetitor ditemukan | Klaim gugur | Cek manual, ubah klaim |
| Internet final buruk | Demo gagal | Inti offline, ringkasan cache |

## 23. Yang wajib divalidasi

1. Cari di Play Store dan App Store: "anak susah makan", "GTM", "picky eater", "mpasi".
2. Tanya minimal satu dokter anak: apakah karakter dengan lepas layar bertahap bisa diterima? Validasi juga daftar skrining tanda bahaya. Ini hal yang paling bisa menggugurkan konsep.
3. Tanya minimal satu klinik: apakah mau menjual paket program?
4. Wawancara keluarga atau pengasuh: apakah mau bayar Rp 49.000, dan sapaan apa yang terasa natural.
5. Buka paper asli di bagian 5.
6. Baca aturan pemberian makan IDAI asli, KMK 951/2026, dan PP 33/2026.
7. Tes `FaceLandmarker`: akurasi, frame rate, dan HP murah.
8. Cek harga dan lisensi: gpt-6-luna, ElevenLabs free dan Starter, Rive, Vercel, Supabase, hosting gratis alternatif.
9. Tanyakan panitia soal Talkly dan suara aplikasi di video.
10. ~~Cek guidebook penyisihan~~ Selesai 10 Nov: repo + video, tanpa deploy. Sisa: cek grup WA untuk mekanisme submission dan jadwal Integrated Mentoring.
11. Tanya dokter: apakah default naik tahap 5 sesi masuk akal, dan apakah anak yang terbiasa YouTube kira-kira mau menerima karakter.

---

# Bagian II — Cara kerja rinci

Bagian ini menjelaskan apa yang sebenarnya terjadi di balik setiap fitur: siapa menjalankan apa, data apa yang lewat, dan angka apa yang dipakai. Semua angka ambang adalah titik awal dan wajib dituning saat tes.

## II.1 Gambaran besar: siapa menjalankan apa

| Komponen | Jalan di mana | Tugas | Butuh internet? |
|---|---|---|---|
| Aplikasi keluarga (PWA) | Browser HP/laptop keluarga | Onboarding, kamera, deteksi wajah, rule engine, karakter, suara, catatan sesi | Tidak untuk sesi makan; ya untuk sinkron dan laporan AI |
| Dashboard klinik | Browser laptop dokter | Daftar pasien, resep, progres | Ya |
| Server API (Node.js) | Laptop saat lomba, cloud saat produksi | Simpan data, kode akses, kode undangan, proxy LLM, token laporan | — |
| Database | SQLite (laptop), Turso (online lomba), Supabase (produksi) | Menyimpan angka sesi, aturan, profil | — |
| OpenAI gpt-6-luna | Cloud OpenAI | Resep bebas jadi JSON, ringkasan mingguan | Ya, dipanggil server saja |
| ElevenLabs | Hanya saat pengembangan | Membuat klip suara sekali, lalu disimpan sebagai file | Tidak saat dipakai pengguna |

Prinsip penting:

- Video kamera tidak pernah meninggalkan browser. Yang keluar hanya angka (jumlah gigitan, durasi, status).
- Browser keluarga tidak pernah memanggil OpenAI langsung. Semua lewat server supaya API key aman.
- Sesi makan tetap jalan tanpa internet. Hasilnya disimpan dulu di perangkat, lalu dikirim saat online.

## II.2 Peran tiap pihak

| Pihak | Yang dilakukan | Yang didapat |
|---|---|---|
| Orang tua | Daftar, isi skrining, bayar program jalur mandiri, membaca laporan | Waktu makan lebih tenang, progres terlihat |
| Pengasuh/ART | Menjalankan sesi, menekan Suap, ikut menggigit, konfirmasi ngemut | Panduan langsung di dalam permainan |
| Balita | Makan bergiliran dengan karakter | Makan terasa seperti main |
| Dokter | Memeriksa, menulis aturan, mengatur tahap, membaca laporan | Data rumah antar kontrol |
| Klinik | Berlangganan, menjual paket ke keluarga | Layanan tambahan, pasien rujukan |
| Ahli gizi/dokter penasihat | Meninjau kalimat karakter, skrining, program default | Kredibilitas produk |
| Tim Suapin | Membangun, menambah makanan, support, menjaga data | Pendapatan langganan |

## II.3 Proses bisnis

### II.3.1 Jalur keluarga mandiri (B2C)

| Tahap | Apa yang terjadi | Ukuran keberhasilan |
|---|---|---|
| 1. Dikenal | Konten pendek soal GTM dan "detoks YouTube saat makan" di TikTok/Instagram, grup WhatsApp ibu, kerja sama PAUD/daycare | Kunjungan landing |
| 2. Daftar | Landing, tombol Mulai gratis, onboarding 1 menit, skrining | Persentase yang selesai onboarding |
| 3. Aktivasi | Sesi makan pertama di hari yang sama | Persentase yang menjalankan sesi pertama |
| 4. Trial 5 hari | Sesi setiap hari, stiker dan pelacak makanan baru terisi | Sesi per hari |
| 5. Pengingat | Hari ke-4 muncul kartu di beranda: progres anak + "trial sisa 1 hari" | — |
| 6. Bayar | Hari ke-6 paywall: Program 30 Hari Rp 49.000 lewat QRIS/e-wallet | Konversi trial ke bayar |
| 7. Program berjalan | Tahap 1 sampai 4 lepas layar | Naik tahap |
| 8. Lanjutan | Setelah 30 hari, opsi Rp 19.000–29.000 per bulan untuk menu baru dan tahap lanjut | Perpanjangan |
| 9. Lulus | Tahap 4 tercapai, anak makan tanpa aplikasi | Persentase lulus |

Produk ini sengaja membuat keluarga "lulus". Pendapatan per keluarga diperkirakan Rp 49.000–110.000. Pertumbuhan datang dari keluarga baru dan rekomendasi, bukan dari menahan pengguna selamanya.

### II.3.2 Jalur klinik (B2B2C)

| Tahap | Apa yang terjadi |
|---|---|
| 1. Prospek | Dokter anak dan klinik tumbuh kembang di sekitar Surabaya |
| 2. Demo | 15 menit: dokter melihat sesi live dan dashboard |
| 3. Pilot | Gratis 1 bulan untuk maksimal 5 pasien |
| 4. Evaluasi | Lihat data pilot bersama dokter |
| 5. Langganan | Rp 299.000 per bulan, tagihan bulanan lewat payment link atau transfer |
| 6. Onboarding klinik | Akun dokter dibuat, tutorial menulis resep 10 menit |
| 7. Penjualan ke keluarga | Klinik menjual paket program ke pasien. Harga ditentukan klinik (saran Rp 75.000–150.000 per 4 minggu) |
| 8. Pemakaian | Dokter membuat kode undangan, keluarga masuk, dokter memantau |
| 9. Tinjauan bulanan | Laporan pemakaian klinik dikirim ke klinik |

### II.3.3 Jembatan antar jalur

- **Keluarga mandiri ke dokter:** tombol Bagikan laporan membuat link. Dokter membuka link tanpa akun. Jika tertarik, dokter mendaftar sebagai klinik.
- **Tanda bahaya:** keluarga yang gagal skrining diarahkan ke dokter. Saat produksi, ditampilkan daftar klinik mitra terdekat, jadi klinik mendapat pasien baru.
- **Pindah jalur:** keluarga memasukkan kode undangan. Riwayat sesi tetap, `plan` berubah menjadi `klinik`, dan paywall hilang.

### II.3.4 Pembayaran

- **Lomba:** tombol "Aktifkan program" langsung mengubah `plan` menjadi `program`. Tidak ada uang yang bergerak.
- **Produksi:** payment gateway lokal (misalnya Midtrans atau Xendit) dengan QRIS dan e-wallet.
  1. Keluarga menekan bayar, lalu server membuat transaksi di gateway.
  2. Keluarga membayar di halaman gateway.
  3. Gateway mengirim webhook ke server.
  4. Server memeriksa tanda tangan webhook, lalu mengubah `plan` dan tanggal berakhir.
- Klinik dibayar lewat tagihan bulanan, tidak lewat aplikasi keluarga.

### II.3.5 Operasional

- **Support:** WhatsApp bisnis.
- **Hapus data:** tombol di pengaturan menghapus anak beserta semua sesi, gigitan, catatan, dan ringkasan.
- **Konten:** menambah makanan baru dan meninjau kalimat karakter bersama ahli gizi secara berkala.
- **Backup:** saat memakai Supabase free, backup database dijalankan otomatis setiap hari oleh skrip terjadwal milik tim.

## II.4 Status akun keluarga (`plan`)

```text
         daftar + lolos skrining
                  |
                  v
   +----------> trial (5 hari) ----habis----> expired (sesi terkunci, data aman)
   |              |                               |
   |              | bayar                         | bayar
   |              v                               v
   |           program (30 hari) --habis--> lanjutan (bulanan) / expired
   |
   +--- masukkan kode undangan dari status mana pun ---> klinik
```

| Status | Bisa sesi? | Aturan dari | Paywall |
|---|---|---|---|
| `trial` | Ya | Default | Belum |
| `expired` | Tidak, beranda dan laporan tetap bisa dibuka | — | Ya |
| `program` | Ya | Default | Tidak |
| `lanjutan` | Ya | Default | Tidak |
| `klinik` | Ya | Dokter (default sampai dokter mengonfirmasi resep) | Tidak |

Jika skrining menemukan tanda bahaya, akun tetap dibuat tetapi sesi tidak dibuka sampai keluarga memasukkan kode klinik.

## II.5 Onboarding dan skrining secara teknis

1. Pengasuh mengisi panggilan anak, tanggal lahir, sapaan (Mbak/Bu/Oma/Ayah), dan nama pengasuh.
2. Jika usia di luar 3–5 tahun, muncul catatan bahwa program dirancang untuk 3–5 tahun. Pengguna tetap boleh lanjut.
3. Server membuat baris `children` dengan `plan = trial`, `trial_until = sekarang + 5 hari`, dan `kode_akses` acak.
4. `kode_akses` disimpan di perangkat sebagai tanda masuk. Di HP lain, keluarga cukup memasukkan kode yang sama.
5. Skrining berisi 7 pertanyaan ya/tidak (bagian 8). Jawaban disimpan di `screenings`.
6. Satu jawaban "ya" berarti `ada_tanda_bahaya = true`. Layar menampilkan saran ke dokter, dan sesi tidak dibuka.
7. Jika semua "tidak", program default ditulis ke `rules` dengan `source = default`, `stage = 1`.
8. Pengasuh memilih menu dari daftar makanan yang punya gambar.

## II.6 Sesi makan secara teknis

### II.6.1 Persiapan kamera

1. Browser meminta izin kamera (`getUserMedia`). Kamera hanya jalan di `localhost` atau HTTPS.
2. Video kamera tampil kecil di pojok untuk pengasuh, tidak direkam dan tidak dikirim.
3. FaceLandmarker dimuat dari file lokal (WASM + model `.task`) dengan `runningMode: VIDEO`, `outputFaceBlendshapes: true`, `outputFacialTransformationMatrixes: true`, `numFaces: 2` (pengasuh bisa ikut masuk kamera, lihat II.6.2).
4. Setiap frame (dibatasi 15–20 kali per detik), `detectForVideo` mengeluarkan:
   - nilai `jawOpen` 0–1,
   - matriks posisi kepala,
   - status wajah ditemukan atau tidak.

### II.6.2 Persiapan posisi dan kalibrasi

Wajah dan posisi kamera setiap anak berbeda, jadi sistem mengukur kondisi normal dulu.

1. Pengasuh memilih sisi duduknya terhadap anak: kiri atau kanan. Ini dipakai untuk membedakan menoleh ke sendok dari menoleh menolak.
2. Pengasuh memilih mode: disuapi atau makan sendiri.
3. Karakter berkata "Lihat aku dulu ya!" dan sistem mencatat arah kepala normal sebagai `baseline_yaw`.
4. Balita jarang mau diam 3 detik, jadi baseline mulut dan rahang tidak bergantung pada kalibrasi saja. Sistem memakai **baseline bergulir**: nilai rendah (persentil 20) dari 10 detik terakhir saat tidak ada suapan, diperbarui terus.
5. Jika wajah tidak stabil terlihat, muncul pesan untuk memindahkan HP atau menambah cahaya.
6. Wajah anak dipilih saat kalibrasi: wajah yang paling tengah dan paling besar di frame. Jika salah, pengasuh mengetuk wajah yang benar di pratinjau kamera. Setelah itu, jika ada dua wajah (pengasuh ikut masuk saat menggigit duluan), sistem memilih wajah yang posisi dan ukurannya paling dekat dengan wajah anak di frame sebelumnya.
7. Sinyal 3 detik terakhir disimpan terus di buffer, supaya mulut yang sudah terbuka sebelum Suap ditekan tetap terbaca.

### II.6.3 Mengolah sinyal

- `mulut = jawOpen − baseline_mulut`, dihaluskan: `mulut_halus = 0,4 × mulut + 0,6 × mulut_halus_sebelumnya`.
- `rahang = jarak(dagu, ujung hidung) / jarak(dahi, dagu)`, lalu dikurangi baseline bergulir dan dihaluskan dengan cara yang sama. Jika angguk kepala memicu siklus palsu saat tes, ketiga titik diputar dulu ke koordinat lokal wajah memakai kebalikan matriks transformasi, baru jaraknya dihitung.
- `yaw = sudut kiri-kanan dari matriks kepala − baseline_yaw`. Tanda positif atau negatif dicocokkan dengan sisi duduk pengasuh.
- `terlihat = wajah anak ditemukan` pada frame itu.
- `nangis = rata-rata eyeSquintLeft/Right dan browDownLeft/Right` di atas ambang bersamaan dengan mulut terbuka. Hanya dugaan, belum dites.
- Semua sinyal dikirim ke rule engine dalam satu bentuk data: `{ t, mulut, rahang, yaw, nangis, terlihat }`. Bentuk ini dikunci 9 Nov, supaya karakter dan rule engine bisa dikerjakan memakai **sumber sinyal palsu** (slider di layar dan rekaman ulang landmark dari file JSON) tanpa menunggu kamera. Sumber palsu yang sama dipakai untuk tes dan cadangan demo.

### II.6.4 Penghitung kunyahan

Mengunyah terlihat sebagai rahang naik turun berulang, termasuk saat bibir tertutup.

```text
getar_diam = simpangan baku rahang_halus di jendela baseline bergulir
             (10 detik terakhir tanpa suapan dan tanpa kunyah aktif)
ambang = 3 × getar_diam (minimal batas bawah kecil supaya tidak nol)

setiap frame:
  jika arah = naik dan rahang_halus mulai turun:
      puncak = rahang_halus, arah = turun
  jika arah = turun dan rahang_halus mulai naik:
      jika puncak − rahang_halus >= ambang:
          catat waktu siklus
      arah = naik

mengunyah_aktif = minimal 3 siklus dalam 3 detik terakhir
                  dan jarak antar siklus 0,4–1,25 detik (0,8–2,5 Hz)
kunyah_selesai  = tidak ada siklus selama 4 detik
```

Fungsi ini murni (input angka, output angka), jadi bisa dites dengan Vitest memakai deret angka buatan. Kunyahan tidak menentukan hasil gigitan.

### II.6.5 Rule engine: state machine sesi

Rule engine menerima tiga jenis kejadian: sinyal per frame, tombol pengasuh (Suap, Ya/Tidak ngemut, Stop), dan timer. Hasilnya adalah perintah: putar klip, tampilkan teks, ubah pose karakter, redupkan layar, catat gigitan.

| Status | Masuk ketika | Yang terjadi | Keluar ke |
|---|---|---|---|
| `KALIBRASI` | Sesi dimulai | Mengukur baseline 3 detik | `PEMANASAN` |
| `PEMANASAN` | Kalibrasi selesai | Animasi berkenalan dengan makanan, 2–3 menit, ada tombol lewati | `GILIRAN_KARAKTER` |
| `GILIRAN_KARAKTER` | Awal loop | Karakter menggigit (urutan gambar), klip "Enak!", lalu "Sekarang Dika!". Kadang klip mengajak pengasuh menggigit | `MENUNGGU_SUAP` setelah 3–5 detik |
| `MENUNGGU_SUAP` | Giliran anak | Karakter membuka mulut menunggu dan meniru wajah anak | `MENILAI` saat Suap ditekan. Jika 60 detik tanpa Suap, teks "Tawarkan suapan kecil" |
| `MENILAI` | Suap ditekan | Jendela 6 detik dimulai saat itu juga, ditambah buffer 3 detik sebelum Suap. Jika mulut masih terbuka saat jendela habis, jendela diperpanjang sampai mulut tertutup (maksimal 12 detik). Tidak ada deteksi oklusi khusus; sendok dan tangan bisa membuat nilai ngawur, jadi yang dicari adalah transisi buka ke tutup | `DITERIMA` jika `mulut_halus` di atas ambang terbuka (awal 0,3) minimal 0,3 detik lalu turun di dalam jendela, termasuk jika mulut sudah terbuka sebelum Suap; lama buka tidak melewati `batas_buka_detik` (awal 4 detik, disetel dari tes menyuap); `nangis` tidak aktif; kepala tidak menoleh menjauh. `MENOLAK` jika menoleh menjauhi sisi pengasuh lebih dari 25° selama 1 detik, atau mulut tidak pernah terbuka sepanjang jendela dan rahang tidak bergerak. `TIDAK_PASTI` jika jendela habis tanpa keduanya |
| `DITERIMA` | Transisi buka ke tutup di jendela | Karakter merayakan sekali, baru setelah mulut tertutup (klip "Hore!"), gigitan dicatat `diterima` | `JEDA_KUNYAH` setelah perayaan 2 detik |
| `JEDA_KUNYAH` | Setelah perayaan | Layar redup, karakter mengunyah pelan meniru gerak rahang anak | `GILIRAN_KARAKTER` saat kunyah selesai, timer 15 detik habis, atau tombol Lanjut; `KEMUNGKINAN_NGEMUT` jika rahang hampir diam dan mulut tertutup lebih dari 15 detik (hanya jika deteksi kunyah lolos gerbang) |
| `KEMUNGKINAN_NGEMUT` | Dugaan ngemut | Teks "Sepertinya ngemut? Ya / Tidak" | Ya: gigitan ditandai `ngemut`, teks saran dari aturan, lalu `GILIRAN_KARAKTER`. Tidak: `GILIRAN_KARAKTER` |
| `MENOLAK` | Penolakan terbaca | Karakter netral dan singkat ("Nanti lagi ya"), tanpa animasi lucu. Teks "Jangan dibujuk". Gigitan dicatat `ditolak` | `GILIRAN_KARAKTER` setelah 60 detik |
| `TIDAK_PASTI` | Jendela habis tanpa hasil jelas | Karakter diam menunggu, teks "Tadi masuk? Ya / Tidak" | Ya: dicatat `diterima` (dikoreksi), perayaan singkat, `JEDA_KUNYAH`. Tidak: dicatat `ditolak`, `GILIRAN_KARAKTER`. Tidak dijawab 10 detik: tidak dicatat, `GILIRAN_KARAKTER` |
| `SELESAI` | Batas waktu, batas menolak, atau Stop | Klip penutup, stiker, form porsi dan mood | — |

Catatan:

- Jika Suap ditekan saat rahang anak masih bergerak (masih mengunyah suapan sebelumnya), sistem menampilkan "Masih ngunyah, tunggu" dan tidak menilai.
- Mulut terbuka di luar jendela penilaian dan di luar buffer 3 detik sebelum Suap (tertawa, bicara) tidak dihitung.
- Suap bisa ditekan dari status mana pun di loop dan langsung masuk `MENILAI`.

**Mode makan sendiri.** Anak 3–5 tahun dianjurkan mulai makan sendiri, jadi tidak selalu ada yang menekan Suap. Di mode ini, kejadian "suapan" dibuat otomatis saat mulut terbuka lebar lalu tertutup dan diikuti gerak rahang. Karena lebih rawan salah baca, mode ini ditunda setelah lomba; di MVP pengasuh tetap menekan Suap saat anak menyendok sendiri.

Aturan global yang dicek setiap detik:

- Waktu sesi ≥ `max_minutes`: ke `SELESAI` dengan klip "Waktunya selesai".
- Tidak ada gigitan diterima selama `end_after_refusal_minutes`: ke `SELESAI` dengan teks "Akhiri makan, tidak apa-apa".
- Tidak terlihat: penilaian berhenti dan karakter menunggu. Timer sesi tetap berjalan.
- Stop: langsung `SELESAI`. Tombol darurat menampilkan instruksi mencari bantuan medis.
- Pengasuh selalu bisa mengoreksi hasil gigitan terakhir (diterima/ditolak).

**Panel ambang.** Semua angka ambang (`ambang terbuka`, `batas_buka_detik`, sudut menoleh, ambang `nangis`, ambang kunyah, fps) dibaca dari satu objek pengaturan. Objek ini bisa diubah lewat panel tersembunyi saat aplikasi jalan dan disimpan di browser, jadi menyesuaikan ruangan final 29 Nov tidak perlu mengubah kode yang sudah dibekukan 14 Nov. Panel juga punya tombol **Reset data demo** yang mengembalikan database ke data contoh.

State machine ditulis sebagai fungsi murni `next(state, event) -> (state, commands)`, jadi bisa dites tanpa kamera.

### II.6.6 Karakter: cara meniru wajah

Karakter terdiri dari lapisan gambar yang ditumpuk:

```text
latar
badan          (goyang pelan dengan CSS)
kepala
mata           (buka / tutup, kedip acak tiap 3–6 detik)
mulut          (SVG parametrik, bukaan langsung dari angka)
tangan + makanan (saat menggigit)
lapisan redup  (hitam transparan, aktif saat JEDA_KUNYAH)
```

Mulut digambar di kode sebagai satu bentuk SVG (bibir atas, bibir bawah, rongga mulut) di atas lapisan kepala. Dengan cara ini tidak perlu 6 gambar mulut yang harus konsisten, dan gerakannya lebih halus.

| Kondisi | Mulut |
|---|---|
| Meniru | Tinggi bukaan = `mulut_halus` × maksimum, dibatasi 0–1, berubah tiap frame |
| Mengunyah aktif | Bukaan mengikuti sinyal rahang, naik turun sesuai siklus |
| Perayaan | Bentuk senyum lebar (path SVG tetap) |
| Rencana B (gambar mulut) | 4 gambar: tutup (< 0,10), sedikit buka (0,10–0,25), buka (0,25–0,45), buka lebar (> 0,45) |

- Meniru hanya aktif di `MENUNGGU_SUAP`, `MENILAI`, `DITERIMA`, dan `JEDA_KUNYAH`. Saat jeda kunyah, mulut karakter mengikuti sinyal rahang, bukan `jawOpen`. Di `GILIRAN_KARAKTER` dan `PEMANASAN`, gerakan karakter memakai urutan tetap.
- Mulut SVG cukup memakai sinyal yang sudah dihaluskan. Pada rencana B, pergantian gambar mulut diberi jeda minimal 80 ms supaya tidak berkedip-kedip.
- Urutan menggigit: tangan membawa makanan ke mulut, mulut buka lebar, gambar makanan berganti ke "digigit 1", mulut tutup, kunyah 3 kali, ekspresi enak.

### II.6.7 Suara

- Semua klip MP3 dimuat di awal sesi dan disimpan oleh service worker.
- Hanya satu klip diputar dalam satu waktu. Klip baru menunggu klip lama selesai.
- Klip yang sama tidak diulang dalam 20 detik. Setiap jenis klip punya 2–3 variasi kalimat.
- Klip yang menyebut pengasuh dipilih sesuai sapaan (`mbak_gigit_duluan.mp3`, `bu_gigit_duluan.mp3`, dan seterusnya).
- Pada tahap 3, layar hitam penuh tetapi suara tetap jalan.

### II.6.8 Teks untuk pengasuh

- Tampil di strip bawah layar, ukuran kecil, tanpa suara.
- Hilang sendiri setelah 8 detik, kecuali pertanyaan Ya/Tidak.
- Teks yang sama tidak muncul lagi dalam 60 detik.

### II.6.9 Menyimpan hasil sesi

1. Selama sesi, setiap gigitan disimpan di memori: waktu, hasil, dikoreksi atau tidak.
2. Saat `SELESAI`, aplikasi mengirim ringkasan sesi dan daftar gigitan ke `POST /api/sessions`.
3. Produksi: jika offline, data disimpan di IndexedDB dan dikirim otomatis saat online. Lomba: server jalan di laptop yang sama, jadi antrean offline tidak dibuat.
4. Setelah tersimpan, server mengecek syarat naik tahap (II.7) dan memperbarui pelacak makanan baru (II.8).

## II.7 Program lepas layar secara teknis

Setiap tahap adalah kumpulan saklar yang dibaca aplikasi:

| Tahap | `layar` | `karakter_menggigit` | `ajak_pengasuh_gigit` | `suara` |
|---|---|---|---|---|
| 1 | Nyala | Ya | Kadang | Ya |
| 2 | Nyala, karakter hanya muncul saat giliran | Tidak | Selalu | Ya |
| 3 | Hitam penuh, hanya strip teks pengasuh. Browser tidak bisa mengatur kecerahan atau mematikan layar; layar hitam paling hemat di layar OLED | Tidak | Selalu | Ya |
| 4 | Aplikasi hanya untuk mencatat | — | — | Tidak |

Cek naik tahap setiap sesi selesai:

```text
ambil N sesi terakhir (N = advance_rule.sessions)
jika semua sesi itu punya gigitan diterima >= advance_rule.min_accepted_bites:
    jalur mandiri -> naik tahap otomatis, beri tahu keluarga
    jalur klinik  -> tandai "siap naik tahap" di dashboard, dokter yang menaikkan
```

Jika di tahap baru anak menolak terus selama 3 sesi berturut-turut, aplikasi menyarankan kembali ke tahap sebelumnya. Di jalur klinik, saran ini dikirim ke dokter.

## II.8 Pelacak makanan baru

1. Pengasuh menandai menu sebagai "makanan baru" saat memilih menu.
2. Satu sesi dengan makanan baru dan minimal satu gigitan diterima dihitung satu paparan.
3. Target 8–10 paparan per makanan, tampil sebagai jalur langkah di beranda.
4. Setelah 10 paparan, makanan pindah ke daftar "sudah kenal".

## II.9 Dashboard klinik dan resep AI

### Alur resep

1. Dokter menulis aturan dengan bahasa bebas, misalnya: "Maksimal 20 menit, 2 kali sehari, kalau ngemut tawarkan air sedikit, akhiri kalau 10 menit menolak, mulai tahap 1."
2. Dashboard mengirim teks ke `POST /api/rules/parse`.
3. Server memanggil gpt-6-luna dengan format output JSON yang ditentukan (structured output) dan instruksi: hanya ubah teks menjadi kolom yang tersedia, jangan menambah saran medis.
4. Server memeriksa hasil dengan validator skema dan membatasi nilai ke rentang aman:

| Kolom | Rentang aman |
|---|---|
| `max_minutes` | 10–30 |
| `end_after_refusal_minutes` | 5–15 |
| `stage` | 1–4 |
| `advance_rule.sessions` | 1–7 |
| `advance_rule.min_accepted_bites` | 1–15 |
| `ngemut_hint` | Teks maksimal 100 karakter, hanya tampil ke pengasuh |

5. Jika ada nilai di luar rentang atau tidak terbaca, kolom itu ditandai garis jagung (tanpa merah) dan dokter mengisinya manual.
6. Dokter melihat tabel hasil berdampingan dengan teks aslinya, lalu menekan Konfirmasi.
7. Server menyimpan versi baru di `rules` dengan `source = dokter`. Versi lama tetap tersimpan.
8. Aplikasi keluarga mengambil aturan terbaru setiap awal sesi.

Jika LLM gagal atau offline, dokter tetap bisa mengisi form aturan secara manual.

### Tampilan pasien

- Grafik gigitan diterima dan ditolak per sesi.
- Durasi sesi dan sesi yang melewati batas.
- Tahap sekarang dan tanda "siap naik tahap".
- Ngemut yang dikonfirmasi.
- Paparan makanan baru.
- Ringkasan AI mingguan.

## II.10 Ringkasan mingguan AI

1. Server mengumpulkan angka satu minggu: jumlah sesi, rata-rata durasi, gigitan diterima dan ditolak, ngemut, tahap, paparan makanan baru, catatan mood, ditambah data per sesi (jam mulai, menu, diterima, ditolak, ngemut). LLM diminta menunjukkan 1–2 pola yang terlihat dari data, misalnya penolakan lebih tinggi di sesi malam atau ngemut sering muncul saat nasi, tanpa diagnosis atau saran menu. Inilah yang membedakannya dari template.
2. Angka dikirim ke gpt-6-luna dalam bentuk JSON, tanpa nama lengkap anak.
3. Dua versi dibuat:
   - **Keluarga:** bahasa sederhana dan menyemangati, tanpa istilah medis.
   - **Dokter:** ringkas dan faktual.
4. Hasil disimpan di `weekly_summaries`, jadi tidak dibuat ulang setiap halaman dibuka.
5. Jika LLM gagal, server memakai template teks biasa berisi angka yang sama.
6. Setiap ringkasan diberi label "Dibuat oleh AI dari data sesi".

Contoh input:

```json
{
  "minggu": "2026-W46",
  "sesi": 9,
  "rata_durasi_menit": 18,
  "gigitan_diterima": 54,
  "gigitan_ditolak": 12,
  "ngemut_dikonfirmasi": 3,
  "tahap": 1,
  "siap_naik_tahap": true,
  "paparan_baru": { "brokoli": 4 }
}
```

## II.11 Bagikan laporan dan kode undangan

**Bagikan laporan**

1. Keluarga menekan Bagikan ke dokter.
2. Server membuat token acak panjang dan menyimpannya di `shared_reports` dengan masa berlaku 14 hari. Versi lomba: tanpa masa berlaku, tetapi token tetap acak panjang.
3. Keluarga mendapat link `/r/<token>` untuk dikirim lewat WhatsApp atau ditunjukkan saat kontrol.
4. Halaman itu hanya bisa dibaca: grafik, tahap, dan ringkasan versi dokter.
5. Keluarga bisa mencabut link kapan saja.

**Kode undangan**

1. Dokter menekan Buat kode. Server membuat kode 6 karakter, sekali pakai, berlaku 7 hari.
2. Keluarga memasukkan kode saat onboarding atau dari beranda.
3. Server mengisi `children.clinic_id` dan mengubah `plan` menjadi `klinik`.
4. Anak muncul di daftar pasien dokter. Aturan default tetap dipakai sampai dokter mengonfirmasi resep.

**Versi lomba:** kode undangan diganti tombol **Jadikan pasien saya** di halaman laporan yang dibagikan. Dokter yang sudah login menekan tombol itu, lalu server menjalankan langkah 3 dan 4 secara langsung.

## II.12 Program default (jalur mandiri)

```json
{
  "max_minutes": 30,
  "stage": 1,
  "advance_rule": { "sessions": 5, "min_accepted_bites": 5 },
  "end_after_refusal_minutes": 15,
  "ngemut_hint": "Tunggu sebentar, tawarkan minum sedikit, jangan dipaksa menelan"
}
```

Nilai ini mengikuti aturan makan IDAI dan wajib ditinjau dokter penasihat sebelum dipakai. Naik tahap memakai 5 sesi, bukan 3, karena belum ada bukti seberapa cepat bantuan layar boleh dikurangi.

## II.13 PWA dan offline

- Service worker menyimpan: kode aplikasi, model FaceLandmarker, file WASM, gambar karakter dan makanan, serta semua klip suara.
- Yang jalan tanpa internet: sesi makan lengkap, stiker, catatan.
- Yang butuh internet: sinkron data, resep dokter terbaru, ringkasan AI, bagikan laporan, pembayaran.
- Saat final lomba, server dan database jalan di laptop yang sama, jadi semuanya tetap jalan tanpa internet kecuali panggilan LLM. LLM memakai ringkasan cache sebagai cadangan.

## II.14 Produksi aset

### Karakter

1. Buat satu ilustrasi karakter (ilustrator atau AI image), menghadap depan, latar polos.
2. Rapikan dan pisahkan lapisan di editor gambar: badan, kepala, mata buka, mata tutup, tangan. Mulut tidak digambar sebagai PNG; dibuat SVG parametrik di kode.
3. Ekspor tiap lapisan sebagai PNG/WebP transparan dengan ukuran kanvas yang sama supaya posisinya pas saat ditumpuk.
4. Buat 5 ekspresi dengan mengganti mata dan alis: netral, menunggu, enak, merayakan, santai.
5. Akhir 9 Nov: jika ilustrasi belum bagus atau lapisannya tidak pas, pakai SVG flat dari bentuk sederhana.

### Makanan

Setiap makanan butuh 3 gambar dengan kanvas yang sama: utuh, digigit 1, digigit 2. Ditambah satu gambar umum (sendok/mangkuk) untuk menu di luar daftar.

### Suara

1. Tulis daftar kalimat di spreadsheet: id klip, jenis, kalimat, sapaan.
2. Minta ahli gizi atau dokter meninjau kalimatnya.
3. Buat klip di ElevenLabs dengan satu suara karakter yang konsisten.
4. Simpan sebagai MP3 dengan nama sesuai id klip, dan samakan volumenya.

### Penamaan file

```text
assets/character/body.webp, head.webp, eyes_open.webp, eyes_closed.webp
(mulut: komponen SVG di src/character/Mouth.tsx; rencana B: mouth_closed.webp ... mouth_wide.webp)
assets/food/brokoli_0.webp, brokoli_1.webp, brokoli_2.webp, umum_0.webp ...
assets/audio/giliran_anak_1.mp3, mbak_gigit_duluan.mp3, hore_2.mp3 ...
```

## II.15 Struktur repo dan API

### Repo

```text
suapin/
  web/                        aplikasi keluarga + dashboard klinik (React)
    src/vision/               faceTracker.ts, chewCounter.ts, headPose.ts
    src/engine/               sessionMachine.ts, stageRules.ts
    src/character/            Character.tsx, Mouth.tsx
    src/dev/                  fakeSignal.ts (slider + rekaman ulang), ThresholdPanel.tsx
    src/audio/                clipPlayer.ts
    src/pages/family/         onboarding, beranda, sesi, laporan, langganan
    src/pages/clinic/         masuk, pasien, detail pasien, undang
    public/assets/            gambar, klip, model
  server/                     API Node.js + Hono (lokal: node-server, online: Vercel Functions)
    src/routes/               children, screenings, sessions, rules, reports, invites, plan, clinic
    src/llm/                  parseRules.ts, weeklySummary.ts, fallbackTemplates.ts
    src/db/                   schema.ts (Drizzle), seed.ts, client.ts (baca DATABASE_URL)
  tests/                      chewCounter, sessionMachine, stageRules, parseRules (validasi)
  README.md
```

### Endpoint

| Endpoint | Fungsi |
|---|---|
| `POST /api/children` | Onboarding, membuat anak dan kode akses |
| `POST /api/screenings` | Menyimpan skrining, menulis program default jika aman |
| `GET /api/children/:id/rules` | Aturan aktif untuk sesi |
| `POST /api/sessions` | Menyimpan sesi dan gigitan, cek naik tahap |
| `GET /api/children/:id/report` | Data beranda dan laporan keluarga |
| `POST /api/reports/share` | Membuat token bagikan |
| `GET /api/r/:token` | Laporan untuk dokter |
| `POST /api/invites/redeem` | Keluarga memakai kode undangan (produksi) |
| `POST /api/clinic/claim/:token` | Versi lomba: dokter menekan Jadikan pasien saya dari laporan bagikan |
| `POST /api/plan/activate` | Aktivasi program (lomba: mock) |
| `POST /api/clinic/login` | Login dokter |
| `GET /api/clinic/patients` | Daftar pasien |
| `POST /api/invites` | Dokter membuat kode undangan |
| `POST /api/rules/parse` | Resep bebas ke JSON lewat LLM |
| `POST /api/rules/confirm` | Dokter mengonfirmasi aturan |
| `POST /api/summaries/:childId` | Membuat ringkasan mingguan |

### Akses

- **Lomba:** keluarga memakai `kode_akses` sebagai tanda masuk; dokter memakai akun demo dengan session cookie.
- **Produksi:** Supabase Auth (OTP nomor HP atau magic link), dan aturan akses database supaya klinik hanya melihat pasiennya.

## II.16 Tes dan uji akurasi

| Yang dites | Cara |
|---|---|
| Penghitung kunyahan | Deret angka sinyal rahang buatan: diam, mengunyah 1,5 Hz, bicara, angguk kepala, gerakan acak |
| Penilaian suapan | Deret `jawOpen` dan yaw buatan: buka lalu tutup, sudah terbuka sebelum Suap, "aaa" 3 detik lalu tutup, buka lama (menangis), jendela habis tanpa hasil (tidak pasti), menoleh ke pengasuh, menoleh menjauh |
| State machine | Urutan kejadian buatan: Suap lalu mengunyah, Suap lalu menoleh, ngemut, batas waktu |
| Naik tahap | Data sesi buatan memenuhi dan tidak memenuhi syarat |
| Validasi resep | JSON LLM dengan nilai di luar rentang harus ditolak atau dibatasi |
| Akurasi nyata | Rekam 10–20 sesi orang dewasa dengan izin, disuapi dengan sendok dan makanan asli, catat lama buka mulut tiap suapan, label manual, hitung precision, recall, F1 untuk diterima, menolak, dan mengunyah. Klaim: "diuji pada orang dewasa, belum pada balita" |
| Performa | Frame rate di laptop final dan satu HP murah |

## II.17 Contoh satu minggu: Dika (ilustrasi)

| Hari | Yang terjadi |
|---|---|
| Senin pagi | Ibu Dika melihat video di Instagram, daftar, lolos skrining, memilih nasi + brokoli (brokoli ditandai makanan baru) |
| Senin siang | Mbak Rina menjalankan sesi pertama. Dika menerima 4 gigitan, menolak 3 kali, sesi selesai di menit ke-22. Dapat stiker |
| Selasa–Kamis | Sesi setiap hari. Dika mulai menunggu giliran dan tertawa saat karakter meniru mulutnya |
| Kamis | Kartu di beranda: "Dika menerima 6 gigitan per sesi. Trial sisa 1 hari" |
| Jumat | Ibu membayar Program 30 Hari |
| Sabtu | Syarat terpenuhi, naik ke tahap 2. Karakter tidak menggigit lagi; Mbak Rina yang diajak menggigit duluan |
| Minggu | Ringkasan AI mingguan muncul. Ibu membagikan laporan ke dokter anak untuk kontrol berikutnya |
| Kontrol | Dokter membuka link, tertarik, mendaftar sebagai klinik, memberi kode undangan, dan menulis aturan "maksimal 20 menit". Versi lomba: dokter menekan Jadikan pasien saya di laporan yang dibagikan |

## II.18 Glosarium

| Istilah | Arti |
|---|---|
| GTM | Gerakan tutup mulut, anak menolak makan |
| PWA | Website yang bisa di-install seperti aplikasi dan jalan offline |
| FaceLandmarker | Model AI dari Google MediaPipe yang membaca titik-titik wajah di browser |
| Blendshape `jawOpen` | Angka 0–1 dari FaceLandmarker yang menunjukkan seberapa lebar mulut terbuka |
| Baseline | Nilai normal saat diam, diukur saat kalibrasi |
| Rule engine | Kode yang memutuskan reaksi berdasarkan sinyal dan aturan, tanpa AI generatif |
| State machine | Cara menulis rule engine sebagai daftar status dan perpindahannya |
| Modeling | Anak belajar dengan meniru orang atau karakter yang dicontohkan |
| Paparan berulang | Menawarkan makanan yang sama berkali-kali sampai anak menerima |
| Lepas layar (fading) | Mengurangi bantuan layar bertahap sampai tidak dibutuhkan |
| Ngemut | Makanan ditahan di mulut tanpa dikunyah atau ditelan |
| PNGtuber | Karakter dari lapisan gambar yang mulutnya berganti mengikuti input |
| Structured output | Fitur LLM untuk memaksa jawaban berbentuk JSON sesuai skema |
| Token bagikan | Kode acak panjang di link laporan supaya hanya pemegang link yang bisa membuka |
| Baseline bergulir | Nilai normal yang terus diperbarui dari beberapa detik terakhir, bukan diukur sekali |
| Wake Lock | Fitur browser yang mencegah layar HP mati sendiri |

## II.19 Celah teknis dan penanganan

Tinjauan kritis 8 November 2026. Prioritas: **Tinggi** = bisa menggagalkan inti produk atau demo, **Sedang** = mengganggu pemakaian nyata, **Rendah** = perlu dicatat.

### Deteksi dan kamera

| Prioritas | Celah | Dampak | Penanganan | Kapan |
|---|---|---|---|---|
| Tinggi | Kunyah dengan bibir tertutup tidak terbaca `jawOpen` | Jeda kunyah dan ngemut salah | Sinyal rahang dagu-hidung, ambang relatif, cadangan timer/tombol Lanjut | MVP |
| Tinggi | Jeda sendok 2,5 detik melewatkan momen mulut terbuka | Suapan diterima terbaca menolak | Penilaian mulai saat Suap | MVP |
| Tinggi | FaceLandmarker tidak memberi tanda oklusi; sendok atau tangan membuat nilai ngawur | Hasil salah | Tidak membuat deteksi oklusi; cukup urutan buka lalu tutup + koreksi pengasuh. Opsi: tandai lonjakan gerak titik mulut | MVP |
| Tinggi | Menangis atau berteriak "nggak mau" membuka mulut di jendela | Karakter merayakan penolakan | Batas `batas_buka_detik` (awal 4 detik, dari tes menyuap) + dugaan `nangis` dari mata dan alis; perayaan setelah mulut tertutup; teriakan pendek dikoreksi pengasuh | MVP, diuji 9 Nov |
| Tinggi | Balita membuka mulut sejak sendok mendekat dan menahannya, atau mulut sudah terbuka saat Suap | Suapan sungguhan tidak terbaca diterima | Transisi buka ke tutup, buffer 3 detik sebelum Suap, jendela diperpanjang selama mulut terbuka, batas lama buka diukur dari tes | MVP, diuji 9 Nov |
| Tinggi | Jendela habis tanpa diterima atau menolak | State machine tidak punya hasil | Status `TIDAK_PASTI`, pengasuh menjawab Ya / Tidak | MVP |
| Tinggi | Wajah pengasuh terpilih sebagai wajah anak di awal sesi | Seluruh sesi salah baca | Pilih wajah paling tengah dan besar saat kalibrasi; pengasuh bisa mengetuk wajah yang benar | MVP |
| Tinggi | Gerbang tanpa sendok asli tidak menguji nilai ngawur saat sendok masuk | Lolos gerbang tetapi gagal saat dipakai | Uji diulang dengan sendok dan makanan sungguhan | Tes 9 Nov |
| Sedang | Jarak dagu-hidung ikut berubah saat kepala mengangguk | Siklus kunyah palsu | Diuji 9 Nov; jika terjadi, hitung jarak di koordinat lokal wajah | Tes 9 Nov |
| Sedang | Gerbang diuji pada 3 orang dewasa | Bisa disalahartikan sebagai bukti untuk balita | Klaim "diuji pada dewasa, belum pada balita" di video dan README | MVP |
| Tinggi | Anak menoleh ke pengasuh untuk mengambil suapan | Terbaca menolak | Sisi duduk pengasuh diisi saat persiapan; menolak hanya jika menoleh menjauh | MVP |
| Tinggi | Wajah pengasuh ikut masuk kamera saat "gigit duluan" | Sistem membaca wajah yang salah | `numFaces: 2`, pilih wajah yang paling dekat dengan posisi anak sebelumnya | MVP |
| Tinggi | Anak tertawa atau bicara, mulut terbuka | Gigitan palsu | Hanya mulut terbuka di jendela setelah Suap yang dihitung; pengasuh bisa koreksi | MVP |
| Sedang | Balita tidak mau diam 3 detik untuk kalibrasi | Baseline salah | Baseline bergulir | MVP |
| Sedang | Masih mengunyah tetapi Suap ditekan | Terbaca menolak | Rahang bergerak = "Masih ngunyah, tunggu", tidak dinilai | MVP |
| Sedang | Anak makan sendiri, tidak ada yang menekan Suap | Tidak ada kejadian suapan | MVP: pengasuh tetap menekan Suap. Setelah lomba: mode makan sendiri otomatis | Setelah lomba |
| Sedang | Lengan dan sendok pengasuh sering menutupi wajah | Banyak frame hilang atau ngawur | Wajah yang hilang = tidak terlihat; nilai ngawur ditangani syarat buka lalu tutup + koreksi pengasuh; saran posisi HP sedikit menyamping dari arah suapan | Tes 9 Nov |
| Sedang | Makan lesehan, posisi rendah, cahaya redup | Wajah tidak terbaca | Pesan posisi dan cahaya, dudukan HP | Tes setelah lomba |
| Rendah | Menelan tidak bisa dilihat kamera | Ngemut hanya dugaan | Sudah ditangani: konfirmasi pengasuh | MVP |

### Perangkat dan browser

| Prioritas | Celah | Dampak | Penanganan | Kapan |
|---|---|---|---|---|
| Tinggi | Layar HP mati sendiri saat sesi 20–30 menit | Kamera dan sesi berhenti | Screen Wake Lock API selama sesi | MVP |
| Tinggi | Browser memblokir suara sebelum ada sentuhan pengguna | Klip pertama tidak bunyi | Tombol "Mulai makan" sekaligus membuka izin audio | MVP |
| Tinggi | "Layar mati" di tahap 3 tidak bisa dilakukan dari web, dan browser tidak bisa mengatur kecerahan | Kamera ikut mati jika layar mati | Tahap 3 memakai layar hitam penuh (paling hemat di layar OLED), kamera tetap jalan. Jangan klaim layar mati | MVP |
| Sedang | HP murah: 15 fps + animasi + suara selama 20 menit bikin panas dan boros baterai | Lag, deteksi melambat | Turunkan ke 10 fps di HP, delegate GPU, gambar WebP kecil, tes di HP murah | Setelah lomba |
| Sedang | Tab berpindah atau HP terkunci | Kamera berhenti diam-diam | Deteksi `visibilitychange`, jeda sesi dan minta lanjut | MVP |
| Sedang | Kamera di PWA mode standalone iOS bisa berperilaku berbeda | Gagal di iPhone | Tes iOS; jika gagal, buka lewat Safari biasa | Setelah lomba |
| Rendah | HP kena makanan atau ditarik anak | Perangkat kotor atau jatuh | Saran dudukan HP di luar jangkauan tangan anak | Panduan |

### Perilaku dan klinis

| Prioritas | Celah | Dampak | Penanganan | Kapan |
|---|---|---|---|---|
| Tinggi | Respons lucu atau ramah saat anak menolak bisa menjadi hadiah | Penolakan makin sering | Respons menolak dibuat datar dan singkat; perayaan hanya untuk diterima | MVP |
| Tinggi | Anak lebih tertarik karakter daripada makanan | Sama seperti YouTube | Layar redup saat jeda, karakter seru hanya saat giliran, lepas layar bertahap | MVP |
| Sedang | Ritme loop tidak cocok dengan ritme menyuapi | Pengasuh kesal menunggu animasi | Suap bisa ditekan kapan saja | MVP |
| Sedang | Tangan pengasuh penuh atau kotor (sendok, mangkuk, makanan) sehingga sulit atau enggan menekan Suap | Tombol jarang ditekan | Area tombol besar di sisi pengasuh; tes bersama pengasuh nyata. Opsi setelah lomba: remote Bluetooth murah | Tes |
| Sedang | Karakter makan brokoli tetapi anak makan nasi dan ayam | Modeling kurang pas | Gambar umum untuk menu di luar daftar, tambah makanan bertahap | MVP sebagian |
| Sedang | "Gigitan diterima" bukan ukuran jumlah makanan atau gizi | Dokter ingin tahu asupan | Jujur di dashboard: yang diukur perilaku makan; porsi dari catatan pengasuh | MVP |
| Sedang | Jalur mandiri tanpa dokter | Kasus berat terlewat | Skrining wajib, posisikan sebagai program kebiasaan makan | MVP |
| Tinggi | Anak yang terbiasa YouTube bosan dengan karakter yang sengaja datar | Kasus target terberat gagal | Pemanasan dibuat paling menarik; hipotesis pilot, jangan klaim | Validasi |
| Sedang | Naik tahap terlalu cepat | Bantuan layar hilang sebelum kebiasaan terbentuk | Default 5 sesi, ditanyakan ke dokter | MVP |
| Rendah | Usia di luar 3–5 tahun | Bukti tidak berlaku | Catatan usia saat onboarding | MVP |

### Data, keamanan, bisnis

| Prioritas | Celah | Dampak | Penanganan | Kapan |
|---|---|---|---|---|
| Sedang | `kode_akses` jadi satu-satunya tanda masuk keluarga | Siapa pun yang tahu kode bisa melihat data | Lomba: cukup. Produksi: OTP nomor HP | Setelah lomba |
| Sedang | Token bagikan tanpa kedaluwarsa | Link lama tetap bisa dibuka | Lomba: token acak panjang. Produksi: masa berlaku dan cabut | Setelah lomba |
| Sedang | LLM salah membaca resep | Aturan keliru | Rentang aman, kolom ditandai, dokter wajib konfirmasi, form manual | MVP |
| Sedang | Biaya akuisisi keluarga B2C belum diketahui | Pertumbuhan lambat | Uji konten organik dan kerja sama PAUD/daycare | Setelah lomba |
| Sedang | Produk sengaja membuat pengguna lulus | Pendapatan per keluarga kecil | Andalkan pengguna baru, rekomendasi, dan jalur klinik | Bisnis |
| Rendah | Status regulasi SaMD belum jelas | Pivot setelah lomba | Baca KMK 951/2026, posisikan sebagai prototipe | Validasi |

### Demo final

| Prioritas | Celah | Penanganan |
|---|---|---|
| Tinggi | Cahaya ruangan final berbeda | Bawa lampu kecil, tes posisi saat setup 1 menit |
| Tinggi | Juri mengunyah berlebihan atau terlalu halus | Demo dipandu anggota tim; ada tombol koreksi |
| Sedang | Internet buruk saat LLM dipanggil | Ringkasan dan contoh JSON resep di-cache |
| Tinggi | Video, README, dan submit menumpuk di hari freeze | Rekam video 13 Nov malam; 14 Nov hanya README final dan submit sebelum siang |
| Sedang | Hari 12–13 padat dan aset tidak punya hari sendiri | Jadwal per orang, aset dikerjakan paralel sejak 9 Nov; progres dashboard jadi tabel, grafik diambil Orang 1 di 13 Nov jika tuning beres |
| Sedang | Orang 2 menunggu kamera dan engine sebelum bisa membuat karakter | Bentuk data sinyal dikunci 9 Nov + sumber sinyal palsu |
| Sedang | Gambar AI sulit dipotong jadi lapisan yang konsisten | Mulut SVG parametrik, keputusan rencana B SVG flat di akhir 9 Nov |
| Tinggi | Kode beku sejak 14 Nov, ambang tidak cocok di ruangan final 29 Nov | Panel ambang saat aplikasi jalan + reset data demo |
| Tinggi | Penyisihan dinilai dari video | Video 13 Nov malam, prioritas cerita dan bukti; cek guidebook |
| Sedang | Integrated Mentoring memakan jadwal | Potong dari daftar Disederhanakan, bukan dari inti |
| Sedang | Klip suara dibuat sebelum ditinjau ahli | Tandai klip sebagai draf di README |

### Kesimpulan tinjauan

1. Inti produk masih layak, dengan syarat hasil gigitan dibaca dari mulut terbuka + arah kepala, dan kunyahan diturunkan jadi pendukung.
2. Celah paling berbahaya ada di dunia nyata, bukan di demo: tangan pengasuh, dua wajah di kamera, anak menoleh ke sendok, dan layar HP mati. Semua punya penanganan, tetapi harus dites di tanggal 9 Nov.
3. Celah perilaku yang paling penting: jangan memberi hiburan saat anak menolak.
4. Jika gerbang 9 Nov gagal total, produk tetap bisa didemokan dengan tombol pengasuh sebagai penentu hasil dan kamera hanya untuk karakter meniru. Nilai Technology Innovation turun, tetapi produk tetap utuh.
5. Celah baru dari review ronde 3: penilaian suapan harus dari transisi buka ke tutup (bukan lama buka yang ditebak), uji wajib memakai sendok asli, dan ambang harus bisa disetel tanpa mengubah kode karena kode beku sejak 14 Nov.
6. Setelah Versi 3.3, revisi dokumen dihentikan. Kritik berikutnya dijawab dengan hasil tes 9 Nov dan pendapat dokter.

## 24. Sumber

- Guidebook LOGICODIX 2026.
- [Studi prevalensi kesulitan makan, dikutip di UKWMS](https://repositori.ukwms.ac.id/11808/2/BAB%201.pdf)
- [Lowe dkk. 2004, Food Dudes](https://dynamic-dudes.bangor.ac.uk/pdfs/Food%20Dudes%20Evidence%20Base/4.Lowe,%20C.%20F.,%20Horne,%20P.%20J.,%20Tapper,%20K.,%20Bowdery,%20M.,%20&%20Egerton,%20C.%20(2004)..pdf)
- [Horne dkk. 2004](https://dynamic-dudes.bangor.ac.uk/pdfs/Food%20Dudes%20Evidence%20Base/3..Horne,%20P.%20J.,%20Tapper,%20K.,%20Lowe,%20C.%20F.,%20Hardman,%20C.%20A.,%20Jackson,%20M.%20C.,%20&%20Woolner,%20J.%20(2004).pdf)
- [EJCN, Food Dudes](https://www.nature.com/articles/1602024)
- [Aston, ekspresi positif saat makan brokoli](https://research.aston.ac.uk/en/publications/repeated-exposure-to-models-positive-facial-expressions-whilst-ea/)
- [Birmingham 2024](https://research.birmingham.ac.uk/files/223787552/1-s2.0-S147101532400031X-main.pdf)
- [WUR, studi Belanda](https://edepot.wur.nl/673527)
- [Hanks, karakter kartun (News-Medical)](https://www.news-medical.net/news/20160705/Cartoon-characters-can-easily-convince-kids-to-eat-veggies-research-finds.aspx)
- [USDA NESR, paparan berulang](https://nesr.usda.gov/what-relationship-between-repeated-exposure-timing-quantity-and-frequency-foods-and-early-food)
- [Frekuensi paparan optimal](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8143368/)
- [Avery dkk. 2017, TV saat makan](https://nottingham-repository.worktribe.com/output/965891)
- [Balita Tiongkok, screen time dan picky eating](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9102033/)
- [Aplikasi pemantauan MPASI](https://dara.ui.ac.id/research-output/7ad93345-49da-4f9a-8848-e56854247864)
- [e-PedNutr](https://repository.ipb.ac.id/handle/123456789/179209)
- [ChewView](https://apps.apple.com/app/chewview/id6775670456)
- [SlowEat](https://apps.apple.com/lb/app/sloweat/id6742094566)
- [YumEats](https://apps.apple.com/cd/app/yumeats/id6737301809)
- [Kiddio, USDA](https://www.ars.usda.gov/is/pr/2012/120716.htm)
- [Vegemi](https://apps.apple.com/bw/app/vegemi/id1624471281)
- [ByteTrack](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12532775/)
- [Rule-based bite counting](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11141395/)
- Catatan riset di `research_notes/Ide inovasi kesehatan Logicodix 2026/`.

Sebagian besar sumber berasal dari ringkasan pencarian. Buka sumber asli sebelum memakai angka di slide.
