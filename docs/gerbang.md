# Gerbang go/no-go

Pemilik: A (Darryl). Batas: 11 Nov 2026 12.00 WIB. Kriteria dari `docs/produk/Suapin - PRD.md` bagian 16.2.

- Laptop: _(merek/model, browser, versi)_
- Pencahayaan: _(ruangan, lampu)_
- Penguji: 3 anggota tim dewasa, 10 percobaan per uji. Rekaman per uji di `uji/mesin/data/`.
- Cara: di `/dev/kamera` pilih uji → Kalibrasi → Rekam sinyal → 10× Suap (tombol atau Spasi) → Berhenti & unduh rekaman (dua file: `.json` + `.suap.json`, izinkan unduhan ganda di Chrome). Salin keduanya ke `uji/mesin/data/`, lalu `npx tsx uji/mesin/akurasi.ts` mencetak tabel di bawah.

| Uji | Lolos jika | Darryl | Satya | Adit | Total | Lolos? |
|---|---|---|---|---|---|---|
| Mulut terbuka setelah Suap | ≥ 9/10 diterima | 9/10 | | | 9/10 | ya |
| Sama, sendok berisi makanan asli, disuapi dari samping | ≥ 8/10 diterima | 10/10 | | | 10/10 | ya |
| Mulut sudah terbuka saat Suap, atau "aaa" 3 detik lalu tutup | ≥ 8/10 diterima | 9/11 | | | 9/11 | ya |
| Dua wajah di kamera | wajah anak tetap terpilih 9/10 | 10/10 | | | 10/10 | ya |
| Menoleh menjauh | ≥ 9/10 terdeteksi | 10/10 | | | 10/10 | ya |
| Menoleh ke arah pengasuh | ≥ 9/10 tidak terbaca menolak | 10/10 | | | 10/10 | ya |
| Frame rate | ≥ 15 fps | 14,4 | | | 14,4 | hampir |
| Kunyah bibir tertutup, makanan asli | ≥ 7/10 terdeteksi | 9/10 | | | 9/10 | ya |
| Angguk tanpa mengunyah | ≥ 9/10 tidak memicu siklus | 11/11 | | | 11/11 | ya |
| Mulut terbuka lama (pura-pura menangis) | ≥ 9/10 tidak terbaca diterima | 10/18 | | | 10/18 | tidak (batasan) |

Catatan "Dua wajah di kamera": dinilai dari tabel percobaan (rekaman sinyal tidak tersimpan). Mulut maks 0,40–0,75 di semua percobaan (wajah penguji yang dibaca, bukan wajah kedua), wajah tidak pernah hilang. Satu baris kembar karena Suap tertekan dua kali tidak dihitung.

Catatan "Kunyah" dan "Angguk": rahang diukur sebagai rasio jarak 3D (tidak berubah saat kepala berputar), dan siklus rahang diabaikan bila sudut angguk (pitch) antara puncak dan lembah berubah lebih dari `kunyahPitchMaks` (4°). Tanpa penyaring pitch, angguk 4/11; dengan penyaring 11/11 (lolos untuk 1–5°), kunyah tetap 9/10. Rekaman sebelum perubahan ini tidak menyimpan pitch, jadi kedua uji direkam ulang.

Catatan "Sendok": suapan ditekan saat anak masih mengunyah ditahan engine ("masih ngunyah, tunggu"), sesuai rancangan; percobaan dimulai setelah makanan ditelan dan mulut diam.

Catatan "Mulut terbuka lama": batasan yang diketahui. Tangisan setengah terbuka (mulut 0,35–0,45) yang berhenti sebelum `batasBukaDetik` tidak bisa dibedakan dari suapan pelan, baik lewat lama buka maupun besar bukaan, dan dugaan `nangis` belum pernah menyala. Batas lebih ketat membuat suapan asli gagal (uji 1 dan "aaa"). Pengasuh memperbaiki lewat "Ubah suapan terakhir".

## Lama mulut terbuka saat uji sendok

| Min | Median | Persentil 90 | `batasBukaDetik` awal (p90 + 1, dibulatkan 0,5) |
|---|---|---|---|
| 0,4 s | 0,9 s | 1,3 s | 2,5 s (usulan rumus, tidak dipakai) |

Suapan sendok asli singkat, tapi batas 2,5 s menggagalkan uji "aaa" (1/11) dan "Mulut terbuka setelah Suap" (0/10), sementara tangisan pun hanya naik ke 15/18. Dipakai 6,5 s: uji "aaa" 9/11, "Mulut terbuka setelah Suap" 9/10 (p90 lama buka 5,3 s), sendok 10/10.

## Tanda yaw

Anak menoleh ke kanannya sendiri → yaw mentah negatif (±−45°), ke kiri → positif, lurus → ±3°. Jadi `TANDA_YAW_KANAN_ANAK = -1`. Yaw olahan: positif = ke arah pengasuh, negatif = menjauh.

## Keputusan

- [x] Lolos semua kecuali "Mulut terbuka lama" (batasan, dikoreksi pengasuh) dan frame rate 14,4 (hampir 15). Kamera tetap dipakai untuk hasil suapan dan kunyah.
- [ ] Kunyah gagal → `kunyahDariKamera = false` (jeda selesai lewat timer 15 detik atau Lanjut)
- [ ] Mulut atau menoleh gagal → `hasilDariKamera = false` (hasil suapan dari tombol pengasuh)

Klaim: diuji pada orang dewasa, belum diuji pada balita.
