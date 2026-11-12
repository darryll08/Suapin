# Klip suara (B1.4) · DRAF

Semua kalimat di `bersama/konten/klip.ts` berstatus **draf** sampai ditinjau dokter anak atau ahli gizi.

## Status 12 Nov 2026 (malam, lanjutan): model eleven_v3
- Dengan `eleven_multilingual_v2`, kalimat pendek ("Mantap!", "Oke", "Tos", "Hore") terbaca berlogat Inggris, dan model itu tidak bisa dipaksa berbahasa Indonesia. Semua 28 klip dibuat ulang dengan `eleven_v3` + `language_code: "id"` (stability 0,5; `nanti_lagi` 1,0 supaya datar). Dipilih Satya setelah membandingkan 5 versi.
- Dicek ulang dengan speech-to-text ElevenLabs (scribe_v1): 3 klip yang salah lafal ("enaknya", "lho", "Tos") dibuat ulang sampai transkripnya cocok. `giliranmu__3` ("Giliran kamu! Aaa…"): bunyi "aaa" terbaca "eh" di semua percobaan; perlu didengar.
- Total 28 klip, ±406 KB.

## Status 12 Nov 2026 (malam): naskah pilihan Satya
- Naskah dipilih Satya dari 83 variasi (draf di folder dokumen, `draf-klip/variasi-naskah.md`). 28 klip dari 12 id, total 413 KB, durasi 0,8–3,5 detik (loop ≤ 3 dtk, pemanasan/penutup ≤ 5 dtk).
- Dibuang: variasi `hore` "Wah, pintar!" (melanggar UI UX 14.4, memuji kepatuhan). `nanti_lagi` sekarang punya variasi "Oke. Aku gigit dulu." (tetap suara datar).
- Hanya kalimat baru yang dibuat ulang (19 klip); audio kalimat lama yang tetap dipakai tidak diubah.

## Status 12 Nov 2026
- Kalimat ditulis ulang supaya lebih natural untuk balita (yuk, nyam, yeay) dan diberi variasi; pemutar memilih acak. 23 klip dari 12 id, total 368 KB (batas 3 MB), durasi 0,8–3,0 detik.
- Dibuat dengan `npm run klip -- --semua` (model `eleven_multilingual_v2`). Pengaturan suara: stability 0,35 + style 0,35 supaya intonasi hidup; `nanti_lagi` stability 0,8 + style 0 supaya datar (UI UX 13). Volume `ffmpeg loudnorm I=-16:TP=-1.5`, 64 kbps.
- Klip `mbak_gigit_duluan` dan `tos_mbak` sekarang tanpa sapaan ("Yuk, semuanya ikut gigit!", "Tos dulu, yuk!"), jadi cocok untuk semua pengasuh. Id-nya tidak diganti karena dikunci di kontrak.
- Klip ikut di-cache PWA (`globPatterns` memuat `mp3`). Bila file hilang, `src/suara/pemutar.ts` jatuh ke `speechSynthesis` id-ID.
- Ganti satu klip: ubah kalimat di `bersama/konten/klip.ts`, lalu `npm run klip -- --paksa <id>`.

## Suara karakter
- Voice ID: `d15jrIAARvF899pDoC6T` (kunci API tetap hanya di `.env.local`)
- Atribusi di README: "Voice by ElevenLabs".
- Batas total klip ≤ 3 MB (`du -ch public/klip/*.mp3`).
