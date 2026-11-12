# Aset gambar (B1.1, B1.2)

**Keputusan 11 Nov 2026 (gerbang aset): SVG flat, bukan ilustrasi WebP berlapis.** Gambar berlapis yang posisinya pas tidak siap sebelum 11 Nov 12.00, jadi dipakai rencana B (UI UX 11.2).

| Aset | File | Sumber | Lisensi |
|---|---|---|---|
| Karakter (kepala, rambut, mata, alis, pipi, badan, tangan) | `src/karakter/karakter.tsx` (SVG di kode, kanvas 400×400) | Dibuat tim (Satya) | Milik tim |
| Mulut parametrik | `src/karakter/mulut.tsx` | Rumus jobdesk B1.3 / UI UX 11.4 | Milik tim |
| Makanan: 30 jenis + "Lainnya" (utuh + 4 gigitan) | `public/aset/makanan/<id>_{0..4}.svg`, kanvas 512×512, daftar di `bersama/konten/makanan.ts` | Dibuat tim (SVG flat dari skrip generator, 12 Nov), bekas gigitan = mask lingkaran | Milik tim |
| Stiker jagung, nasi, ubi | `public/aset/stiker/*.svg`, kanvas 256×256, bingkai putih | Dibuat tim | Milik tim |
| Ilustrasi anak (dada ke atas) untuk landing | `public/aset/anak/anak-senyum.webp`, `anak-buka.webp` (512×512, 31 KB) | Dibuat Satya dengan AI image generator (prompt di bawah); latar hitam dibuang, noise merah di garis luar dibersihkan; dua gambar ditukar sesuai bukaan mulut | Gambar AI, dibuat tim |
| Adegan makan sambil nonton (landing, section masalah) | `public/aset/anak/adegan-nonton.webp` (1200×800, 43 KB) | Dibuat Satya dengan AI image generator (prompt di bawah) | Gambar AI, dibuat tim |
| Adegan anak menolak makan (landing, section masalah) | `public/aset/anak/adegan-menolak.webp` (1200×800, 46 KB) | Dibuat Satya dengan AI image generator (prompt di bawah) | Gambar AI, dibuat tim |
| Anak tertawa (landing, kartu "Tujuannya") | `public/aset/anak/anak-tertawa.webp` (512×512, 28 KB) | Dibuat Satya dengan AI image generator; noise merah di garis luar dibersihkan | Gambar AI, dibuat tim |
| Karakter teman makan, versi ilustrasi (hero landing) | `public/aset/karakter/teman-{tutup,buka,rayakan}.webp` (512×512, 28–30 KB) | Dibuat Satya dengan AI image generator, acuan gaya = ilustrasi anak; noise merah di garis luar dibersihkan. Layar sesi masih memakai karakter SVG | Gambar AI, dibuat tim |
| Ikon PWA | `public/ikon/ikon-192.png`, `ikon-512.png`, `ikon-maskable-512.png` | Render dari `brand/suapin-ikon-ungu-putih.svg` (Chrome headless) | Milik tim |

Tidak ada aset pihak ketiga. Gambar AI hanya ilustrasi anak di landing (bukan foto anak sungguhan). Tanpa merah: bibir cokelat bata `#9C6B5E`, pipi `#F0C4A4`.

Pose (`netral`, `menunggu`, `menggigit`, `enak`, `merayakan`, `santai`, `mengunyah`) dibuat lewat mata, alis, dan gerak CSS (`karakter.css`). Urutan menggigit 2,5 detik dihitung di komponen; makanan berganti tahap pada 900 ms.

## Prompt gambar AI (landing, 11 Nov 2026)

Alat: AI image generator (_isi nama alat: ChatGPT/Gemini_). Dibuat dalam satu chat supaya wajah konsisten, lalu disunting Satya sampai rambut dan mulut sesuai.

- Wajah, mulut tertutup: "Children's book vector illustration of a 4-year-old Indonesian boy with short, slightly messy dark brown hair and a soft fringe, shown from the chest up, facing the viewer. Big friendly dark brown eyes with small highlights, soft rosy-peach cheeks, small nose, mouth gently closed with a calm, curious expression. Plain mustard-yellow t-shirt with a small white collar. Clean flat vector with soft cel shading, smooth dark-brown outlines, natural child proportions, not chibi, not anime. Original character. Transparent background, no text."
- Mulut terbuka: "Same child, same pose, same framing… Only change: the mouth is open in a relaxed rounded 'aah' shape." Dipakai utuh, ditukar dengan gambar mulut tertutup.
- Adegan: "Same child and same illustration style. The child sits at a dining table, head turned toward a tablet. From the left, an adult's hand holds a spoon of rice with broccoli near the child's mouth, waiting. The child is calm and neutral, not crying, not being forced. Warm cream background, no text."
- Adegan menolak: "Same boy and style. He sits at a dining table with a bowl of rice and broccoli. An adult's hand gently offers a spoon at a polite distance. The boy covers his mouth with both hands and turns his head slightly away, a stubborn 'no' look. Not crying, not scared, not being forced. Warm cream background, no text, no red."
- Karakter teman makan: "Use the attached boy illustration ONLY as the art style reference. Create a DIFFERENT character: a friendly 'eating buddy' kid about 7 years old, clearly older than the boy, neat short dark brown hair swept to one side. Warm, happy, inviting expression with a gentle closed-mouth smile. Deep purple t-shirt (#4B2E5A) with a cream collar. Chest up. Transparent background, no text, no red." Lalu dua variasi di chat yang sama: mulut terbuka "aah", dan merayakan (mata tertutup melengkung, senyum lebar).
