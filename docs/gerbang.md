# Gerbang go/no-go

Pemilik: A (Darryl). Batas: 11 Nov 2026 12.00 WIB. Kriteria dari `docs/produk/Suapin - PRD.md` bagian 16.2.

- Laptop: _(merek/model, browser, versi)_
- Pencahayaan: _(ruangan, lampu)_
- Penguji: 3 anggota tim dewasa, 10 percobaan per uji. Rekaman per uji di `uji/mesin/data/`.
- Cara: di `/dev/kamera` pilih uji → Kalibrasi → Rekam sinyal → 10× Suap (tombol atau Spasi) → Berhenti & unduh rekaman (dua file: `.json` + `.suap.json`, izinkan unduhan ganda di Chrome). Salin keduanya ke `uji/mesin/data/`, lalu `npx tsx uji/mesin/akurasi.ts` mencetak tabel di bawah.

| Uji | Lolos jika | Darryl | Satya | Adit | Total | Lolos? |
|---|---|---|---|---|---|---|
| Mulut terbuka setelah Suap | ≥ 9/10 terdeteksi | | | | | |
| Sama, sendok berisi makanan asli, disuapi dari samping | ≥ 8/10 diterima | | | | | |
| Mulut sudah terbuka saat Suap, atau "aaa" 3 detik lalu tutup | ≥ 8/10 diterima | | | | | |
| Dua wajah di kamera | wajah anak tetap terpilih 9/10 | | | | | |
| Menoleh menjauh | ≥ 9/10 terdeteksi | | | | | |
| Menoleh ke arah pengasuh | ≥ 9/10 tidak terbaca menolak | | | | | |
| Frame rate | ≥ 15 fps | | | | | |
| Kunyah bibir tertutup, makanan asli | ≥ 7/10 terdeteksi | | | | | |
| Angguk tanpa mengunyah | ≥ 9/10 tidak memicu siklus | | | | | |
| Mulut terbuka lama (pura-pura menangis) | ≥ 9/10 tidak terbaca diterima | | | | | |

## Lama mulut terbuka saat uji sendok

| Min | Median | Persentil 90 | `batasBukaDetik` awal (p90 + 1, dibulatkan 0,5) |
|---|---|---|---|
| | | | |

## Tanda yaw

Anak menoleh ke kanannya sendiri → yaw mentah negatif (±−45°), ke kiri → positif, lurus → ±3°. Jadi `TANDA_YAW_KANAN_ANAK = -1`. Yaw olahan: positif = ke arah pengasuh, negatif = menjauh.

## Keputusan

- [ ] Lolos semua
- [ ] Kunyah gagal → `kunyahDariKamera = false` (jeda selesai lewat timer 15 detik atau Lanjut)
- [ ] Mulut atau menoleh gagal → `hasilDariKamera = false` (hasil suapan dari tombol pengasuh)

Klaim: diuji pada orang dewasa, belum diuji pada balita.
