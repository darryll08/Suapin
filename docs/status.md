# Status

Tulis bagianmu di akhir setiap titik integrasi: apa yang jadi, apa yang belum, keputusan. Sesi Claude berikutnya cukup membaca file ini. Setiap orang hanya mengedit bagiannya.

## Perbedaan dari prompt jobdesk (dicatat A, 10 Nov)

- **Lint memakai oxlint, bukan ESLint.** Template Vite terbaru sudah memakai oxlint dan TypeScript 7; `typescript-eslint` belum tentu mendukung TS 7. Akibatnya tidak ada `eslint.config.js`; aturan lint ada di `.oxlintrc.json`. `npm run lint` = `oxlint`.
- **`npm run periksa`** = `tsc -b && oxlint && vitest run && vite build`.
- **`@types/bcryptjs` tidak dipasang**, karena `bcryptjs` 3 sudah membawa tipe sendiri.
- **Tiga tsconfig:** `tsconfig.app.json` (`src/`, `bersama/`), `tsconfig.server.json` (`server/`, `api/`, `scripts/`, `uji/`, `bersama/`), `tsconfig.node.json` (`vite.config.ts`). Alias `@bersama/*` → `bersama/*` berlaku di Vite, Vitest, tsc, dan tsx.
- **Stub yang dibuat A di folder orang lain** supaya `npm run dev` dan build jalan: `src/main.tsx`, `src/app.tsx`, `src/gaya/token.css` (B); `src/halaman/klinik/rute.tsx`, `server/app.ts`, `server/dev.ts` (C). Pemiliknya bebas mengganti isinya. Proxy Vite ke `127.0.0.1:8787`; `server/dev.ts` mendengarkan di host yang sama.
- **tsconfig disiapkan untuk kode C:** `erasableSyntaxOnly` dilepas (parameter properti di kelas) dan `tsconfig.server.json` memakai lib `DOM` supaya `Response.json()` di tes bertipe `any`.
- **Dokumen acuan** ada di `docs/produk/`: Dokumen Produk 3.4, PRD, UI/UX Guidelines.
- **Usulan menunggu kesepakatan A + B:** `sisiPengasuh` didefinisikan dari arah anak menghadap layar (UI/UX Guidelines 10.7), bukan "dari sudut pandang kamera" seperti kartu B2.1.
- Versi terpasang (dikunci tanpa `^`): React 19.3.1, React Router 8.5.1, Vite 8.3.7, TypeScript 7.0.2, Tailwind 4.3.5, Vitest 5.1.0, Hono 4.13.17, Drizzle ORM 0.45.4, Zod 4.6.7, OpenAI SDK 7.55.0, MediaPipe tasks-vision 1.2.2.

## A (Darryl)

**I0 · 10 Nov 2026**

- A0.1 kerangka di-push (b4af8f2). Kode Adit (66d2bf5) di-revert oleh Adit sendiri; Adit push ulang di atas kerangka.
- A0.2: `public/mediapipe/face_landmarker.task` (float16 v1, 3.758.596 byte, sha256 `64184e22…bc9ff`) di-commit. WASM disalin `postinstall`. Diuji di browser: model + WASM termuat dari localhost dalam ±0,8 detik, tidak ada request ke luar localhost.
- A0.3: `bersama/kontrak/sinyal.ts`, `sesi.ts` (persis jobdesk 2.2–2.3; `SesiSelesaiSchema` memakai `z.strictObject` dan `z.iso.datetime()` karena gaya lama sudah usang di Zod 4). Rekaman contoh `bersama/kontrak/contoh/rekaman-sinyal.json` dibuat skrip `uji/mesin/buat-rekaman-contoh.ts` (30 detik, 20 fps: 3 suapan, 1 menoleh menjauh, 2 detik tidak terlihat). Tes `uji/mesin/kontrak.test.ts` 8 kasus, termasuk K5 (kolom `landmark` ditolak).
- `sesi.ts` butuh `IdKlip` dan `IdTeks`, jadi A mengisi awal `bersama/konten/klip.ts` dan `teks.ts` dengan daftar id dan kalimat draf dari jobdesk 2.6. **Satya: file ini milikmu**, silakan lanjutkan (variasi, sapaan lain, `makanan.ts`). Id yang ada tidak boleh dihapus.
- A0.4: `/dev/kamera` (lazy, tidak ikut bundle utama) menampilkan pratinjau, fps, jumlah wajah, `jawOpen`, yaw mentah. `src/deteksi/pelacak.ts` = versi dasar A1.1 (GPU dengan cadangan CPU, 640×480, dibatasi 20 fps, pesan galat kamera Indonesia).
- **Belum diuji dengan kamera sungguhan** (panel browser Claude memblokir kamera). Darryl: buka `/dev/kamera` di Chrome laptop final, pastikan `jawOpen` naik saat mulut dibuka dan fps ≥ 15.

**Menuju gerbang · 11 Nov 2026 dini hari**

- A1.1–A1.4 dan A2.1 selesai: `src/deteksi/` (pelacak, pilih-wajah, baseline, sinyal, sumber-kamera), `src/mesin/ambang.ts` (semua angka ambang, simpan di `localStorage` `tm_ambang_v1`), `src/mesin/kunyah.ts`, `src/dev/sinyal-palsu.ts` + `/dev/sinyal` + `PanelSlider`. 37 tes lolos.
- `/dev/kamera` sekarang alat gerbang: pilih sisi pengasuh, kalibrasi 3 detik, ketuk wajah di pratinjau, tombol Suap pencatat (jendela 3 detik sebelum + 12 detik sesudah), statistik lama buka + usulan `batasBukaDetik`, Rekam sinyal → unduh JSON, Unduh log.
- Rekaman gerbang yang diunduh disimpan di `uji/mesin/data/`; otomatis muncul sebagai `?sumber=rekaman:<nama>` dan dipakai tes regresi A2.2.
- `sisiPengasuh` didefinisikan dari arah anak menghadap layar (Guidelines 10.7). Tanda yaw mentah = konstanta `TANDA_YAW_KANAN_ANAK` di `src/deteksi/sinyal.ts`, diverifikasi saat gerbang.

**Engine sesi · 11 Nov 2026**

- A2.2 `src/mesin/sesi.ts`: state machine murni `next(keadaan, kejadian, konteks)`, 12 status sesuai II.6.5. Tampilan dibaca lewat `tampilan()`, hasil lewat `hasilSesi()`. Kalibrasi 3 detik diatur engine sendiri (perintah `kalibrasi`), jadi tidak ada kejadian `kalibrasi_selesai`. Tidak ada angka ambang di file ini (K10).
- Keputusan saat membangun: (1) kunyah dianggap aktif hanya bila siklus terakhir ≤ 1,25 detik lalu, supaya suapan berikutnya tidak ditolak "masih ngunyah" sampai 3 detik setelah rahang berhenti; (2) wajah hilang > 1,5 detik hanya menghentikan MENUNGGU_SUAP dan JEDA_KUNYAH; (3) dugaan ngemut hanya bila belum ada kunyahan sejak jeda mulai dan mulut tertutup 15 detik; (4) Ya pada ngemut mengubah suapan terakhir jadi `ngemut` (dikoreksi); (5) teks "jangan dibujuk" dihapus saat suapan diterima.
- A2.3 `src/mesin/use-sesi-makan.ts`: `useSesiMakan({ aturan, sisiPengasuh, sumber, video, anak })` → `{ tampilan, hasil, galat, fps, slider, mulai, tekan, selesaiPemanasan, pilihWajahDiTitik }`. `sumber = null` = tanpa kamera. Bila kamera gagal, sesi lanjut otomatis dalam mode tombol pengasuh dan `galat` berisi pesannya. `aturan` cukup `{ max_minutes, end_after_refusal_minutes, stage, ngemut_hint }` (cocok dengan `AturanSchema` C). Pemutaran klip, Wake Lock, dan izin audio tetap di layar B.
- A2.4 `src/mesin/tahap.ts`: `saklarTahap(stage)` sesuai II.7.
- `/dev/sesi?sumber=slider|rekaman:contoh|kamera|tanpa&tahap=1..4&sisi=kiri|kanan`: satu sesi penuh dengan tampilan angka. Teruji di browser: slider (kalibrasi → pemanasan → giliran → diterima → jeda redup → menolak → stop → hasil lolos skema), tanpa kamera + tahap 3 (layar hitam, Suap → tadi masuk → Ya → diterima dikoreksi).
- 66 tes lolos, termasuk semua kasus wajib A2.2 dan rekaman contoh (3 diterima, 1 ditolak).
- **Satya:** karakter bisa dikembangkan dengan `/dev/sinyal?sumber=rekaman:contoh` atau slider. `SumberSinyal` dan `PanelSlider` siap dipakai di `/sesi`.
- **Adit:** ganti `KirimanSesiSchema` di `api.ts` dengan `SesiSelesaiSchema` dari `bersama/kontrak/sesi.ts`.

## B (Satya)

**Sesi keluarga utuh · 11 Nov 2026 siang**

- **Keputusan aset (gerbang 11 Nov 12.00): SVG flat.** Karakter digambar SVG di `src/karakter/karakter.tsx` + mulut parametrik `mulut.tsx`; makanan dan stiker SVG di `public/aset/`. Detail di `docs/aset.md`. `MAKANAN` menunjuk `.svg`, bukan `.webp`.
- **Setuju definisi `sisiPengasuh` dari arah anak menghadap layar** (Guidelines 10.7). Suap, Lanjut, dan pratinjau di sisi pengasuh; Stop di sisi jauh.
- **Data sementara:** `panggil()` dan `api.ts` (C) belum ada, jadi semua layar keluarga memanggil `src/halaman/keluarga/data.ts`, server tiruan di localStorage (`tm_contoh_keluarga_v1`) yang mengikuti tabel endpoint 2.5. **Adit:** setelah `panggil()` siap, isi tiap fungsi `api.*` diganti `panggil(...)`; tanda tangan fungsi tetap. Contoh response keluarga di `bersama/kontrak/contoh/keluarga.ts` (TS, bukan JSON; tipe diganti `z.infer` dari skema C).
- Router (B0.2): rute keluarga di bawah `ButuhKeluarga` (401 → `/`, `skrining_belum` → skrining, `trial_habis` → langganan kecuali beranda/laporan). `rutKlinik`/`rutDev` tetap disebar dari file pemiliknya.
- `/sesi` memakai `useSesiMakan` A. Query `?sumber=kamera|slider|rekaman:contoh|tanpa` (default kamera). Pintasan Spasi/L/Esc, Wake Lock, konfirmasi Stop + Darurat 119, koreksi suapan terakhir, simpan gagal → coba lagi (`sessionStorage` `tm_sesi_tertunda`). Tahap 2 karakter hanya saat giliran/diterima; tahap 3 layar hitam; tahap 4 → catat saja.
- Suara: `src/suara/pemutar.ts` (AudioContext dibuka di tombol Mulai makan, antrean 2). **MP3 belum ada** (butuh kunci ElevenLabs); cadangan `speechSynthesis` id-ID. Skrip `npm run klip` siap.
- PWA: manifest + ikon PNG di `vite.config.ts` (blok PWA yang memang diserahkan ke B). Offline belum diuji.
- Mode demo sementara: tombol kecil "Mode demo: keluarga Dika" di footer landing (kode Dika `DKAX7QMP2RHT` hanya di data tiruan). Diganti `POST /api/demo/masuk` setelah C4.2.
- Teruji di browser (Claude Browser, 375 dan 1280 px): landing, beranda Dika, persiapan, sesi `rekaman:contoh` (lewati pemanasan → Suap → diterima + perayaan → jeda redup → Stop → catatan → beranda), laporan. Tanpa scroll samping. **Belum:** kamera asli, HP Android, suara di HP, offline PWA, alur daftar baru di browser.

## C (Adit)

### Integrasi keluarga dan klinik · 11 November 2026

- API Hono, SQLite, seed, dan rute klinik terintegrasi dengan kerangka tim di `2d790ea`. `POST /api/sessions` memakai skema sesi Darryl.
- Sambungan data keluarga yang diserahkan Satya kini memakai `panggil()`. Catatan porsi dan mood dapat disimpan terpisah, laporan keluarga memakai menit, dan stiker disusun Senin–Minggu. Migrasi catatan mempertahankan data lama.
- `npm run periksa` lulus dengan 88 tes dan build Vite/PWA. Chrome dengan SQLite lokal berhasil menyimpan sesi melalui mode tanpa kamera, mencatat porsi, membagikan laporan, mengklaim pasien, mengonfirmasi resep dari cache, dan membaca aturan 20 menit di layar sesi berikutnya.
- Kontrak API, aturan, dan contoh respons menunggu review Darryl dan Satya. Kamera nyata, OpenAI asli, Vercel/Turso, dan mode offline belum diuji bersama.
