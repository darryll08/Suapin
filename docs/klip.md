# Klip suara (B1.4) · DRAF

Semua kalimat di `bersama/konten/klip.ts` berstatus **draf** sampai ditinjau dokter anak atau ahli gizi.

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
