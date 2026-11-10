# Suapin: aturan untuk agen coding

Dibaca otomatis oleh agen coding di repo ini. Berlaku untuk ketiga anggota tim.

- Pembagian folder: lihat tabel di `README.md` dan `README.md` di tiap folder. **Edit hanya folder milik sendiri** (A Darryl, B Satya, C Adit). Butuh perubahan di folder orang lain: minta lewat grup atau GitHub issue.
- `bersama/kontrak/` diubah hanya bila ketiganya setuju, lewat satu commit kecil yang menyebut alasannya.
- Acuan: prompt jobdesk pemilik > `docs/produk/Suapin - PRD.md` > `docs/produk/Suapin - UI UX Guidelines.md` > `docs/produk/Suapin - Dokumen Produk.md`. Perbedaan dicatat di `docs/status.md`.
- Semua panggilan layar ke `/api` lewat `panggil()` di `src/lib/panggil.ts`. Tidak ada `fetch(` lain kecuali `src/suara/` untuk file klip lokal.
- Dependency baru diminta ke A; jangan `npm install` paket sendiri.
- Tidak ada warna merah (`red-`). Tidak ada video, gambar wajah, atau landmark yang dikirim ke server.
- Sebelum push: `git pull --rebase`, lalu `npm run periksa` harus hijau. Jangan force-push ke `main`.
- Commit dari laptop sendiri dengan email GitHub sendiri. Tanpa baris `Co-Authored-By` agen AI.
- Di akhir setiap titik integrasi, tulis bagianmu di `docs/status.md` dan centang `docs/tugas.md` hanya bila ada buktinya.
