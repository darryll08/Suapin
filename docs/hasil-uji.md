# Hasil uji akurasi deteksi

Pemilik: A (Darryl). Kartu A3.2.

## Cara

1. Rekam di `/dev/kamera`, satu rekaman per perilaku (pilih uji yang sesuai di dropdown), dengan sendok dan makanan asli.
2. Salin `X.json` + `X.suap.json` ke `uji/mesin/data/`.
3. Jalankan `npx tsx uji/mesin/akurasi.ts` dan tempel keluarannya di bawah.

Label tiap suapan diambil dari jenis uji: "Mulut terbuka", "Sendok", "aaa", "Dua wajah" = harus diterima; "Menoleh menjauh" = harus ditolak; "Menoleh ke pengasuh" = tidak boleh ditolak; "Mulut terbuka lama" = tidak boleh diterima. Hasil "tidak pasti" ditanyakan ke pengasuh di aplikasi dan dihitung sebagai tidak benar.

## Populasi

Satu orang dewasa (anggota tim) memperagakan perilaku balita di depan webcam laptop, ruangan dengan lampu biasa, ±14 fps. 90 percobaan dari 8 uji berekaman di `uji/mesin/data/`, 12–13 Nov 2026. Uji "Dua wajah" dinilai dari tabel percobaan karena rekaman sinyalnya tidak tersimpan (lihat `docs/gerbang.md`).

## Hasil

Keluaran `npx tsx uji/mesin/akurasi.ts` (ambang `AMBANG_AWAL`):

| Uji | Syarat | Hasil | Lolos |
|---|---|---|---|
| Angguk tanpa mengunyah | ≥ 9/10 | 11/11 | ya |
| Kunyah bibir tertutup, makanan asli | ≥ 7/10 | 9/10 | ya |
| Menoleh ke arah pengasuh | ≥ 9/10 | 10/10 | ya |
| Menoleh menjauh | ≥ 9/10 | 10/10 | ya |
| Mulut sudah terbuka / aaa 3 detik lalu tutup | ≥ 8/10 | 8/11 | belum |
| Mulut terbuka lama (pura-pura menangis) | ≥ 9/10 | 10/18 | belum |
| Mulut terbuka setelah Suap | ≥ 9/10 | 9/10 | ya |
| Sendok + makanan asli, disuapi dari samping | ≥ 8/10 | 10/10 | ya |

- Diterima: precision 1,00, recall 0,87, F1 0,93 (TP 27, FP 0, FN 4).
- Ditolak: precision 0,91, recall 1,00, F1 0,95 (TP 10, FP 1, FN 0).
- Tidak pasti: 3 dari 41 suapan, ditanyakan ke pengasuh dan dihitung tidak benar.
- Lama buka uji sendok (n = 10): min 0,40 s, median 0,94 s, p90 1,26 s.

## Ambang yang dipakai

`AMBANG_AWAL` di `src/mesin/ambang.ts`: `terbuka` 0,3, `tutup` 0,15 selama 0,5 s, `batasBukaDetik` 6,5 (p90 lama buka uji 1 = 5,3 s, ditambah 1 s), jendela 6 s (maks 12 s), buffer 3 s sebelum Suap, menolak bila yaw menjauh > 25° selama ≥ 1 s, `kunyahPitchMaks` 4°. Usulan rumus dari uji sendok (2,5 s) tidak dipakai karena menjatuhkan uji aaa dan uji 1.

Klaim: diuji pada orang dewasa, belum diuji pada balita.
