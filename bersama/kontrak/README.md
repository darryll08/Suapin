# `bersama/kontrak/`

**Pemilik:** Bersama (A, B, C) · **Titik:** I0

Kontrak Zod yang menghubungkan tiga orang. Diubah hanya bila ketiganya setuju, lewat satu commit kecil yang menyebut alasannya.

**Isi yang direncanakan:**

- `sinyal.ts`: `SinyalSchema`, `RekamanSinyalSchema` (A, kartu A0.3)
- `sesi.ts`: `StatusSesi`, `Pose`, `TampilanSesiSchema`, `SesiSelesaiSchema` (A, A0.3)
- `aturan.ts`: `AturanSchema`, `ATURAN_DEFAULT` (C, C0.3)
- `api.ts`: satu objek per endpoint (C, C0.3)

Kartu dan aturan lengkap ada di prompt jobdesk pemilik. Edit hanya folder milik sendiri.
