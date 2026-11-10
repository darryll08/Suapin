# Suapin — UI/UX Guidelines

| | |
|---|---|
| Versi | 1.0 |
| Tanggal | 10 November 2026 |
| Dipakai oleh | B Satya (aplikasi keluarga, karakter, aset), C Adit (dashboard klinik, `/r/:token`), A Darryl (halaman dev, panel ambang) |
| Acuan | `brand/README.md` (logo, palet, dikunci 10 Nov), `Suapin - PRD.md` (fitur dan aturan), `jobdesk/Prompt_Orang_B_*.md` (kartu build B) |

**Status isi.** Logo, lima warna palet, aturan "tanpa merah", tombol utama ≥ 56 px, target sentuh ≥ 48 px, tombol Suap ≥ 96 px, radius kartu 20 px, strip teks 15–16 px yang hilang dalam 8 detik, dan spesifikasi mulut SVG sudah **dikunci** di dokumen sebelumnya. Nilai lain di dokumen ini (skala huruf, spasi, warna turunan, durasi gerak, tata letak tiap layar, teks UI) **ditetapkan di sini** supaya B dan C membangun tampilan yang sama. Mengubahnya cukup lewat token di `src/gaya/token.css`.

---

## Daftar isi

1. Prinsip desain
2. Konteks pakai dan perangkat
3. Logo dan ikon aplikasi
4. Warna
5. Tipografi
6. Spasi, radius, bayangan
7. Breakpoint dan tata letak
8. Ikon dan ilustrasi UI
9. Komponen
10. Layar per rute
11. Karakter dan aset
12. Gerak
13. Suara
14. Bahasa dan penulisan
15. Aksesibilitas
16. Keadaan sistem dan pesan galat
17. Etika desain
18. Checklist QA per layar

---

## 1. Prinsip desain

Setiap prinsip punya konsekuensi yang bisa dicek. Bila ada konflik, prinsip dengan nomor lebih kecil menang.

| # | Prinsip | Artinya di layar | Bisa dicek dengan |
|---|---|---|---|
| P1 | **Anak bertindak, layar menanggapi.** Hal paling seru hanya terjadi saat anak membuka mulut | Perayaan hanya di `DITERIMA`. Di status lain karakter tenang | Tes K11; tidak ada animasi meriah di luar `DITERIMA` dan pemanasan |
| P2 | **Penolakan tidak pernah dihibur** | `MENOLAK`: pose `santai`, satu klip datar, tanpa gerak tambahan, tanpa warna mencolok | Rekam layar `MENOLAK`: tidak ada animasi selain kedip |
| P3 | **Layar seminim mungkin** | Redup saat jeda kunyah, hitam di tahap 3. Tidak ada elemen bergerak yang tidak perlu | Hitung elemen beranimasi per status (bagian 10.8) |
| P4 | **Tangan pengasuh penuh** | Satu tombol besar (Suap) di sisi pengasuh. Tombol lain kecil dan jarang dibutuhkan | Suap bisa ditekan dengan ibu jari tanpa melihat layar |
| P5 | **Arahan sensitif tidak terdengar anak** | "Jangan dibujuk" hanya teks kecil. Suara karakter hanya ajakan bermain | Tidak ada klip berisi arahan ke pengasuh soal perilaku anak |
| P6 | **Hangat, tidak kekanakan untuk orang dewasa** | Layar pengasuh dan dokter memakai bahasa dewasa dan tata letak tenang. Gaya kartun hanya di karakter dan stiker | Layar non-sesi tanpa ilustrasi selain karakter di landing dan stiker |
| P7 | **Jujur soal kemampuan** | Tidak ada klaim menyembuhkan. Hasil kamera disebut "perkiraan". Label AI di semua teks AI | Cari kata terlarang (bagian 14.4) |
| P8 | **Tanpa merah** | Peringatan memakai jagung + teks jagung tua + ikon | `grep -rn "red-" src` kosong |

---

## 2. Konteks pakai dan perangkat

### 2.1 Siapa melihat layar apa

| Layar | Dilihat oleh | Jarak mata ke layar | Posisi perangkat |
|---|---|---|---|
| Sesi makan | Anak (utama), pengasuh (sekilas) | 40–70 cm | HP/tablet berdiri di meja, sedikit di samping depan anak, di luar jangkauan tangan |
| Onboarding, beranda, laporan | Orang tua, pengasuh | 25–35 cm | Dipegang satu tangan |
| Dashboard klinik | Dokter | 50–70 cm | Laptop |
| Demo final | Juri | 1–3 m | Laptop + proyektor/layar besar |

### 2.2 Perangkat yang harus didukung

| Perangkat | Viewport acuan | Orientasi sesi | Prioritas |
|---|---|---|---|
| HP Android | 390 × 844 | Tegak (portrait) | Utama untuk keluarga |
| Laptop demo | 1280 × 800 | Mendatar | Utama untuk lomba dan dokter |
| Tablet | 768 × 1024 | Tegak atau mendatar | Harus tetap rapi |
| HP kecil | 360 × 740 | Tegak | Tombol Suap tidak boleh tertutup |

### 2.3 Pengaturan dasar halaman

- `<html lang="id">`.
- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
- `<meta name="color-scheme" content="light">` dan `:root { color-scheme: light; }`. Aplikasi tidak punya tema gelap umum; mode gelap Chrome Android tidak boleh menggelapkan warna secara otomatis. Mode "redup" dan "hitam" hanya ada di layar sesi.
- `<meta name="theme-color" content="#4B2E5A">`.
- Padding tepi memakai `env(safe-area-inset-*)` supaya tidak tertutup poni atau bilah gestur.
- Layar sesi: `overscroll-behavior: none` (tidak ada tarik-untuk-muat-ulang di tengah makan), `user-select: none`, `-webkit-touch-callout: none` pada gambar karakter, `touch-action: manipulation` pada tombol (tidak ada jeda ketuk ganda).

---

## 3. Logo dan ikon aplikasi

### 3.1 File

| File | Pakai untuk | Jangan dipakai |
|---|---|---|
| `brand/suapin-logo-transparan.svg` | Header web, dokumen, slide di latar terang | Di latar gelap atau di atas foto |
| `brand/suapin-ikon-ungu-putih.svg` | **Ikon utama**: favicon, ikon PWA, splash | — |
| `brand/suapin-ikon-jagung-ungu.svg` | Stiker, poster, sampul video | Ukuran < 48 px (detail kilau hilang) |
| `brand/suapin-ikon-jagung-putih.svg` | Banner besar saja | Di bawah 120 px, karena kontras ±2:1 |

### 3.2 Aturan pakai

- Sendok selalu miring 40°, kepala di kanan atas. Jangan diputar, dicerminkan, atau diberi bayangan.
- Ruang kosong di sekitar logo minimal selebar kepala sendok.
- Ukuran minimum: logo transparan tinggi 24 px di layar; ikon 32 px.
- Kata "Suapin" di samping logo: berat 700, warna ubi ungu, tinggi huruf kapital sekitar 60% tinggi sendok. "S" kapital, sisanya kecil. Tidak pernah "SUAPIN" atau "suapin" di tampilan (kecuali kode dan URL).

### 3.3 Ikon PWA

| File | Ukuran | Catatan |
|---|---|---|
| `public/ikon/ikon-192.png` | 192 × 192 | Dari `suapin-ikon-ungu-putih.svg` |
| `public/ikon/ikon-512.png` | 512 × 512 | Sama |
| `public/ikon/ikon-maskable-512.png` | 512 × 512, `purpose: "maskable"` | Sendok di dalam lingkaran aman 80% (diameter 409 px), sisanya latar ubi ungu penuh tanpa sudut membulat |
| `public/favicon.svg` | Vektor | Ikon ungu-putih |

Manifest: `name` dan `short_name` "Suapin", `lang: "id"`, `display: "standalone"`, `start_url: "/"`, `background_color: "#FAF6EE"`, `theme_color: "#4B2E5A"`.

---

## 4. Warna

### 4.1 Palet dasar (dikunci)

| Token | Hex | Nama | Peran |
|---|---|---|---|
| `--color-latar` | `#FAF6EE` | Nasi | Latar semua halaman |
| `--color-ungu` | `#4B2E5A` | Ubi ungu | Teks utama, judul, tombol utama, ikon |
| `--color-jagung` | `#E0A526` | Jagung manis | Aksen, sorotan, bidang peringatan (bukan teks) |
| `--color-jagung-tua` | `#8A5F0B` | Jagung tua | Teks peringatan dan galat |
| `--color-garis` | `#C9B79C` | Kerupuk | Garis pemisah dekoratif, latar sekunder |

### 4.2 Warna turunan (ditetapkan di dokumen ini)

| Token | Hex | Peran |
|---|---|---|
| `--color-permukaan` | `#FFFDF8` | Latar kartu, isian, lembar bawah |
| `--color-ungu-muda` | `#6E5A78` | Teks sekunder, label isian, garis tepi isian dan tombol kedua |
| `--color-ungu-tint` | `#EEE7F1` | Latar pilihan aktif, label "Siap naik tahap", baris tabel saat disorot |
| `--color-jagung-muda` | `#FBEFD2` | Latar kotak peringatan, latar kolom resep bermasalah |
| `--color-hitam` | `#000000` | Layar tahap 3 |
| `--color-redup` | `rgba(0, 0, 0, 0.6)` | Lapisan redup saat jeda kunyah |

### 4.3 Kontras yang sudah dihitung (rumus WCAG 2.x)

| Teks / elemen | Latar | Rasio | Boleh untuk |
|---|---|---|---|
| Ubi ungu `#4B2E5A` | Nasi `#FAF6EE` | 10,60:1 | Semua teks |
| Ubi ungu | Permukaan `#FFFDF8` | 11,24:1 | Semua teks |
| Ubi ungu | Ungu tint `#EEE7F1` | 9,43:1 | Semua teks |
| Ubi ungu | Jagung muda `#FBEFD2` | 10,00:1 | Semua teks |
| Ubi ungu | Jagung `#E0A526` | 5,21:1 | Teks di atas bidang jagung (lencana, tombol aksen) |
| Ubi ungu | Kerupuk `#C9B79C` | 5,84:1 | Teks di atas bidang kerupuk |
| Ungu muda `#6E5A78` | Nasi | 5,74:1 | Teks sekunder, garis tepi isian |
| Jagung tua `#8A5F0B` | Nasi | 5,23:1 | Teks peringatan dan galat |
| Jagung tua | Permukaan | 5,55:1 | Teks galat di dalam kartu |
| Jagung tua | Jagung muda | 4,94:1 | Teks di dalam kotak peringatan |
| Nasi | Ubi ungu | 10,60:1 | Teks tombol utama |
| Nasi | Hitam | 19,48:1 | Strip teks di tahap 3 |
| Jagung | Hitam | 9,58:1 | Tombol Suap di tahap 3 |
| Jagung | Nasi | 2,03:1 | **Tidak boleh untuk teks.** Hanya bidang, garis tebal ≥ 3 px yang didampingi teks, atau ikon dekoratif |
| Kerupuk | Nasi | 1,81:1 | **Tidak boleh untuk teks atau garis tepi isian.** Hanya garis pemisah dekoratif |

Catatan:
- Pertanyaan terbuka di `brand/README.md` soal kontras jagung tua sudah terjawab: 5,23:1 di atas nasi, lolos AA.
- Garis tepi isian dan tombol kedua harus ≥ 3:1 terhadap latar (WCAG 1.4.11). Kerupuk tidak memenuhi, jadi isian memakai **ungu muda**.

### 4.4 Peran warna per keadaan

| Keadaan | Latar | Garis | Teks | Ikon |
|---|---|---|---|---|
| Normal | Permukaan | Ungu muda 1 px | Ubi ungu | Ubi ungu |
| Fokus | Permukaan | Ubi ungu 2 px + cincin fokus | Ubi ungu | — |
| Terpilih (pil, kartu menu) | Ungu tint | Ubi ungu 2 px | Ubi ungu | Centang ubi ungu |
| Peringatan / galat | Jagung muda | Jagung 2 px kiri (atau penuh untuk isian) | Jagung tua | Lingkaran seru jagung tua |
| Sukses | Ungu tint | — | Ubi ungu | Centang ubi ungu |
| Nonaktif | Latar | Kerupuk | Ungu muda, opasitas 0,6 | — |
| Label AI | Permukaan | Kerupuk 1 px (dekoratif) + teks | Ungu muda | Huruf "AI" kecil |

Tidak ada warna sukses hijau dan galat merah. Sukses dan galat dibedakan dengan **ikon dan kata**, bukan warna saja.

### 4.5 Token di Tailwind 4 (`src/gaya/token.css`)

```css
@import "tailwindcss";

@theme {
  --color-latar: #FAF6EE;
  --color-permukaan: #FFFDF8;
  --color-ungu: #4B2E5A;
  --color-ungu-muda: #6E5A78;
  --color-ungu-tint: #EEE7F1;
  --color-jagung: #E0A526;
  --color-jagung-muda: #FBEFD2;
  --color-jagung-tua: #8A5F0B;
  --color-garis: #C9B79C;

  --font-judul: ui-rounded, "SF Pro Rounded", "Nunito", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-isi: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", sans-serif;

  --text-tampilan: 2rem;      --text-tampilan--line-height: 2.5rem;
  --text-judul: 1.625rem;     --text-judul--line-height: 2rem;
  --text-subjudul: 1.25rem;   --text-subjudul--line-height: 1.75rem;
  --text-isi: 1rem;           --text-isi--line-height: 1.5rem;
  --text-kecil: 0.875rem;     --text-kecil--line-height: 1.25rem;
  --text-strip: 0.9375rem;    --text-strip--line-height: 1.375rem;
  --text-tombol: 1.125rem;    --text-tombol--line-height: 1.5rem;

  --radius-kartu: 20px;
  --radius-tombol: 16px;
  --radius-isian: 12px;

  --shadow-kartu: 0 1px 2px rgb(75 46 90 / 0.08), 0 4px 12px rgb(75 46 90 / 0.06);
  --shadow-lembar: 0 -4px 24px rgb(75 46 90 / 0.12);

  --ease-standar: cubic-bezier(0.2, 0, 0, 1);
  --ease-keluar: cubic-bezier(0.4, 0, 1, 1);
  --ease-pop: cubic-bezier(0.34, 1.56, 0.64, 1);
}

:root { color-scheme: light; }
body { background: var(--color-latar); color: var(--color-ungu); font-family: var(--font-isi); }
```

"Nunito" hanya dipakai bila sudah terpasang di perangkat. Jangan memuat font dari internet, karena final harus offline.

---

## 5. Tipografi

### 5.1 Skala

| Token | HP (px / tinggi baris) | Laptop ≥ 1024 px | Berat | Pakai untuk |
|---|---|---|---|---|
| `tampilan` | 32 / 40 | 40 / 48 | 800, font judul | Judul landing saja |
| `judul` | 26 / 32 | 30 / 38 | 700, font judul | Judul halaman (satu per halaman) |
| `subjudul` | 20 / 28 | 22 / 30 | 700, font judul | Judul kartu dan bagian |
| `isi` | 16 / 24 | 16 / 24 | 400 | Teks biasa, isian |
| `kecil` | 14 / 20 | 14 / 20 | 400–500 | Keterangan, label tabel, label AI |
| `strip` | 15 / 22 | 16 / 24 | 500 | Strip teks pengasuh di layar sesi |
| `tombol` | 18 / 24 | 18 / 24 | 600 | Teks tombol utama dan kedua |
| `angka besar` | 40 / 44 | 48 / 52 | 800, `tabular-nums` | Kode akses, angka paparan "4/10" |

### 5.2 Aturan

- Tidak ada teks di bawah 14 px, kecuali catatan kaki hukum di landing (13 px, tetap ≥ 4,5:1).
- Panjang baris isi maksimal 65 karakter (`max-width: 65ch`).
- Angka di tabel dan statistik memakai `font-variant-numeric: tabular-nums` dan rata kanan.
- Huruf kapital semua hanya untuk singkatan (AI, PWA, GTM). Judul memakai huruf kapital di awal kalimat saja: "Laporan minggu ini", bukan "Laporan Minggu Ini".
- Kode akses ditampilkan dengan `font-family: ui-monospace, monospace`, `letter-spacing: 0.12em`, dikelompokkan 4-4-4 dengan spasi tipis ("K7QM 2XPA 9RHT"). Saat disalin, spasi dibuang.
- Teks di layar sesi untuk anak tidak ada. Anak tidak membaca. Nama panggilan anak boleh tampil besar di pemanasan sebagai hiasan.

---

## 6. Spasi, radius, bayangan

### 6.1 Skala spasi (kelipatan 4 px)

| Nama | px | Pakai untuk |
|---|---|---|
| 1 | 4 | Jarak ikon dengan teks kecil |
| 2 | 8 | Jarak dalam grup (label ke isian) |
| 3 | 12 | Padding pil, jarak antar pil |
| 4 | 16 | Gutter HP, padding kartu di HP, jarak antar isian |
| 6 | 24 | Padding kartu di laptop, jarak antar kartu |
| 8 | 32 | Gutter laptop, jarak antar bagian |
| 12 | 48 | Jarak sebelum tombol utama di akhir form |
| 16 | 64 | Jarak bagian besar di landing |

### 6.2 Radius

| Elemen | Radius |
|---|---|
| Kartu, lembar bawah (sudut atas) | 20 px (dikunci) |
| Tombol utama dan kedua | 16 px |
| Isian, textarea | 12 px |
| Pil, lencana | 999 px |
| Tombol Suap | Lingkaran penuh |
| Ikon aplikasi | `rx=28` dari 120 (sesuai `brand/`) |
| Pratinjau kamera | 16 px |

### 6.3 Bayangan

- Hanya dua: `shadow-kartu` untuk kartu yang bisa diketuk, `shadow-lembar` untuk lembar bawah.
- Kartu informasi yang tidak bisa diketuk memakai garis tepi 1 px ungu muda opasitas 0,25, tanpa bayangan.
- Tidak ada bayangan di layar sesi kecuali tombol Suap (`0 6px 16px rgb(0 0 0 / 0.18)`), supaya karakter tetap fokus.

---

## 7. Breakpoint dan tata letak

### 7.1 Breakpoint

| Nama | Lebar | Tata letak |
|---|---|---|
| Dasar | < 640 px | Satu kolom, gutter 16 px |
| `sm` | ≥ 640 px | Satu kolom, gutter 24 px |
| `md` | ≥ 768 px | Halaman keluarga tetap satu kolom terpusat; dashboard mulai dua kolom |
| `lg` | ≥ 1024 px | Dashboard dua kolom; layar sesi mendatar |

### 7.2 Lebar konten

| Area | Lebar maksimal | Alasan |
|---|---|---|
| Halaman keluarga (`/mulai`, `/beranda`, `/laporan`, dst.) | 560 px, terpusat | Dibaca seperti aplikasi HP, juga di laptop demo |
| Landing | 1040 px | Ada ilustrasi di samping teks pada laptop |
| Dashboard klinik | 1024 px (`max-w-5xl`) | Tabel tetap terbaca |
| Layar sesi | Layar penuh | Karakter sebesar mungkin |

### 7.3 Kerangka halaman keluarga

```text
┌───────────────────────────────┐
│ KepalaHalaman (56 px)         │  ← tombol kembali (kiri), judul, logo kecil (kanan)
├───────────────────────────────┤
│                               │
│  isi, gutter 16 px            │
│  kartu-kartu, jarak 16 px     │
│                               │
├───────────────────────────────┤
│ Tombol utama (sticky bawah)   │  ← hanya di form; 16 px dari tepi + safe-area
└───────────────────────────────┘
```

- Tombol utama form menempel di bawah (`position: sticky; bottom: 0`) dengan latar nasi bergradasi 16 px di atasnya, supaya tidak menutupi isian terakhir.
- Tidak ada navigasi bawah (tab bar). Alur keluarga linear: beranda adalah pusat, laporan dan sesi dibuka dari beranda.
- Tidak boleh ada scroll ke samping di 360 px. Cek `document.documentElement.scrollWidth === innerWidth`.

---

## 8. Ikon dan ilustrasi UI

### 8.1 Ikon

- Ikon SVG inline di `src/komponen/ikon.tsx`. Tidak menambah paket ikon, karena semua dependency dipasang sekali oleh A dan daftar ini kecil.
- Kotak 24 × 24, garis 2 px, ujung dan sudut membulat (`stroke-linecap="round"`, `stroke-linejoin="round"`), warna `currentColor`.
- Ikon dengan teks: 20 px. Ikon sendirian: 24 px dalam target sentuh ≥ 48 px dan wajib `aria-label`.

| Nama | Dipakai di |
|---|---|
| `kembali` (panah kiri) | KepalaHalaman |
| `salin` | Kode akses, link bagikan |
| `bagikan` | Tombol Bagikan ke dokter |
| `centang` | Pil terpilih, sukses, stiker terisi |
| `info` (lingkaran i) | Keterangan, catatan usia |
| `peringatan` (lingkaran seru) | Galat, tanda bahaya, kolom bermasalah. Bukan segitiga, supaya tidak terasa menakutkan |
| `kamera` / `kamera-coret` | Izin kamera |
| `stop` (kotak membulat) | Tombol Stop sesi |
| `lanjut` (panah kanan) | Tombol Lanjut sesi |
| `keluar` | Dashboard |
| `kunci` | Sesi terkunci |
| `sendok` | Tombol Suap (bentuk dari logo, disederhanakan) |

### 8.2 Ilustrasi

- Ilustrasi hanya dua jenis: **karakter** (landing, sesi, catatan) dan **stiker** (beranda, catatan).
- Ilustrasi kecil "posisi duduk" di layar persiapan: tampak atas, garis ubi ungu 2 px, tanpa wajah, bentuk sederhana (meja, HP, anak, pengasuh).
- Tidak memakai foto stok, foto anak, atau ilustrasi orang tua menangis.

---

## 9. Komponen

Semua komponen di `src/komponen/`. Komponen khusus klinik di `src/komponen/klinik/`. String kelas di `src/gaya/gaya.ts`. Halaman tidak menulis ulang kelas Tailwind panjang.

### 9.1 `Tombol`

| Varian | Tinggi | Latar | Teks | Garis | Lebar |
|---|---|---|---|---|---|
| `utama` | 56 px | Ubi ungu | Nasi, 18 px, 600 | — | Penuh di HP, otomatis (min 240 px) di laptop |
| `kedua` | 56 px | Permukaan | Ubi ungu | Ungu muda 1,5 px | Sama |
| `teks` | 48 px | Transparan | Ubi ungu, garis bawah saat hover | — | Otomatis |
| `aksen` | 56 px | Jagung | Ubi ungu (5,21:1) | — | Hanya untuk satu aksi sorotan di landing |
| `kecil` | 48 px | Permukaan 90% | Ubi ungu, 16 px | Ungu muda 1 px | Otomatis, padding 16 px. Untuk Lanjut, Stop, Lewati |

Keadaan:
- **Tekan:** `scale(0.98)` 120 ms, latar sedikit lebih gelap (`filter: brightness(0.92)`).
- **Fokus:** `outline: 2px solid var(--color-ungu); outline-offset: 2px`. Di atas latar ubi ungu, offset memakai cincin nasi 2 px di dalam (`box-shadow: 0 0 0 2px var(--color-latar)`) lalu outline ungu.
- **Memuat:** teks diganti titik tiga beranimasi + `aria-busy="true"`, tombol nonaktif, lebar tidak berubah.
- **Nonaktif:** opasitas 0,5, `cursor: not-allowed`, tetap punya teks yang menjelaskan kenapa nonaktif di dekatnya bila tidak jelas.

Aturan: satu tombol `utama` per layar. Teks tombol adalah kata kerja + objek: "Mulai makan", "Simpan catatan", "Ubah jadi aturan". Bukan "OK", "Submit", "Lanjut" saja (kecuali Lanjut di sesi).

### 9.2 `Kartu`

- Latar permukaan, radius 20 px, padding 16 px (HP) / 24 px (laptop).
- Bisa diketuk: `shadow-kartu`, seluruh kartu adalah satu target (`<a>` atau `<button>`), ikon panah kanan di sisi kanan.
- Tidak bisa diketuk: garis 1 px ungu muda opasitas 0,25, tanpa bayangan.
- Varian `peringatan`: latar jagung muda, garis kiri jagung 4 px, ikon `peringatan`, teks jagung tua untuk judul dan ubi ungu untuk isi.

### 9.3 `Isian`

- Tinggi 52 px, radius 12 px, latar permukaan, garis ungu muda 1,5 px, teks 16 px (16 px mencegah iOS memperbesar halaman saat fokus).
- Label selalu di atas isian (14 px, 500, ungu muda). Tidak memakai placeholder sebagai label.
- Fokus: garis ubi ungu 2 px.
- Galat: garis jagung 2 px, latar jagung muda, pesan di bawah dengan ikon `peringatan`, teks jagung tua 14 px, `aria-describedby` menunjuk pesan.
- `textarea` resep: tinggi minimal 160 px, bisa membesar, penghitung "123/1000" di kanan bawah (14 px, ungu muda; jagung tua bila > 900).
- Isian kode akses: `inputmode="text"`, `autocapitalize="characters"`, `autocomplete="one-time-code"`, `spellcheck="false"`.
- Tanggal lahir: `<input type="date">` dengan `max` = hari ini.

### 9.4 `Pil`

- Pilihan tunggal (sapaan, porsi, mood) dan sakelar kecil.
- Tinggi 48 px, padding 16 px, radius 999 px.
- Belum dipilih: latar permukaan, garis ungu muda 1,5 px. Dipilih: latar ungu tint, garis ubi ungu 2 px, ikon `centang` di kiri.
- Grup pil memakai `role="radiogroup"`, setiap pil `role="radio"` dengan `aria-checked`. Panah kiri/kanan berpindah pilihan.

### 9.5 `KepalaHalaman`

- Tinggi 56 px. Kiri: tombol `kembali` 48 × 48 (bila ada halaman sebelumnya). Tengah atau kiri: judul `subjudul`. Kanan: logo transparan 24 px (keluarga) atau nama dokter + Keluar (klinik).
- Latar nasi, garis bawah kerupuk 1 px (dekoratif).

### 9.6 `Memuat`

- Untuk muatan > 300 ms. Di bawah itu tidak menampilkan apa pun, supaya tidak berkedip.
- Bentuk: kerangka abu-ungu (`ungu-tint`) seukuran konten yang akan muncul, dengan denyut opasitas 0,6↔1 selama 1,2 detik. Bukan spinner berputar, kecuali di dalam tombol.
- Model kamera memuat: karakter tampil dalam pose `netral` dengan teks "Menyiapkan teman makan…" di bawahnya.

### 9.7 `PesanGalat`

- Kartu varian `peringatan` dengan judul singkat, satu kalimat penjelasan dari server (`galat`), dan satu tombol aksi ("Coba lagi" atau aksi yang sesuai).
- Galat jaringan dan galat server dibedakan kalimatnya (bagian 16).

### 9.8 `StripTeks` (layar sesi)

- Strip di bawah karakter, lebar penuh dikurangi area tombol Suap, tinggi minimal 56 px, padding 12 px 16 px.
- Latar permukaan opasitas 0,92, radius 16 px, teks `strip` 15–16 px berat 500 warna ubi ungu. Di tahap 3: latar transparan, teks nasi.
- Muncul dengan geser-naik 8 px + pudar 200 ms. Hilang sendiri setelah **8 detik** dengan pudar 200 ms, kecuali teks `tanya`.
- `role="status"`, `aria-live="polite"`.
- Strip **tidak** ikut diredupkan saat `layar = redup`. Strip berada di atas lapisan redup.
- Satu teks dalam satu waktu. Teks baru menggantikan yang lama.

### 9.9 `LembarTanya` (layar sesi)

- Muncul untuk teks `tanya` (`tadi_masuk`, `ngemut`). Lembar bawah di sisi pengasuh, lebar 100% di HP, 420 px di laptop.
- Isi: pertanyaan 18 px 600, dua tombol berdampingan setinggi 64 px: **Ya** (`utama`) dan **Tidak** (`kedua`). Tidak ada tombol tutup; bila tidak dijawab 10 detik, lembar menutup sendiri sesuai aturan engine.
- Bilah waktu tipis 3 px di atas lembar (jagung) menyusut selama 10 detik, supaya pengasuh tahu lembar akan menutup.
- `role="alertdialog"`, `aria-labelledby` ke pertanyaan, fokus ke tombol Ya.

### 9.10 `TombolSuap` (layar sesi)

| Properti | Nilai |
|---|---|
| Bentuk | Lingkaran |
| Ukuran | 112 px di HP, 128 px di laptop, tidak pernah < 96 px |
| Posisi | Pojok bawah di **sisi pengasuh**, 16 px dari tepi + safe-area |
| Isi | Ikon `sendok` 40 px + teks "Suap" 16 px 700 di bawah ikon |
| Warna | Latar jagung, ikon dan teks ubi ungu (5,21:1), bayangan `0 6px 16px rgb(0 0 0 / 0.18)` |
| Tahap 3 | Latar jagung opasitas 0,35, teks tetap. Masih bisa ditekan |
| Tekan | `scale(0.94)` 120 ms, cincin ubi ungu 4 px berkedip sekali 300 ms, getar `navigator.vibrate(20)` bila didukung |
| Saat `MENILAI` | Cincin tipis jagung berputar di tepi tombol selama jendela penilaian, supaya pengasuh tahu sistem sedang menilai |
| Aksesibilitas | `<button aria-label="Suap">`, bisa ditekan dengan Spasi/Enter di laptop |

Tombol Suap tidak pernah tertutup elemen lain: strip teks, lembar tanya, dan tombol kecil disusun menghindari kotaknya.

### 9.11 `PratinjauKamera` (layar sesi)

- Kotak 96 × 128 px (HP tegak) atau 160 × 120 px (laptop), radius 16 px, garis nasi 2 px.
- Posisi pojok atas di sisi pengasuh, 16 px dari tepi.
- Video dicerminkan (`transform: scaleX(-1)`) supaya terasa seperti cermin. Ketukan diterjemahkan ke koordinat frame asli: `x_frame = 1 − (x_ketuk / lebar)`, `y_frame = y_ketuk / tinggi`, lalu `pilihWajahDiTitik(x_frame, y_frame)`.
- Kotak hijau atau pembatas wajah **tidak** digambar (tanpa hijau di palet). Wajah terpilih ditandai titik jagung 8 px di dahi wajah itu.
- Saat `KALIBRASI`: lingkaran putus-putus nasi di tengah pratinjau sebagai panduan.
- Saat `terlihat = false`: pratinjau diberi garis jagung 2 px.
- Tahap 3: pratinjau disembunyikan (kamera tetap jalan).
- `aria-label="Pratinjau kamera, ketuk wajah anak bila salah pilih"`.

### 9.12 Komponen beranda

| Komponen | Spesifikasi |
|---|---|
| `KartuTahap` | Kartu dengan angka tahap besar (40 px) di kiri, judul tahap dan satu kalimat di kanan, 4 titik progres di bawah (titik terisi ubi ungu, kosong garis ungu muda) |
| `StikerMinggu` | 7 lingkaran 40 px berjajar (jarak 8 px), label hari 12 px di bawah ("Sen"…"Min"; 13 px minimal bila ruang cukup). Terisi: gambar stiker 40 px. Kosong: lingkaran garis ungu muda putus-putus. Hari ini diberi titik jagung di bawahnya |
| `JalurPaparan` | 10 langkah berupa lingkaran 24 px tersambung garis 2 px. Langkah tercapai: ubi ungu terisi; berikutnya: garis ubi ungu; sisanya: garis ungu muda. Label "Brokoli 4/10" (angka `tabular-nums`) di atas jalur |

### 9.13 `LabelAI`

- Baris kecil di atas teks AI: "Dibuat oleh AI dari data sesi" + lencana sumber. Untuk `template` barisnya diganti "Ringkasan otomatis dari data sesi", karena teks itu tidak dibuat AI.
- Lencana sumber: `ai` → "AI"; `cache` → "AI (tersimpan)"; `template` → "Ringkasan otomatis". Lencana 24 px tinggi, 12 px padding, garis ungu muda 1 px, teks 13 px ungu muda.
- Teks AI berada di dalam kartu dengan garis kiri ungu muda 3 px, supaya terlihat beda dari teks buatan tim.

### 9.14 Komponen klinik

| Komponen | Spesifikasi |
|---|---|
| `TabelSesi` | Kolom: Tanggal, Jam, Menu, Diterima, Ditolak, Ngemut, Durasi, Alasan selesai. Tinggi baris 48 px, kepala tabel menempel saat scroll, angka rata kanan `tabular-nums`. Di < 768 px berubah menjadi daftar kartu (tanggal + jam sebagai judul, angka dalam satu baris "5 diterima · 2 ditolak · 1 ngemut") |
| `LencanaStatus` | "Siap naik tahap": latar ungu tint, teks ubi ungu. "Saran turun tahap": latar jagung muda, teks jagung tua, ikon `peringatan`. "Aturan dokter" / "Aturan default": garis ungu muda, teks ungu muda |
| `FormResep` | Bagian 10.16 |

---

## 10. Layar per rute

Setiap layar memuat: tujuan, tata letak, isi dan teks, keadaan (memuat, kosong, galat), dan kriteria terima. Teks dalam tanda kutip adalah teks final versi 1.0 dan boleh disunting tanpa mengubah maknanya.

### 10.1 Landing `/`

**Tujuan:** dua jalan masuk yang jelas dalam satu layar HP tanpa scroll.

```text
HP 390                                   Laptop 1280
┌──────────────────────────┐   ┌──────────────────────────────────────────────┐
│ [logo] Suapin            │   │ [logo] Suapin                 Untuk klinik → │
│                          │   │                                              │
│   (karakter 200 px)      │   │  Makan jadi giliran main,     (karakter      │
│                          │   │  bukan tontonan.               360 px)       │
│ Makan jadi giliran main, │   │  Teman makan yang meniru                     │
│ bukan tontonan.          │   │  mulut anak, lalu pelan-pelan                │
│ Teman makan yang meniru  │   │  pergi dari layar.                           │
│ mulut anak, lalu pelan-  │   │  [Mulai gratis untuk keluarga]               │
│ pelan pergi dari layar.  │   │  [Untuk klinik]                              │
│                          │   │  Sudah punya kode? Masuk                     │
│ [Mulai gratis untuk keluarga]                                              │
│ [Untuk klinik]           │   │  Video kamera tidak pernah keluar dari HP.   │
│ Sudah punya kode? Masuk  │   └──────────────────────────────────────────────┘
│ Video kamera tidak pernah│
│ keluar dari HP.          │
└──────────────────────────┘
```

- Judul `tampilan`: "Makan jadi giliran main, bukan tontonan."
- Sub: "Teman makan yang meniru mulut anak, lalu pelan-pelan pergi dari layar."
- Tombol: **Mulai gratis untuk keluarga** (`utama`), **Untuk klinik** (`kedua`), "Sudah punya kode? Masuk" (`teks`).
- Baris privasi kecil dengan ikon kamera: "Video kamera tidak pernah keluar dari HP."
- Catatan kaki 13 px: "Prototipe lomba LOGICODIX 2026. Bukan alat diagnosis."
- Karakter dalam pose `netral` dengan kedip dan goyang pelan.
- Ketuk logo 5× dalam 3 detik → `/dev/ambang`. Tidak ada umpan balik visual untuk ketukan ini.
- **Terima bila:** dua tombol dan tautan terlihat tanpa scroll di 390 × 844.

### 10.2 Daftar `/mulai`

```text
┌──────────────────────────┐
│ ←  Kenalan dulu          │
│                          │
│ Panggilan anak           │
│ [ Dika               ]   │
│ Tanggal lahir            │
│ [ 12/09/2022         ]   │
│ ⓘ Program dirancang ...  │  ← hanya bila usia < 36 atau > 71 bulan
│ Siapa yang menyuapi?     │
│ (Mbak)(Bu)(Oma)(Ayah)    │
│ Nama pengasuh            │
│ [ Rini               ]   │
│                          │
│ [   Lanjut ke skrining  ]│  ← sticky bawah
└──────────────────────────┘
```

- Judul: "Kenalan dulu". Sub (14 px): "Sekitar 1 menit. Data ini hanya untuk menyapa di aplikasi."
- Label isian: "Panggilan anak" (bantuan: "Nama yang biasa dipakai di rumah"), "Tanggal lahir", "Siapa yang menyuapi?", "Nama pengasuh".
- Pil sapaan: Mbak, Bu, Oma, Ayah. MVP hanya `mbak` yang punya klip; pilihan lain tetap boleh dipilih, dan suara memakai klip Mbak sampai klip lain dibuat. Tampilkan catatan kecil di bawah pil bila memilih selain Mbak: "Suara karakter untuk sapaan ini menyusul. Sementara memakai sapaan Mbak."
- Catatan usia (ikon `info`, bukan peringatan): "Program dirancang untuk usia 3–5 tahun. Anda tetap bisa lanjut."
- Validasi saat menekan tombol, bukan saat mengetik. Pesan: "Isi panggilan anak.", "Isi tanggal lahir.", "Tanggal lahir tidak boleh di masa depan.", "Pilih siapa yang menyuapi.", "Isi nama pengasuh."
- Tombol: **Lanjut ke skrining**.

### 10.3 Kode akses (setelah daftar)

```text
┌──────────────────────────┐
│ Simpan kode ini          │
│ ┌──────────────────────┐ │
│ │   K7QM 2XPA 9RHT     │ │  ← angka besar, monospace
│ │   [⧉ Salin kode]     │ │
│ └──────────────────────┘ │
│ Pakai kode ini untuk     │
│ membuka Suapin di HP lain│
│ Kode hanya tampil sekali.│
│                          │
│ [x] Sudah saya simpan    │
│ [   Lanjut ke skrining  ]│  ← aktif setelah dicentang
└──────────────────────────┘
```

- Tombol salin: setelah ditekan, teks berubah "Tersalin" dengan ikon `centang` selama 2 detik.
- Kotak centang "Sudah saya simpan" wajib dicentang sebelum lanjut, karena kode tidak bisa ditampilkan lagi.
- Navigasi kembali dari layar ini tidak membuat akun baru (cookie sudah terpasang).

### 10.4 Masuk `/masuk`

- Judul: "Masuk dengan kode". Satu isian "Kode akses" (12 karakter; spasi dan huruf kecil dibersihkan otomatis). Tombol **Masuk**.
- 401: "Kode tidak dikenal. Periksa lagi huruf dan angkanya."
- Tautan: "Belum punya kode? Mulai gratis".

### 10.5 Skrining `/mulai/skrining`

**Tujuan:** pengaman, bukan penghalang. Nada tenang, tidak menakut-nakuti.

- Judul: "Sebelum mulai". Sub: "Jawab 7 pertanyaan ini supaya program aman untuk anak."
- Satu daftar, setiap pertanyaan satu kartu dengan dua pil **Tidak** dan **Ya** (Tidak di kiri, supaya jawaban yang paling umum mudah dijangkau). Belum dijawab: kedua pil kosong.
- Penghitung di atas: "3 dari 7 terjawab".
- Tombol **Simpan jawaban** aktif bila 7 terjawab.
- Catatan kecil di bawah: "Daftar ini draf dan sedang ditinjau dokter."

**Hasil aman** → langsung ke `/beranda`, dengan kartu sambutan di beranda: "Program dimulai. Trial 5 hari."

**Hasil ada tanda bahaya:**

```text
┌──────────────────────────┐
│ ⓘ                        │
│ Sebaiknya periksa ke     │
│ dokter dulu              │
│                          │
│ Ada jawaban yang perlu   │
│ dilihat dokter sebelum   │
│ program makan dimulai.   │
│                          │
│ Setelah diperiksa, dokter│
│ bisa membuka program     │
│ lewat link laporan dari  │
│ aplikasi ini.            │
│                          │
│ [   Ke beranda         ] │
└──────────────────────────┘
```

- Kartu varian `peringatan`, ikon `info` (bukan seru), judul jagung tua.
- Tidak mengulang jawaban "ya" mana yang dipilih, tidak memakai kata "berbahaya" atau "darurat".
- Beranda tetap bisa dibuka, tombol **Mulai makan** diganti kartu terkunci dengan teks yang sama.

### 10.6 Beranda `/beranda`

```text
┌──────────────────────────┐
│ [logo]          Laporan →│
│ Halo Mbak Rini,          │
│ siap makan bareng Dika?  │
│ ┌──────────────────────┐ │
│ │ 1  Tahap 1           │ │
│ │    Karakter ikut     │ │
│ │    makan bergiliran  │ │
│ │    ●○○○              │ │
│ └──────────────────────┘ │
│ Stiker minggu ini        │
│ (✓)(✓)(○)(✓)(✓)(○)(·)    │
│ Sen Sel Rab Kam Jum Sab Min
│ ┌──────────────────────┐ │
│ │ Brokoli 4/10         │ │
│ │ ●─●─●─●─○─○─○─○─○─○  │ │
│ └──────────────────────┘ │
│ Sisa trial 3 hari        │
│ [     Mulai makan      ] │
└──────────────────────────┘
```

| Tahap | Judul kartu | Kalimat |
|---|---|---|
| 1 | Tahap 1 | "Karakter ikut makan bergiliran dengan Dika." |
| 2 | Tahap 2 | "Mbak yang menggigit duluan. Karakter menyemangati." |
| 3 | Tahap 3 | "Layar gelap. Hanya suara yang menemani." |
| 4 | Tahap 4 | "Mbak yang memimpin. Aplikasi hanya untuk mencatat." |

- Salam: "Halo {Sapaan} {nama_pengasuh}, siap makan bareng {panggilan}?" Bila nama terlalu panjang, potong dengan elipsis di satu baris pertama, nama anak tetap utuh.
- Baris plan: `trial` → "Sisa trial {n} hari"; hari terakhir → "Trial berakhir hari ini"; `klinik` → "Program dari dokter"; `program` → tidak ditampilkan.
- Hari ke-4 trial: kartu di atas tombol: "{panggilan} menerima {rata} suapan per sesi. Trial sisa 1 hari." + tautan "Lihat program 30 hari".
- Kosong (belum ada sesi): ganti stiker dan paparan dengan kartu "Sesi pertama hari ini? Siapkan makanan, lalu tekan Mulai makan."
- Terkunci (`trial_habis`): tombol diganti **Lanjutkan program** → `/langganan`.

### 10.7 Persiapan sesi `/sesi` (langkah persiapan)

Tiga langkah dalam satu halaman, terlihat bertahap (langkah berikut muncul setelah langkah sebelumnya terisi). Bukan tiga halaman, supaya pengasuh bisa mengubah pilihan tanpa kembali.

```text
┌──────────────────────────┐
│ ←  Siapkan makan         │
│ 1 Menu hari ini          │
│ [brokoli img][Lainnya img]│  ← kartu gambar 2 kolom
│ [ ] Makanan baru?        │
│ 2 Mbak duduk di mana?    │
│ [ilustrasi tampak atas]  │
│ (Kiri anak) (Kanan anak) │
│ 3 Posisi HP              │
│ Letakkan HP sedikit di   │
│ samping depan anak...    │
│ [     Mulai makan      ] │
└──────────────────────────┘
```

**Langkah 1, menu.** Kartu gambar 2 kolom, gambar makanan 96 px, nama di bawah. "Lainnya" memakai gambar `umum`. Sakelar "Makanan baru?" dengan bantuan "Makanan yang belum biasa dimakan. Dihitung di pelacak 10 kali coba."

**Langkah 2, sisi duduk.** Ini keputusan UX yang mempengaruhi deteksi, jadi definisinya dikunci di sini:

- Pertanyaan: "Mbak duduk di sebelah mana anak?"
- Ilustrasi tampak atas: HP di atas, anak di tengah menghadap HP, dua kursi kosong di kiri dan kanan anak.
- Pilihan: **Kiri anak** / **Kanan anak**, dengan keterangan kecil "Dilihat dari arah anak menghadap layar".
- Artinya: `sisiPengasuh = "kanan"` berarti pengasuh duduk di sisi kanan anak saat anak menghadap layar. Dari depan layar, pengasuh juga berada di sisi kanan layar. Di pratinjau kamera yang dicerminkan, pengasuh juga tampil di kanan. Ketiga sudut pandang ini sama, jadi pengasuh tidak perlu membayangkan sudut pandang kamera.
- **Tombol Suap dan pratinjau kamera ditaruh di sisi layar yang sama dengan `sisiPengasuh`.**
- A memetakan tanda `yaw` dari definisi ini saat verifikasi di `/dev/kamera` (menoleh ke kanan anak = menoleh ke pengasuh bila `sisiPengasuh = "kanan"`). Ini mengganti frasa "dari sudut pandang kamera" di kartu B2.1 jobdesk; A dan B wajib menyepakatinya di I0 dan mencatatnya di `docs/status.md`.
- Pilihan terakhir diingat di `localStorage` (`tm_sisi_pengasuh`) dan dipilih otomatis di sesi berikutnya.

**Langkah 3, posisi.** Teks: "Letakkan HP sedikit di samping depan anak, setinggi wajahnya. Wajah anak harus terlihat. Jauhkan HP dari jangkauan tangan anak." Bila ruangan gelap tidak bisa diketahui sebelum kamera jalan, jadi saran cahaya muncul di kalibrasi.

**Tombol Mulai makan:** `bukaAudio()` → `muatSemua()` → Wake Lock → layar makan. Selama memuat: teks tombol "Menyiapkan…".

**Tahap 4:** seluruh halaman diganti kartu: "Hari ini {Sapaan} yang memimpin. Lakukan ritual makan seperti biasa, lalu catat hasilnya." + tombol **Catat hasil makan**.

### 10.8 Layar makan `/sesi` (loop)

**Tata letak HP tegak, pengasuh di kanan:**

```text
┌──────────────────────────────┐
│ [■ Stop]              ┌────┐ │  ← Stop di sisi JAUH dari pengasuh; pratinjau di sisi pengasuh
│                       │cam │ │
│                       └────┘ │
│                              │
│         ┌──────────┐         │
│         │ KARAKTER │         │  ← ≥ 60% tinggi layar, terpusat
│         │  + mulut │         │
│         │  + makanan│        │
│         └──────────┘         │
│                              │
│ ┌──────────────────┐ [Lanjut]│
│ │ strip teks        │  ╭────╮│
│ └──────────────────┘  │SUAP││  ← Suap 112 px di pojok bawah sisi pengasuh
│ [Tadi diterima ▾]     ╰────╯│
└──────────────────────────────┘
```

**Tata letak laptop mendatar, pengasuh di kanan:**

```text
┌────────────────────────────────────────────────────────────┐
│ [■ Stop]                                     ┌──────────┐  │
│                                              │ pratinjau│  │
│            ┌──────────────────┐              └──────────┘  │
│            │     KARAKTER     │                            │
│            │   (tinggi 70%)   │                            │
│            └──────────────────┘                  [Lanjut]  │
│      ┌──────────────────────────────┐            ╭──────╮  │
│      │ strip teks                    │            │ SUAP │  │
│      └──────────────────────────────┘            ╰──────╯  │
└────────────────────────────────────────────────────────────┘
```

Aturan tata letak:
- Pengasuh di kiri: seluruh susunan dicerminkan (Suap, Lanjut, pratinjau ke kiri; Stop ke kanan).
- Stop selalu di pojok atas yang jauh dari pengasuh, supaya tidak tertekan saat mengincar Suap.
- Tombol koreksi ("Tadi diterima ▾" / "Tadi ditolak ▾") hanya muncul setelah ada suapan tercatat, di bawah strip teks, 48 px, `kecil`. Mengetuknya membuka pilihan "Ubah jadi diterima" / "Ubah jadi ditolak".
- Latar sesi terang: nasi, dengan lingkaran jagung muda (diameter 80% lebar karakter) di belakang karakter.
- Di laptop, tombol Spasi = Suap, `L` = Lanjut, `Esc` = buka konfirmasi Stop. Pintasan ditulis di `title` tombol.

**Tampilan per status:**

| Status | Layar | Karakter | Mulut karakter | Elemen yang bergerak | Strip / lembar | Tombol terlihat |
|---|---|---|---|---|---|---|
| `KALIBRASI` | Terang | `netral` | 0 | Kedip, goyang | — (bila tidak terlihat: `wajah_tidak_terlihat`) | Stop |
| `PEMANASAN` | Terang | Urutan pemanasan (10.9) | Dari urutan | Semua animasi pemanasan | Nama anak besar di akhir | Stop, Lewati |
| `GILIRAN_KARAKTER` | Terang | `menggigit` → `enak` (tahap 1) | Dari urutan menggigit | Tangan, makanan, mulut | — | Suap, Lanjut (nonaktif), Stop |
| `MENUNGGU_SUAP` | Terang | `menunggu` | Meniru `mulut` anak | Mulut, kedip | 60 dtk tanpa Suap: `tawarkan_suapan_kecil` | Suap, Stop |
| `MENILAI` | Terang | `menunggu` | Meniru | Mulut, cincin di tombol Suap | — | Suap, Stop |
| `DITERIMA` | Terang | `merayakan` | Senyum lebar tetap | Lompat kecil, percikan (12.3), 2 detik | — | Suap, Stop, koreksi |
| `JEDA_KUNYAH` | Redup 60% | `mengunyah` | Mengikuti `rahang` | Mulut pelan | `masih_ngunyah` hanya klip | Suap, Lanjut, Stop, koreksi |
| `KEMUNGKINAN_NGEMUT` | Redup | `santai` | 0 | Kedip | Lembar `ngemut` | Lembar Ya/Tidak |
| `MENOLAK` | Terang | `santai` | 0 | **Hanya kedip** | `jangan_dibujuk` | Suap, Stop, koreksi |
| `TIDAK_PASTI` | Terang | `netral` | 0 | Kedip | Lembar `tadi_masuk` | Lembar Ya/Tidak |
| `TIDAK_TERLIHAT` | Tetap | `menunggu` | 0 | Kedip | `wajah_tidak_terlihat` | Suap, Stop |
| `SELESAI` | — | — | — | — | — | Pindah ke catatan |

**Tahap 2 (`giliran_saja`):** karakter hanya tampil di `GILIRAN_KARAKTER` (pose `enak`, tanpa `menggigit`, klip `mbak_gigit_duluan`) dan `DITERIMA`. Di status lain, area karakter menampilkan latar nasi dengan lingkaran jagung muda kosong. Mulut karakter tidak meniru, karena karakter tidak terlihat.

**Tahap 3 (`hitam`):** latar `#000000` penuh. Karakter, pratinjau, dan koreksi tidak dirender. Yang tersisa: strip teks (teks nasi, latar transparan), tombol Suap opasitas 0,35, tombol Stop opasitas 0,35. Lembar tanya tetap tampil normal. Jangan menulis "layar mati".

**Konfirmasi Stop** (lembar bawah):
- Judul: "Akhiri makan sekarang?"
- Tombol: **Akhiri makan** (`utama`), **Lanjut makan** (`kedua`).
- Tautan di bawah, teks jagung tua dengan ikon `peringatan`: "Darurat: anak tersedak". Mengetuknya menampilkan layar penuh latar nasi: "Jika anak tersedak dan tidak bisa bernapas, segera minta bantuan medis atau hubungi 119." dengan tombol `tel:119` "Telepon 119" (`utama`) dan "Tutup" (`teks`). Sesi berakhir dengan alasan `stop_darurat`.

**Kunjungan kembali ke tab** (`visibilitychange` → `visible`): lembar "Lanjutkan makan?" dengan **Lanjut** dan **Akhiri**. Kamera dan Wake Lock dipasang ulang setelah Lanjut ditekan.

**Tanpa kamera:** lencana kecil di pojok pengasuh "Tanpa kamera" menggantikan pratinjau. Setiap Suap langsung membuka lembar `tadi_masuk`.

**Simpan gagal setelah `SELESAI`:** layar penuh nasi dengan karakter `netral`: "Hasil makan belum tersimpan." + **Coba simpan lagi**. Data disimpan di `sessionStorage` sampai berhasil.

### 10.9 Pemanasan (bagian dari `/sesi`)

| Detik (MVP ±75 dtk) | Karakter | Makanan | Klip | Teks layar |
|---|---|---|---|---|
| 0–5 | Masuk dari bawah (geser 40 px + pudar 400 ms), `netral` | Tahap 0 di tangan | — | — |
| 5–20 | Mendekatkan makanan ke hidung, mata tutup, `enak` | Tahap 0 | `kenalan_makanan` | — |
| 20–35 | Menyentuh makanan, mengangguk kecil | Tahap 0 | — | — |
| 35–50 | Gigit kecil (urutan menggigit 11.5) | Tahap 0 → 1 | `karakter_enak` | — |
| 50–65 | `enak`, goyang badan sedikit lebih besar (4 px) | Tahap 1 | — | — |
| 65–75 | Menghadap anak, `menunggu` | Tahap 1 | `ajak_makan_bareng` | Nama panggilan anak besar (`tampilan`) di atas karakter, pudar masuk |

- Tombol "Lewati" (`kecil`) di pojok atas sisi pengasuh, muncul setelah 5 detik, supaya tidak tertekan tidak sengaja di awal.
- Pemanasan adalah bagian paling meriah di seluruh aplikasi (P1 tidak berlaku di sini, karena belum ada suapan yang dinilai).
- Versi pangkas 30 detik: baris 5–20, 35–50, 65–75 saja.

### 10.10 Catatan `/sesi/catatan`

```text
┌──────────────────────────┐
│        (stiker pop)      │
│ Terima kasih sudah       │
│ makan bareng!            │
│ ┌──────────────────────┐ │
│ │ Naik ke tahap 2      │ │  ← bila naik_tahap
│ │ Mulai besok, Mbak    │ │
│ │ yang menggigit duluan│ │
│ └──────────────────────┘ │
│ Brokoli dicoba 5/10 kali │
│ Berapa yang dimakan?     │
│ (Sedikit)(Setengah)(Habis)
│ Suasana makan?           │
│ (Senang)(Biasa)(Rewel)   │
│ [    Simpan catatan    ] │
│ Lewati                   │
└──────────────────────────┘
```

- Stiker 160 px, animasi pop sekali (12.3), tanpa konfeti.
- Judul: "Terima kasih sudah makan bareng!"
- Ringkas sesi di bawah judul (14 px): "{n} suapan diterima · {menit} menit". Tidak menampilkan jumlah ditolak di sini.
- Kartu naik tahap: "Naik ke tahap {X}" + kalimat dari tabel 10.6.
- Kartu saran turun (varian `peringatan`, ikon `info`): "3 sesi terakhir belum ada suapan diterima. Kembali ke tahap {X−1} bisa membantu." Jalur mandiri: tombol **Kembali ke tahap {X−1}** belum ada endpoint-nya di MVP, jadi tampilkan kalimatnya saja + "Diskusikan dengan dokter bila berlanjut."
- Porsi dan mood opsional. Tombol **Simpan catatan**; tautan "Lewati" langsung ke beranda.
- Teks porsi "Habis" tidak memicu pujian apa pun.

### 10.11 Laporan `/laporan`

- Judul: "Laporan makan {panggilan}".
- Urutan: kartu ringkasan AI (atau tombol "Buat ringkasan minggu ini") → tombol **Bagikan ke dokter** → daftar sesi 14 hari.
- Daftar sesi dikelompokkan per hari, terbaru di atas: "Sen, 9 Nov" lalu baris "07.00 · Brokoli · 5 diterima · 2 ditolak · 18 mnt". Ngemut hanya ditulis bila > 0.
- Bagikan: lembar bawah berisi link dalam kotak (`ui-monospace`, terpotong tengah dengan elipsis), tombol **Salin link** dan **Bagikan** (`navigator.share`, hanya muncul bila tersedia). Keterangan: "Siapa pun yang punya link ini bisa melihat laporan. Kirim hanya ke dokter Anda."
- Ringkasan memuat lebih dari 3 detik: tampilkan `Memuat` di dalam kartu, bukan di seluruh halaman.

### 10.12 Langganan `/langganan`

- Judul: "Program 30 Hari".
- Harga: "Rp 49.000" (`angka besar`) + lencana "Harga uji coba" + "sekali bayar".
- Isi program (daftar centang): "Sesi makan setiap hari", "Naik tahap otomatis sampai lepas layar", "Ringkasan mingguan", "Bagikan laporan ke dokter".
- Tombol **Aktifkan program** + keterangan "Mode demo lomba: tanpa pembayaran".
- Tidak ada hitung mundur, harga coret, atau "tinggal 2 slot" (bagian 17).
- Pengguna yang datang karena trial habis melihat baris di atas judul: "Trial 5 hari sudah selesai. Data {panggilan} tetap aman."

### 10.13 Laporan bagikan `/r/:token`

- Tata letak klinik (lebar 1024 px), tanpa kepala halaman keluarga. Logo + "Laporan makan dari keluarga".
- Isi: kartu identitas ("Dika · 4 th 2 bln · Tahap 1"), ringkasan versi dokter dengan `LabelAI`, `TabelSesi` 14 hari.
- Aksi di kanan atas (laptop) / bawah (HP):
  - Belum login: **Masuk sebagai dokter** → `/klinik/masuk?kembali=/r/<token>`.
  - Login, belum pasien: **Jadikan pasien saya** (`utama`). Setelah sukses: arahkan ke `/klinik/pasien/:id` dengan kartu sukses "Dika sekarang pasien Anda. Aturan default tetap dipakai sampai Anda mengonfirmasi resep."
  - Sudah pasien saya: lencana "Pasien Anda" + **Buka di dashboard**.
  - Pasien klinik lain: teks "Anak ini sudah menjadi pasien klinik lain." Tanpa tombol.
- Token salah: halaman nasi dengan "Link tidak berlaku. Minta keluarga membagikan link baru."

### 10.14 Masuk dokter `/klinik/masuk`

- Kartu terpusat 400 px. Judul "Masuk untuk klinik". Isian Email (`type="email"`, `autocomplete="username"`) dan Kata sandi (`autocomplete="current-password"`, tombol tampilkan/sembunyikan).
- Tombol **Masuk**. Galat: "Email atau kata sandi salah."
- Teks kecil: "Akun demo lomba."

### 10.15 Daftar pasien `/klinik/pasien`

```text
┌────────────────────────────────────────────────────────────────────┐
│ [logo] Suapin klinik                         dr. Demo   [Keluar]   │
│ Pasien                                                             │
│ ┌──────────┬──────┬───────┬────────┬──────────┬─────────┬────────┐ │
│ │ Panggilan│ Usia │ Tahap │ Sesi 7h│ Diterima │ Ditolak │ Status │ │
│ ├──────────┼──────┼───────┼────────┼──────────┼─────────┼────────┤ │
│ │ Dika     │ 4;2  │   1   │     9  │      54  │     12  │ Siap   │ │
│ │          │      │       │        │          │         │ naik   │ │
│ └──────────┴──────┴───────┴────────┴──────────┴─────────┴────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

- Usia ditulis "4 th 2 bln" (bukan "4;2" di tampilan; "4;2" hanya contoh lebar kolom).
- Kolom tambahan "Aturan" (Dokter / Default) sebagai lencana.
- Seluruh baris bisa diklik dan difokus (`<a>` membungkus baris, atau `tabindex` + Enter).
- Urutan: pasien dengan "Siap naik tahap" atau "Saran turun tahap" di atas, lalu panggilan A–Z.
- Kosong: kartu "Belum ada pasien. Buka link laporan yang dibagikan keluarga, lalu tekan Jadikan pasien saya."

### 10.16 Detail pasien `/klinik/pasien/:id`

Urutan bagian di halaman (dari atas):

1. **Kepala pasien:** "Dika · 4 th 2 bln · Tahap 1" + `LencanaStatus`. Bila siap naik: tombol **Naikkan ke tahap 2** (`kedua`) di kanan.
2. **Resep** (kartu terbesar).
3. **Ringkasan dokter minggu ini** (`LabelAI`, tombol "Buat ringkasan").
4. **Progres:** `TabelSesi` 28 hari + baris ringkas di atas tabel: "Ngemut dikonfirmasi: 3 · Brokoli dicoba 4/10".
5. **Riwayat aturan:** daftar versi (tanggal, Dokter/Default, teks asli dipotong 2 baris, bisa dibuka).
6. Catatan kecil: "Yang diukur adalah perilaku menerima suapan, bukan jumlah makanan. Porsi dari catatan pengasuh."

**Form resep, keadaan 1 (menulis):**

```text
┌ Resep ───────────────────────────────────────────────────────────┐
│ Tulis aturan makan seperti biasa Anda menulis di catatan         │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Maksimal 20 menit, akhiri kalau 10 menit menolak, kalau      │ │
│ │ ngemut tawarkan air sedikit, naik tahap kalau 3 sesi ...     │ │
│ └──────────────────────────────────────────────── 168/1000 ────┘ │
│ [ Ubah jadi aturan ]   Isi manual                                │
└──────────────────────────────────────────────────────────────────┘
```

**Keadaan 2 (hasil, ≥ 1024 px dua kolom; < 1024 px bertumpuk dengan teks asli di atas):**

```text
┌ Resep ───────────────────────────────────────────────────────────┐
│ AI  Diubah oleh AI, periksa sebelum konfirmasi                   │
│ ┌ Teks Anda ───────────────┐ ┌ Aturan untuk aplikasi ──────────┐ │
│ │ Maksimal 20 menit,       │ │ Lama makan maksimal   [20] menit│ │
│ │ akhiri kalau 10 menit    │ │ Akhiri setelah menolak[10] menit│ │
│ │ menolak, kalau ngemut    │ │ Tahap                 [1 ▾]     │ │
│ │ tawarkan air sedikit,    │ │ Naik tahap setelah    [3] sesi  │ │
│ │ naik tahap kalau 3 sesi  │ │ dengan minimal        [5] suapan│ │
│ │ ...                      │ │ Saran saat ngemut               │ │
│ │                          │ │ [Tawarkan air sedikit        ]  │ │
│ └──────────────────────────┘ └─────────────────────────────────┘ │
│ ⓘ Bagian ini tidak dipakai sistem: "2 kali sehari"               │
│ [ Konfirmasi aturan ]   Ubah teks                                │
└──────────────────────────────────────────────────────────────────┘
```

- Label kolom memakai bahasa dokter, bukan nama kolom JSON:

| Kolom JSON | Label | Satuan | Rentang ditampilkan |
|---|---|---|---|
| `max_minutes` | Lama makan maksimal | menit | "10–30" |
| `end_after_refusal_minutes` | Akhiri setelah menolak terus | menit | "5–15" |
| `stage` | Tahap | — | Pilihan 1–4 dengan nama tahap |
| `advance_rule.sessions` | Naik tahap setelah | sesi berturut-turut | "1–7" |
| `advance_rule.min_accepted_bites` | dengan minimal | suapan diterima per sesi | "1–15" |
| `ngemut_hint` | Saran saat ngemut (tampil ke pengasuh) | — | "Maks. 100 karakter" |

- Kolom bermasalah: isian varian galat (garis jagung, latar jagung muda) + alasan di bawahnya, misalnya "60 menit di luar rentang aman 10–30" atau "Tidak disebut. Isi manual atau pakai nilai sekarang: 30". Bila ada nilai aturan aktif, tampilkan tombol kecil "Pakai nilai sekarang".
- Rentang aman tampil sebagai bantuan abu (ungu muda) di setiap isian, bukan hanya saat galat.
- Penanda sumber: `ai` → lencana "AI"; `cache` → "AI (tersimpan)"; `gagal` → kotak peringatan "AI tidak tersedia, isi manual" dan form manual langsung terbuka.
- Tombol **Konfirmasi aturan** aktif hanya bila semua kolom lolos `AturanSchema`. Saat nonaktif, teks di sampingnya: "Lengkapi {n} kolom bertanda."
- Setelah konfirmasi: kartu sukses "Aturan baru berlaku di sesi berikutnya." + versi baru muncul di riwayat. Form kembali ke keadaan 1 dengan textarea kosong.
- Pintasan: `Ctrl/Cmd + Enter` di textarea = **Ubah jadi aturan**.
- Memuat parse (maks 8 detik timeout server): tombol berubah "Membaca aturan…", textarea tetap bisa dibaca (read-only).

### 10.17 Panel ambang `/dev/ambang`

- Halaman alat, bukan untuk pengguna. Tetap memakai token yang sama, tetapi padat: isian 40 px, teks 14 px.
- Kiri (≥ 1024 px): pratinjau kamera 320 × 240 + angka live (`mulut`, `rahang`, `yaw`, `nangis`, fps) dalam `tabular-nums`, diperbarui 4×/detik supaya terbaca.
- Kanan: kelompok isian "Penilaian suapan", "Menoleh", "Kunyah", "Waktu", "Mode cadangan" (dua sakelar). Setiap isian menampilkan nilai awal di bantuan ("awal 0,3").
- Bawah: **Simpan**, **Kembalikan awal**, status `/api/sehat` (tiga lencana), tombol masuk demo, dan **Reset data demo** di kartu terpisah dengan garis jagung + konfirmasi `window.confirm("Hapus semua data dan kembalikan data contoh?")`.

---

## 11. Karakter dan aset

### 11.1 Arah gambar

- Satu karakter, menghadap depan, mata menatap ke depan (ke anak).
- Bentuk bulat dan lembut, kepala besar (±45% tinggi total), badan pendek, tangan sederhana tanpa jari detail.
- Warna isian datar dengan satu tingkat bayangan. Garis luar ubi ungu atau tanpa garis, konsisten di semua lapisan.
- Warna karakter boleh di luar palet UI (warna kulit, rambut), tetapi **tanpa merah**. Pipi merona memakai jagung muda atau kerupuk.
- Hindari: wajah realistis, gigi terlihat, ekspresi marah atau sedih, pakaian bermerek, kemiripan dengan karakter kartun yang sudah ada.
- Nama karakter belum ditentukan. Karakter boleh punya nama lucu sendiri, terpisah dari nama aplikasi.

### 11.2 Lapisan dan file

| Lapisan (urutan bawah ke atas) | File | Catatan |
|---|---|---|
| Latar | CSS | Lingkaran jagung muda |
| Badan | `public/aset/karakter/badan.webp` | Goyang CSS |
| Kepala | `kepala.webp` | Area mulut dikosongkan, warna kulit polos |
| Mata | `mata_buka.webp`, `mata_tutup.webp` | Kedip |
| Alis / ekspresi | `alis_netral.webp`, `alis_menunggu.webp`, `alis_enak.webp`, `alis_merayakan.webp`, `alis_santai.webp` | Diganti per pose |
| Mulut | SVG di `src/karakter/mulut.tsx` | Tidak ada PNG mulut |
| Tangan + makanan | `tangan.webp` + gambar makanan | Hanya saat pose `menggigit` |
| Lapisan redup | CSS | `rgba(0,0,0,0.6)` |

- Semua lapisan satu kanvas 1024 × 1024, WebP transparan, ≤ 150 KB per file. Posisi pas saat ditumpuk tanpa geser manual.
- Kotak mulut didefinisikan sekali sebagai konstanta persen kanvas di `karakter.tsx`, misalnya `KOTAK_MULUT = { kiri: 38, atas: 58, lebar: 24, tinggi: 14 }`, lalu disetel sesuai gambar.
- Rencana B (SVG flat, `src/karakter/karakter-flat.tsx`): kepala lingkaran, badan elips, mata dua elips, alis path pendek, mulut SVG yang sama. Diputuskan paling lambat 11 Nov 12.00.

### 11.3 Pose dan ekspresi

| Pose | Mata | Alis | Mulut | Badan | Dipakai di |
|---|---|---|---|---|---|
| `netral` | Buka, kedip | Netral | 0 | Goyang 2 px | Kalibrasi, tidak pasti |
| `menunggu` | Buka lebar, kedip | Naik sedikit | Meniru anak | Condong 2° ke depan | Menunggu suap, menilai, tidak terlihat |
| `menggigit` | Buka | Netral | Urutan 11.5 | Diam | Giliran karakter, pemanasan |
| `enak` | Tutup melengkung (senyum mata) | Turun lembut | 0,15 bergetar pelan | Goyang 3 px | Setelah menggigit, pemanasan |
| `merayakan` | Tutup melengkung | Naik | Senyum lebar tetap | Lompat kecil (12.3) | Diterima |
| `santai` | Buka, kedip lebih lambat (tiap 5–7 dtk) | Netral datar | 0 | **Diam** | Menolak, ngemut |
| `mengunyah` | Setengah tutup | Netral | Mengikuti rahang | Goyang 1 px | Jeda kunyah |

### 11.4 Mulut SVG (dikunci di jobdesk B1.3)

```tsx
// <svg viewBox="0 0 100 60"> di dalam KOTAK_MULUT
const buka = Math.min(1, Math.max(0, mulut));
const h = 4 + buka * 30;   // tinggi bukaan
const rongga = `M20,20 Q50,${20 + h * 1.4} 80,20 Q50,${20 + h * 0.2} 20,20 Z`;
```

- Bibir atas path tetap. Rongga diisi ubi ungu gelap `#2E1B38`. Bibir memakai cokelat bata lembut `#9C6B5E`, bukan merah. Lidah opsional: elips kecil `#C98B7A` di bagian bawah rongga saat `buka > 0,4`. Bila gambar karakter memakai warna kulit lain, sesuaikan bibir dengan gambar, tetap tanpa merah.
- Penghalusan: `transition: d 60ms linear` bila browser mendukung, atau interpolasi manual di `requestAnimationFrame`.
- `merayakan`: path senyum lebar tetap, tidak mengikuti sinyal.
- Rencana B gambar: 4 gambar mulut dengan ambang < 0,10 / 0,10–0,25 / 0,25–0,45 / > 0,45 dan jeda ganti minimal 80 ms.
- Komponen tidak memakai `useState` yang berubah 20×/detik di level halaman. `mulut` diterima sebagai prop dan langsung dipakai di atribut `d`.

### 11.5 Urutan menggigit (±2,5 detik)

| ms | Kejadian |
|---|---|
| 0–600 | Tangan membawa makanan dari bawah ke depan mulut (`translateY` 120 px → 0, `ease-standar`) |
| 600–900 | Mulut buka ke 0,8 |
| 900 | Gambar makanan berganti ke tahap berikutnya (0 → 1 → 2) |
| 900–1100 | Mulut tutup ke 0 |
| 1100–2100 | Kunyah 3 kali: mulut 0,2 ↔ 0, tiap siklus 330 ms |
| 2100–2500 | Tangan turun, pose `enak` |

### 11.6 Makanan

- Tiga gambar per makanan dengan kanvas sama 512 × 512: `_0` utuh, `_1` digigit sekali, `_2` digigit dua kali. Bekas gigitan berbentuk lengkung bulat, bukan bergerigi.
- Gaya sama dengan karakter (datar, satu bayangan). Brokoli hijau tua alami boleh (warna makanan, bukan warna UI).
- `umum_0..2`: sendok berisi makanan netral (nasi dengan lauk samar), untuk menu di luar daftar.
- MVP: brokoli + umum. Nasi dan wortel bila sempat.

### 11.7 Stiker

- Minimal 3 stiker, 256 × 256 WebP, tema makanan lokal yang ada di palet: jagung tersenyum, butir nasi, ubi ungu. Satu stiker per hari, dipilih berurutan.
- Bingkai stiker lingkaran putih 8 px dengan bayangan tipis, seperti stiker tempel.

### 11.8 Dokumentasi aset

`docs/aset.md` mencatat sumber, lisensi, dan prompt AI image bila dipakai. Aset dengan lisensi tidak jelas tidak boleh masuk repo.

---

## 12. Gerak

### 12.1 Token

| Token | Nilai | Pakai untuk |
|---|---|---|
| `--durasi-cepat` | 120 ms | Tekan tombol, kedip |
| `--durasi-sedang` | 200 ms | Strip teks muncul/hilang, pil berubah |
| `--durasi-lambat` | 400 ms | Lapisan redup, lembar bawah, karakter masuk |
| `--ease-standar` | `cubic-bezier(0.2, 0, 0, 1)` | Hampir semua gerak masuk |
| `--ease-keluar` | `cubic-bezier(0.4, 0, 1, 1)` | Elemen keluar |
| `--ease-pop` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Stiker pop, lompat merayakan |

### 12.2 Daftar animasi

| Animasi | Durasi | Detail |
|---|---|---|
| Kedip | 120 ms, tiap 3–6 dtk acak (`santai` 5–7 dtk) | Ganti `mata_buka` → `mata_tutup` → `mata_buka` |
| Goyang badan | 3 dtk, berulang | `translateY` 0 → −2 px → 0, `ease-in-out` |
| Lapisan redup | 400 ms | Opasitas 0 → 0,6 |
| Lembar bawah | 400 ms masuk, 200 ms keluar | `translateY(100%)` → 0 |
| Strip teks | 200 ms | Geser naik 8 px + pudar |
| Tekan tombol | 120 ms | `scale(0.98)`, Suap `scale(0.94)` |
| Stiker pop | 600 ms, sekali | `scale(0.6)` → `1.08` → `1`, `ease-pop` |
| Pindah halaman | 200 ms | Pudar saja; tidak ada geser antar halaman |

### 12.3 Merayakan (`DITERIMA`, 2 detik)

- Badan lompat kecil: `translateY` 0 → −16 px → 0 dua kali dalam 800 ms, `ease-pop`.
- 6 percikan kecil (lingkaran 8–12 px warna jagung dan jagung muda) keluar dari sekitar kepala sejauh 40–60 px, memudar dalam 700 ms. Bukan konfeti layar penuh.
- Setelah 2 detik, transisi ke `JEDA_KUNYAH` (redup 400 ms).
- Perayaan dimulai **setelah** mulut anak tertutup (engine yang mengatur waktunya).

### 12.4 Gerak yang dilarang

- Animasi apa pun di `MENOLAK` selain kedip.
- Animasi yang berulang terus di jeda kunyah selain mulut mengunyah.
- Kilatan cepat (> 3 kali per detik) di mana pun.
- Paralaks, scroll-jacking, atau animasi angka berjalan di halaman keluarga dan klinik.

### 12.5 `prefers-reduced-motion: reduce`

- Matikan goyang badan, lompat merayakan, dan percikan. Perayaan diganti pose `merayakan` statis + senyum.
- Stiker pop diganti pudar 200 ms.
- Lembar bawah muncul dengan pudar, tanpa geser.
- Mulut yang meniru dan kedip **tetap**, karena itu fungsi inti, bukan hiasan.

---

## 13. Suara

| Aturan | Nilai |
|---|---|
| Satu suara karakter | Satu voice ID ElevenLabs untuk semua klip, dicatat di `docs/klip.md` |
| Kerasnya | Semua klip dinormalkan ke −16 LUFS, puncak −1,5 dBTP |
| Panjang klip | ≤ 3 detik untuk klip di loop; ≤ 5 detik untuk pemanasan dan penutup |
| Antrean | Satu klip berjalan; maksimal 2 menunggu; klip terlama dibuang |
| Pengulangan | Klip yang sama tidak diulang dalam 20 detik; variasi dipilih acak |
| Tahap 3 | Suara tetap jalan saat layar hitam |
| Tahap 4 | Tidak ada suara |
| Efek bunyi | Tidak ada di MVP. Bila ditambah: hanya satu "pop" lembut di `DITERIMA`, tidak ada bunyi di `MENOLAK` |
| Musik latar | Tidak ada di aplikasi (mengganggu fokus makan). Musik hanya di video demo |
| Gaya bicara karakter | Ceria tetapi tidak melengking, tempo sedang, jelas untuk balita |
| `MENOLAK` | Klip `nanti_lagi` diucapkan datar, lebih pelan, tanpa intonasi naik |

Tombol "Mulai makan" memanggil `bukaAudio()` sebelum apa pun, supaya klip pertama tidak diblokir browser.

---

## 14. Bahasa dan penulisan

### 14.1 Suara per pembicara

| Pembicara | Ke siapa | Gaya | Panjang | Contoh |
|---|---|---|---|---|
| Karakter (suara) | Anak dan pengasuh | Ceria, ajakan bermain, kalimat aktif | ≤ 8 kata | "Sekarang giliranmu!" |
| Strip teks | Pengasuh | Tenang, perintah lembut, tanpa menyalahkan | ≤ 10 kata | "Jangan dibujuk. Tawarkan lagi sebentar lagi." |
| Layar keluarga | Orang tua, pengasuh | Hangat, jelas, bahasa sehari-hari | Kalimat ≤ 20 kata | "Simpan kode ini untuk membuka di HP lain." |
| Ringkasan AI keluarga | Orang tua | Menyemangati, menyebut angka, tanpa istilah medis | ≤ 400 karakter | — |
| Dashboard | Dokter | Faktual, ringkas, istilah klinis ringan boleh | Kalimat ≤ 20 kata | "Penolakan lebih tinggi pada sesi 18.00." |

### 14.2 Aturan umum

- Bahasa Indonesia baku santai. Sapaan "Anda" untuk dokter, sapaan pengasuh ("Mbak Rini") untuk keluarga. Tidak memakai "kamu" ke orang dewasa; "kamu" hanya dari karakter ke anak.
- Satu istilah untuk satu hal:

| Pakai | Jangan pakai |
|---|---|
| suapan (anak) | gigitan, suap-an, bite |
| gigit (karakter) | makan, suap |
| diterima / ditolak | berhasil / gagal |
| ngemut | mengulum, ditahan |
| tahap | level, stage |
| sesi makan | latihan, terapi |
| program | kursus, pengobatan |
| pengasuh | ART, babysitter (di teks UI) |
| aturan makan | resep obat |

- Kata "resep" hanya di dashboard dokter ("Resep" sebagai nama bagian), karena itu istilah dokter.
- Kalimat aktif dan langsung. Angka ditulis sebagai angka ("5 sesi", bukan "lima sesi").

### 14.3 Format

| Jenis | Format | Contoh |
|---|---|---|
| Tanggal pendek | Hari singkat, tanggal, bulan singkat | "Sen, 9 Nov" |
| Tanggal panjang | Tanggal bulan tahun | "9 November 2026" |
| Jam | 24 jam dengan titik | "07.00", "18.05" |
| Durasi | menit singkat | "18 mnt" |
| Usia | tahun dan bulan | "4 th 2 bln" |
| Uang | Rp + spasi + titik ribuan | "Rp 49.000" |
| Desimal | Koma | "33,6%" |
| Pecahan progres | Angka/angka | "4/10" |

Gunakan `Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta" })` untuk tanggal dan `Intl.NumberFormat("id-ID")` untuk angka.

### 14.4 Kata dan kalimat yang dilarang

| Jangan | Alasan | Ganti dengan |
|---|---|---|
| "Habiskan", "harus habis", "pintar karena habis" | Target menghabiskan makanan dilarang | "Mau coba", "terima kasih sudah makan bareng" |
| "Anak pintar", "anak baik" saat menerima | Memuji kepatuhan, bukan mencoba | "Hore, hebat!" (untuk usaha) |
| "Nakal", "rewel" sebagai label anak | Menyalahkan anak | "Rewel" hanya sebagai pilihan suasana makan |
| "Gagal", "salah" | Menyalahkan pengasuh | "Belum", "coba lagi nanti" |
| "Menyembuhkan", "terapi", "obat" | Klaim medis | "Program kebiasaan makan" |
| "Diagnosis", "gangguan", "penyakit" di layar keluarga | Bukan alat diagnosis | — |
| "Pertama di Indonesia" | Belum diverifikasi | — |
| "Layar mati" untuk tahap 3 | Browser tidak bisa | "Layar gelap" |
| "AI menilai anak" | Menakutkan, tidak akurat | "Kamera membaca gerak mulut" |
| "Akurat", "pasti" untuk hasil kamera | Belum diuji pada balita | "Perkiraan" |
| Emoji di teks UI | Tidak konsisten antar perangkat | Ikon SVG |

### 14.5 Kalimat yang sudah ada

Teks strip dan klip mengikuti tabel di `Suapin - PRD.md` F-21 dan F-22. Semua berstatus draf sampai ditinjau dokter anak atau ahli gizi.

---

## 15. Aksesibilitas

| Aturan | Nilai | Cara cek |
|---|---|---|
| Kontras teks | ≥ 4,5:1 (semua pasangan di 4.3 sudah dihitung) | Tabel 4.3; DevTools contrast |
| Kontras non-teks (garis isian, ikon fungsi) | ≥ 3:1 | Isian memakai ungu muda, bukan kerupuk |
| Target sentuh | ≥ 48 × 48 px; tombol utama tinggi 56 px; Suap ≥ 96 px | DevTools ukur |
| Jarak antar target | ≥ 8 px | — |
| Fokus terlihat | Outline ubi ungu 2 px, offset 2 px, di semua elemen interaktif | Tab di laptop |
| Urutan fokus | Mengikuti urutan baca; lembar bawah menjebak fokus selama terbuka dan mengembalikan fokus ke pemicunya saat ditutup | Tab |
| Label | Setiap isian punya `<label>`; tombol ikon punya `aria-label` | Lighthouse |
| Status dinamis | `StripTeks` `role="status" aria-live="polite"`; galat form `role="alert"`; `LembarTanya` `role="alertdialog"` | Pembaca layar |
| Bahasa | `lang="id"` | — |
| Warna bukan satu-satunya penanda | Galat selalu dengan ikon + kata; status tabel dengan teks | — |
| Pembesaran teks | Tetap terbaca di zoom 200% tanpa scroll samping di halaman keluarga dan klinik | Zoom browser |
| Gerak | `prefers-reduced-motion` (12.5) | DevTools emulasi |
| Keyboard dashboard | Semua aksi dashboard bisa lewat keyboard; `Ctrl/Cmd + Enter` di textarea resep | Tanpa mouse |
| Keyboard sesi (laptop) | Spasi = Suap, `L` = Lanjut, `Esc` = Stop | — |
| Waktu | Lembar tanya yang menutup sendiri menampilkan bilah waktu | — |

Layar sesi untuk anak tidak bergantung pada teks, jadi aksesibilitas anak dipenuhi lewat suara dan gerak karakter. Pengasuh dengan penglihatan rendah tetap bisa memakai Suap (ukuran besar, kontras 5,21:1).

---

## 16. Keadaan sistem dan pesan galat

| Kondisi | Di mana | Judul | Isi | Aksi |
|---|---|---|---|---|
| Halaman dibuka lewat IP LAN (`!isSecureContext`) | Sesi | "Kamera tidak bisa dibuka di alamat ini" | "Buka Suapin lewat localhost atau link HTTPS." | Lanjut tanpa kamera |
| Izin kamera ditolak | Sesi | "Izin kamera belum diberikan" | "Kamera dipakai supaya karakter bisa meniru mulut anak. Video tidak disimpan dan tidak dikirim." | Coba lagi · Lanjut tanpa kamera |
| Kamera tidak ditemukan | Sesi | "Kamera tidak ditemukan" | "Sesi tetap bisa jalan. Hasil suapan dijawab Mbak." | Lanjut tanpa kamera |
| Model memuat | Sesi | — | Karakter `netral` + "Menyiapkan teman makan…" | — |
| Model gagal dimuat | Sesi | "Pembaca wajah gagal dimuat" | "Muat ulang halaman. Bila tetap gagal, lanjut tanpa kamera." | Muat ulang · Lanjut tanpa kamera |
| Wajah tidak terlihat | Sesi | — | Strip `wajah_tidak_terlihat` | — |
| Tab ditinggal lalu kembali | Sesi | "Lanjutkan makan?" | — | Lanjut · Akhiri |
| Sesi terkunci, skrining belum | Sesi | "Isi skrining dulu" | "7 pertanyaan singkat sebelum sesi pertama." | Ke skrining |
| Sesi terkunci, tanda bahaya | Sesi, beranda | "Sebaiknya periksa ke dokter dulu" | Lihat 10.5 | Ke beranda |
| Sesi terkunci, trial habis | Sesi, beranda | "Trial sudah selesai" | "Data {panggilan} tetap aman." | Lanjutkan program |
| Simpan sesi gagal | Setelah sesi | "Hasil makan belum tersimpan" | "Periksa koneksi ke server, lalu coba lagi. Data masih ada di HP ini." | Coba simpan lagi |
| Tidak ada jaringan (fetch gagal) | Semua halaman | "Tidak terhubung" | "Periksa koneksi, lalu coba lagi." | Coba lagi |
| Galat server 5xx | Semua halaman | "Ada gangguan di server" | Pesan `galat` dari server bila ada | Coba lagi |
| 401 keluarga | Halaman keluarga | — | Arahkan ke `/` | — |
| 401 dokter | Halaman klinik | — | Arahkan ke `/klinik/masuk?kembali=…` | — |
| Kode akses salah | `/masuk` | — | "Kode tidak dikenal. Periksa lagi huruf dan angkanya." | — |
| Login dokter salah | `/klinik/masuk` | — | "Email atau kata sandi salah." | — |
| Token bagikan salah | `/r/:token` | "Link tidak berlaku" | "Minta keluarga membagikan link baru." | — |
| Klaim 409 | `/r/:token` | — | "Anak ini sudah menjadi pasien klinik lain." | — |
| LLM gagal | Resep | "AI tidak tersedia" | "Isi aturan secara manual. Semua kolom tetap sama." | Form manual terbuka |
| Ringkasan dari template | Laporan, dashboard | — | Lencana "Ringkasan otomatis" | — |

Semua pesan galat memakai `PesanGalat` (latar jagung muda, teks jagung tua, ikon `peringatan`). Pesan dari server (`{ galat }`) sudah dalam bahasa Indonesia dan ditampilkan apa adanya.

---

## 17. Etika desain

| Larangan | Alasan |
|---|---|
| Hitung mundur palsu, "tinggal X slot", harga coret di paywall | Dark pattern |
| Streak yang hilang bila satu hari terlewat, atau pesan "Anda melewatkan…" | Membuat pengasuh merasa bersalah. Stiker 7 hari tidak punya hukuman |
| Menampilkan jumlah ditolak sebagai angka besar di layar keluarga | Membuat makan terasa sebagai ujian. Angka ditolak hanya kecil di laporan |
| Membandingkan anak dengan anak lain | Tidak relevan dan menekan |
| Hadiah berupa video, game, atau waktu layar tambahan | Bertentangan dengan lepas layar. Hadiah hanya stiker |
| Notifikasi push | Ditunda; bila dibuat, hanya pengingat jam makan yang diatur keluarga |
| Menyembunyikan tombol Stop | Pengasuh harus selalu bisa berhenti |
| Meminta data yang tidak dipakai (nama lengkap, alamat, NIK, foto) | Data minimum |
| Menampilkan pratinjau kamera besar | Kamera bukan tontonan; pratinjau kecil hanya untuk pengasuh |
| Menyimpan atau menampilkan cuplikan wajah anak | Video tidak keluar dari perangkat, dan tidak disimpan di perangkat juga |

---

## 18. Checklist QA per layar

Jalankan untuk setiap rute sebelum titik integrasi. Simpan screenshot di `docs/layar/<rute>.png` (390 px dan 1280 px).

**Tata letak**
- [ ] Benar di 360, 390, 768, 1280 px; `document.documentElement.scrollWidth === innerWidth`.
- [ ] Tombol utama tidak tertutup keyboard HP saat isian fokus.
- [ ] Tidak ada teks terpotong pada nama panggilan 20 karakter dan nama pengasuh 30 karakter.

**Warna dan tipografi**
- [ ] Tidak ada kelas `red-` (`grep -rn "red-" src` kosong).
- [ ] Tidak ada teks berwarna jagung atau kerupuk di atas nasi.
- [ ] Semua teks ≥ 14 px (kecuali catatan kaki landing 13 px).
- [ ] Angka tabel rata kanan dengan `tabular-nums`.

**Interaksi**
- [ ] Semua target ≥ 48 px; Suap ≥ 96 px dan tidak tertutup apa pun.
- [ ] Satu tombol `utama` per layar.
- [ ] Fokus terlihat saat Tab; lembar bawah menjebak dan mengembalikan fokus.
- [ ] Semua panggilan lewat `panggil()`; tidak ada `fetch(` di halaman.

**Keadaan**
- [ ] Memuat (> 300 ms) memakai `Memuat`.
- [ ] Kosong punya kalimat dan aksi.
- [ ] Galat memakai `PesanGalat` dengan pesan server.
- [ ] Offline setelah satu kunjungan: landing dan sesi `?sumber=slider` tetap jalan.

**Layar sesi tambahan**
- [ ] Klip pertama terdengar tanpa ketukan tambahan di Chrome Android.
- [ ] Layar tidak mati selama 5 menit (Wake Lock).
- [ ] `MENOLAK` tidak memutar `hore` dan tidak beranimasi selain kedip.
- [ ] Strip teks hilang setelah 8 detik; teks yang sama tidak muncul lagi dalam 60 detik.
- [ ] Tahap 2: karakter hanya muncul saat giliran. Tahap 3: layar hitam, hanya strip, Suap, Stop.
- [ ] Sisi pengasuh kiri dan kanan sama-sama dicoba: Suap dan pratinjau pindah sisi, menoleh ke pengasuh tidak terbaca menolak.
- [ ] Ketuk wajah di pratinjau memilih wajah yang benar (koordinat cermin sudah dibalik).
- [ ] `prefers-reduced-motion`: goyang dan percikan mati, mulut tetap meniru.

**Bahasa**
- [ ] Tidak ada kata di tabel 14.4.
- [ ] Format tanggal, jam, uang, desimal sesuai 14.3.
- [ ] Semua teks AI berlabel "Dibuat oleh AI dari data sesi".
