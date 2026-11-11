# `uji/mesin/`

**Pemilik:** A (Darryl) · **Titik:** I0–I3

Tes Vitest untuk deteksi dan engine.

**Isi:**

- `*.test.ts`: tes kontrak, sinyal, pilih wajah, kunyah, engine sesi, alat gerbang.
- `data/`: rekaman dari `/dev/kamera`. Setiap rekaman `X.json` punya pasangan `X.suap.json` (waktu Suap, uji, penguji). Rekaman otomatis muncul sebagai `?sumber=rekaman:<nama>`.
- `akurasi.ts`: memutar ulang rekaman ke engine dan mencetak tabel gerbang, usulan `batasBukaDetik`, serta precision/recall/F1.

  ```bash
  npx tsx uji/mesin/akurasi.ts
  npx tsx uji/mesin/akurasi.ts uji/mesin/data batasBukaDetik=6
  ```

  Label diambil dari nama uji (mis. "Menoleh menjauh" = harus ditolak). Untuk label manual, tulis `suap: [{ "t": ..., "label": "diterima" }]` di file `.suap.json`.

Kartu dan aturan lengkap ada di prompt jobdesk pemilik. Edit hanya folder milik sendiri.
