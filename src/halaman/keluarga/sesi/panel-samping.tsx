// Pemilik: B (Satya). Hiasan layar makan tahap 1 (13 Nov), di DALAM bingkai supaya sama di HP (PWA) dan laptop.
// - KenalanMakanan: badge makanan di atas tengah. Diketuk → bergoyang + gelembung nama + diucapkan (paparan:
//   anak mengenal bentuk dan nama). Jeda 2,5 s supaya tidak jadi mainan ketuk-ketuk.
// - StikerLingkar: tiap suapan diterima, satu stiker terbang dari tombol Suap lalu menempel di tepi lingkaran
//   karakter. Diam saat menolak, tanpa target "habis".
import { useRef, useState, type CSSProperties } from "react";
import { cariMakanan, MAKANAN, STIKER } from "../../../../bersama/konten/makanan.ts";
import { KATA_MAKANAN, pilihKata } from "./kata-makanan.ts";
import "./panel-samping.css";

const JEDA_KETUK_MS = 2500;
let audioKata: HTMLAudioElement | null = null;

// Suara ElevenLabs yang sama dengan karakter (public/klip/kata, `npm run klip`); file belum ada → suara HP.
export function urlKata(id: string, k: string): string {
  const kunci = KATA_MAKANAN[id] ? id : "umum";
  return `/klip/kata/${kunci}__${KATA_MAKANAN[kunci].indexOf(k) + 1}.mp3`;
}

function ucapkanKata(id: string, k: string) {
  audioKata?.pause();
  audioKata = new Audio(urlKata(id, k));
  audioKata.play().catch(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(k);
    u.lang = "id-ID";
    u.pitch = 1.3;
    window.speechSynthesis.speak(u);
  });
}

export function KenalanMakanan({ makanan, diterima, suara }: { makanan: string; diterima: number; suara: boolean }) {
  const m = cariMakanan(makanan);
  const [ketuk, setKetuk] = useState(0);
  const [kata, setKata] = useState<string | null>(null);
  const terakhir = useRef(0);
  const sapa = () => {
    const kini = Date.now();
    if (kini - terakhir.current < JEDA_KETUK_MS) return;
    terakhir.current = kini;
    const k = pilihKata(m.id, kata);
    setKata(k);
    setKetuk((n) => n + 1);
    if (suara) ucapkanKata(m.id, k);
  };
  return (
    <button type="button" onClick={sapa} aria-label={`${m.nama}. Ketuk untuk mendengar namanya`}
      className="kenalan absolute top-4 left-1/2 -translate-x-1/2">
      {/* key: animasi diulang tiap diketuk atau suapan diterima */}
      <span key={`${ketuk}-${diterima}`} className={`kenalan-pil ${ketuk || diterima ? "kenalan-hap" : ""}`}>
        <img src={m.gambar[0]} alt="" draggable={false} className="kenalan-gambar" />
        <span className="kenalan-nama">{m.nama}</span>
        {/* ikon pengeras suara: petunjuk bisa diketuk untuk didengar */}
        <svg viewBox="0 0 24 24" className="kenalan-speaker" aria-hidden="true">
          <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
          <path className="gelombang g1" d="M16 9.5a3.5 3.5 0 0 1 0 5" />
          <path className="gelombang g2" d="M18.5 7a7 7 0 0 1 0 10" />
        </svg>
      </span>
      {kata && <span key={ketuk} className="kenalan-gelembung">{kata}</span>}
    </button>
  );
}

// Tempat tempel di tepi kiri dan kanan lingkaran (derajat, 0 = kanan, 90 = bawah), bergantian kiri-kanan.
// Atas tengah dipakai badge kenalan, bawah tengah dekat tombol Suap.
const SUDUT = [180, 0, 155, 25, 205, -25, 130, 50, 230, -50, 110, 70];
const TEMPAT = SUDUT.map((d) => ({ x: 50 + 47 * Math.cos((d * Math.PI) / 180), y: 50 + 47 * Math.sin((d * Math.PI) / 180) }));
const URUTAN = TEMPAT.map((_, i) => i);

// Stiker: makanan hari ini dulu, lalu stiker brand dan makanan lain berselang-seling supaya beragam.
const LAIN = MAKANAN.filter((x) => x.id !== "umum").map((x) => x.gambar[0]);
const ACAK = LAIN.map((_, i) => LAIN[(i * 7) % LAIN.length]);
function daftarStiker(makanan: string) {
  const utama = cariMakanan(makanan).gambar[0];
  const sisa = ACAK.filter((g) => g !== utama);
  return [utama, ...sisa.flatMap((g, i) => (i < STIKER.length ? [STIKER[i], g] : [g]))];
}

export function StikerLingkar({ diterima, makanan }: { diterima: number; makanan: string }) {
  const stiker = daftarStiker(makanan);
  const tampil = Math.min(diterima, TEMPAT.length);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {Array.from({ length: tampil }, (_, n) => {
        const p = TEMPAT[URUTAN[n]];
        return (
          <span key={n} className={`stiker-lingkar ${n === tampil - 1 ? "stiker-terbang" : ""}`}
            style={{ "--x": `${p.x}%`, "--y": `${p.y}%`, "--putar": `${((n * 37) % 30) - 15}deg` } as CSSProperties}>
            <img src={stiker[n % stiker.length]} alt="" draggable={false} />
          </span>
        );
      })}
      {diterima > TEMPAT.length && <span key={diterima} className="stiker-lebih">+{diterima - TEMPAT.length}</span>}
    </div>
  );
}
