# Aset gambar (B1.1, B1.2)

**Keputusan 11 Nov 2026 (gerbang aset): SVG flat, bukan ilustrasi WebP berlapis.** Gambar berlapis yang posisinya pas tidak siap sebelum 11 Nov 12.00, jadi dipakai rencana B (UI UX 11.2).

| Aset | File | Sumber | Lisensi |
|---|---|---|---|
| Karakter (kepala, rambut, mata, alis, pipi, badan, tangan) | `src/karakter/karakter.tsx` (SVG di kode, kanvas 400×400) | Dibuat tim (Satya) | Milik tim |
| Mulut parametrik | `src/karakter/mulut.tsx` | Rumus jobdesk B1.3 / UI UX 11.4 | Milik tim |
| Makanan brokoli, umum (3 tahap gigitan) | `public/aset/makanan/{brokoli,umum}_{0,1,2}.svg`, kanvas 512×512 | Dibuat tim, bekas gigitan = mask lingkaran | Milik tim |
| Stiker jagung, nasi, ubi | `public/aset/stiker/*.svg`, kanvas 256×256, bingkai putih | Dibuat tim | Milik tim |
| Ikon PWA | `public/ikon/ikon-192.png`, `ikon-512.png`, `ikon-maskable-512.png` | Render dari `brand/suapin-ikon-ungu-putih.svg` (Chrome headless) | Milik tim |

Tidak ada gambar AI atau aset pihak ketiga. Tanpa merah: bibir cokelat bata `#9C6B5E`, pipi `#F0C4A4`.

Pose (`netral`, `menunggu`, `menggigit`, `enak`, `merayakan`, `santai`, `mengunyah`) dibuat lewat mata, alis, dan gerak CSS (`karakter.css`). Urutan menggigit 2,5 detik dihitung di komponen; makanan berganti tahap pada 900 ms.
