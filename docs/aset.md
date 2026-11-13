# Aset gambar (B1.1, B1.2)

**Keputusan 11 Nov 2026 (gerbang aset): SVG flat, bukan ilustrasi WebP berlapis.** Gambar berlapis yang posisinya pas tidak siap sebelum 11 Nov 12.00, jadi dipakai rencana B (UI UX 11.2).

| Aset | File | Sumber | Lisensi |
|---|---|---|---|
| Karakter (kepala, rambut, mata, alis, pipi, badan, tangan) | `src/karakter/karakter.tsx` (SVG di kode, kanvas 400×400) | Dibuat tim (Satya) | Milik tim |
| Mulut parametrik | `src/karakter/mulut.tsx` | Rumus jobdesk B1.3 / UI UX 11.4 | Milik tim |
| Makanan: 30 jenis + "Lainnya" (utuh + 4 gigitan) | `public/aset/makanan/<id>_{0..4}.svg`, kanvas 512×512, daftar di `bersama/konten/makanan.ts` | Dibuat tim (SVG flat dari skrip generator, 12 Nov), bekas gigitan = mask lingkaran | Milik tim |
| Stiker jagung, nasi, ubi | `public/aset/stiker/*.svg`, kanvas 256×256, bingkai putih | Dibuat tim | Milik tim |
| Tokoh teman makan (Raka, Nara, Mpe, Pao, Dino, Tung) | `src/karakter/tokoh.tsx` (SVG di kode, kanvas 240×260) | Dibuat tim (Darryl, 12 Nov); dipilih keluarga di persiapan sesi | Milik tim |
| Landing: hero demo meniru + 3 adegan (menolak, menatap tablet, senang) | `src/karakter/demo-meniru.tsx`, `src/karakter/adegan-landing.tsx` | Disusun tim (Satya, 13 Nov) dari tokoh SVG + aset makanan dan stiker di atas | Milik tim |
| Ikon PWA | `public/ikon/ikon-192.png`, `ikon-512.png`, `ikon-maskable-512.png` | Render dari `brand/suapin-ikon-ungu-putih.svg` (Chrome headless) | Milik tim |

Tidak ada aset pihak ketiga dan tidak ada gambar buatan AI image generator (ilustrasi AI di landing diganti tokoh SVG pada 13 Nov). Tidak ada foto anak sungguhan. Tanpa merah: bibir cokelat bata `#9C6B5E`, pipi `#F0C4A4`.

Pose (`netral`, `menunggu`, `menggigit`, `enak`, `merayakan`, `santai`, `mengunyah`) dibuat lewat mata, alis, dan gerak CSS (`karakter.css`). Urutan menggigit 2,5 detik dihitung di komponen; makanan berganti tahap pada 900 ms.
