# Identitas visual Suapin

Dikunci Darryl, 10 November 2026. Acuan untuk logo, warna, ikon PWA, dan video.

## Logo

Sendok miring 40°, kepala sendok di kanan atas, dengan satu kilau di kepala sendok. Arah ini terbaca "sedang disodorkan ke mulut" dan bergerak maju. Logo tidak memakai huruf S, bulatan, huruf A, atau mangkuk (semua sudah ditolak).

| File | Latar | Sendok | Kilau | Pakai untuk |
|---|---|---|---|---|
| `suapin-logo-transparan.svg` | Tanpa latar | Ubi ungu | Jagung | Header web, dokumen, slide di latar terang. Jangan di latar gelap |
| `suapin-ikon-jagung-ungu.svg` | Jagung | Ubi ungu | Nasi | Stiker, poster, sampul video |
| `suapin-ikon-ungu-putih.svg` | Ubi ungu | Nasi (putih) | Jagung | **Ikon utama**: PWA, favicon, splash |
| `suapin-ikon-jagung-putih.svg` | Jagung | Nasi (putih) | Ubi ungu | Hanya ukuran besar (banner). Kontras lemah ±2:1 |

Ikon: kotak 120×120 dengan sudut `rx=28`. Bentuk sendok sama di semua file. Bila diubah, ubah di semua file.

## Palet

Filosofi: makanan lokal yang anak suka, sebagai pintu masuk ke makanan baru. Bukan kunyit atau terong, karena anak tidak suka keduanya.

| Nama | Hex | Peran | Token Tailwind |
|---|---|---|---|
| Nasi | `#FAF6EE` | Latar | `--color-latar` |
| Jagung manis | `#E0A526` | Aksen, sorotan, peringatan lembut | `--color-jagung` |
| Jagung tua | `#8A5F0B` | Teks peringatan atau galat di atas nasi | `--color-jagung-tua` |
| Ubi ungu | `#4B2E5A` | Aksi utama, judul, teks | `--color-ungu` |
| Kerupuk | `#C9B79C` | Garis, latar sekunder | `--color-garis` |

- Tidak ada merah. Galat, tanda bahaya skrining, dan kolom resep bermasalah memakai jagung (garis/latar) + teks jagung tua + ikon.
- Teks di atas nasi: pakai ubi ungu (kontras ±10:1). Jagung hanya untuk bidang, jangan untuk teks kecil.
- `#8A5F0B` ditambahkan untuk teks peringatan karena jagung terlalu terang untuk teks. Kontrasnya belum diukur alat; cek ≥ 4,5:1 saat build.
- `suapin-palet.svg` berisi contoh warna.
