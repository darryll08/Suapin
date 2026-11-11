# Klip suara (B1.4) · DRAF

Semua kalimat di `bersama/konten/klip.ts` berstatus **draf** sampai ditinjau dokter anak atau ahli gizi.

## Status 11 Nov 2026
- Skrip `scripts/buat-klip.ts` siap (`npm run klip`, `npm run klip -- --paksa <id>`). Model `eleven_multilingual_v2` (bisa diganti lewat `ELEVENLABS_MODEL`); cek nama model di dokumentasi ElevenLabs sebelum menjalankan.
- **File MP3 belum dibuat**: butuh `ELEVENLABS_API_KEY` dan `ELEVENLABS_VOICE_ID` di `.env.local` Satya.
- Selama MP3 belum ada, `src/suara/pemutar.ts` mengucapkan kalimat lewat `speechSynthesis` browser (id-ID) sebagai cadangan, supaya sesi tetap bersuara.
- Volume disamakan otomatis dengan `ffmpeg loudnorm I=-16` bila ffmpeg terpasang.

## Suara karakter
- Voice ID: _(isi setelah memilih di Voice Library; tulis id-nya saja, jangan kuncinya)_
- Atribusi di README: "Voice by ElevenLabs".
- Batas total klip ≤ 3 MB (`du -ch public/klip/*.mp3`).
