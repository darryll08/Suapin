# Hasil uji akurasi deteksi

Pemilik: A (Darryl). Kartu A3.2.

## Cara

1. Rekam di `/dev/kamera`, satu rekaman per perilaku (pilih uji yang sesuai di dropdown), dengan sendok dan makanan asli.
2. Salin `X.json` + `X.suap.json` ke `uji/mesin/data/`.
3. Jalankan `npx tsx uji/mesin/akurasi.ts` dan tempel keluarannya di bawah.

Label tiap suapan diambil dari jenis uji: "Mulut terbuka", "Sendok", "aaa", "Dua wajah" = harus diterima; "Menoleh menjauh" = harus ditolak; "Menoleh ke pengasuh" = tidak boleh ditolak; "Mulut terbuka lama" = tidak boleh diterima. Hasil "tidak pasti" ditanyakan ke pengasuh di aplikasi dan dihitung sebagai tidak benar.

## Populasi

_(diisi: orang dewasa, n = …, jumlah percobaan, laptop/kamera, pencahayaan)_

## Hasil

_(diisi dari keluaran skrip: tabel per uji, precision/recall/F1 untuk diterima dan ditolak, jumlah tidak pasti)_

## Ambang yang dipakai

_(diisi: `AMBANG_AWAL` final, terutama `batasBukaDetik`)_

Klaim: diuji pada orang dewasa, belum diuji pada balita.
