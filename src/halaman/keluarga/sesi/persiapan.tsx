// Pemilik: B (Satya). Persiapan sesi `/sesi` (B2.1, UI UX 10.7), gaya bento. Tiga langkah dalam satu halaman.
// `sisiPengasuh` = dilihat dari arah anak menghadap layar (disepakati A+B, docs/status.md).
import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { MAKANAN, NAMA_KELOMPOK, type KelompokMakanan } from "../../../../bersama/konten/makanan.ts";
import { KepalaHalaman } from "../../../komponen/dasar.tsx";
import { bento, tombolHero, tombolSegmen, tombolUtama, wadahKeluarga, wadahSegmen } from "../../../gaya/gaya.ts";
import { NAMA_SAPAAN } from "../bantu.ts";
import { GambarTokoh, simpanTokoh, TOKOH, tokohTersimpan, type IdTokoh } from "../../../karakter/tokoh.tsx";
import type { Saya } from "../data.ts";

export type PilihanSesi = { menu: string; makananBaru: boolean; sisi: "kiri" | "kanan"; tokoh: IdTokoh };

const KUNCI_SISI = "tm_sisi_pengasuh";
function sisiTersimpan(): "kiri" | "kanan" | null {
  try { const s = localStorage.getItem(KUNCI_SISI); return s === "kiri" || s === "kanan" ? s : null; } catch { return null; }
}

export function Persiapan({ saya, tahap, mulai }: { saya: Saya; tahap: number; mulai: (p: PilihanSesi) => Promise<void> }) {
  const sapaan = NAMA_SAPAAN[saya.child.sapaan];
  const [menu, setMenu] = useState<string | null>(null);
  const [baru, setBaru] = useState(false);
  const [sisi, setSisi] = useState<"kiri" | "kanan" | null>(sisiTersimpan);
  const [memuat, setMemuat] = useState(false);
  const [tokoh, setTokoh] = useState<IdTokoh>(tokohTersimpan);

  if (!saya.sesi_dibuka) {
    const kunci = saya.alasan_terkunci;
    return (
      <main className={wadahKeluarga}>
        <KepalaHalaman judul="Sesi belum dibuka" kembali="/beranda" />
        <p className="mb-6 text-isi">
          {kunci === "trial_habis" ? "Trial 5 hari sudah selesai. Lanjutkan program untuk membuka sesi lagi."
            : kunci === "paket_habis" ? "Program 30 Hari sudah selesai. Perpanjang program untuk membuka sesi lagi."
            : kunci === "tanda_bahaya" ? "Sebaiknya periksa ke dokter dulu. Dokter bisa membuka program lewat link laporan."
              : "Isi skrining dulu supaya program aman untuk anak."}
        </p>
        <Link className={tombolUtama} to={kunci === "trial_habis" || kunci === "paket_habis" ? "/langganan" : kunci === "tanda_bahaya" ? "/laporan" : "/mulai/skrining"}>
          {kunci === "trial_habis" ? "Lanjutkan program" : kunci === "paket_habis" ? "Perpanjang program" : kunci === "tanda_bahaya" ? "Bagikan laporan ke dokter" : "Isi skrining"}
        </Link>
      </main>
    );
  }

  if (tahap >= 4) {
    return (
      <main className={wadahKeluarga}>
        <KepalaHalaman judul="Siapkan makan" kembali="/beranda" />
        <div className={`${bento} text-isi`}>
          Hari ini {sapaan} yang memimpin. Lakukan ritual makan seperti biasa, lalu catat hasilnya.
        </div>
        <Link to="/sesi/catatan?catat=1" className={`${tombolUtama} mt-6`}>Catat hasil makan</Link>
      </main>
    );
  }

  const tekanMulai = async () => {
    if (!menu || !sisi) return;
    setMemuat(true);
    try { localStorage.setItem(KUNCI_SISI, sisi); } catch { /* abaikan */ }
    simpanTokoh(tokoh);
    await mulai({ menu, makananBaru: baru, sisi, tokoh });
  };

  return (
    <main className={`${wadahKeluarga} flex flex-col gap-4`}>
      <KepalaHalaman judul="Siapkan makan" kembali="/beranda" />
      {saya.alasan_terkunci === "tanda_bahaya" && (
        <p className="mb-4 rounded-kartu bg-jagung-muda p-4 text-isi text-ungu">
          <b className="text-jagung-tua">Pengingat:</b> ada jawaban skrining yang perlu dilihat dokter. Sebaiknya konsultasi ke dokter dulu.
        </p>
      )}
      <section className={`${bento} flex flex-col gap-4`}>
        <JudulLangkah n={1}>Pilih teman makan</JudulLangkah>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {TOKOH.map((t) => (
            <button key={t.id} type="button" aria-pressed={tokoh === t.id} onClick={() => setTokoh(t.id)}
              className={`flex min-h-12 flex-col items-center gap-1 rounded-kartu p-2 text-kecil font-semibold transition-colors outline-none focus-visible:ring-4 focus-visible:ring-jagung ${tokoh === t.id ? "bg-ungu-tint ring-2 ring-ungu" : "bg-latar hover:bg-ungu-tint"}`}>
              <svg viewBox="0 0 240 260" className="h-20 w-auto" aria-hidden="true"><GambarTokoh id={t.id} mulut={0} /></svg>
              {t.nama}
            </button>
          ))}
        </div>
      </section>

      <section className={`${bento} flex flex-col gap-4`}>
        <JudulLangkah n={2}>Menu hari ini</JudulLangkah>
        {(Object.keys(NAMA_KELOMPOK) as KelompokMakanan[]).map((k) => (
          <div key={k} className="flex flex-col gap-2">
            <h3 className="text-kecil font-semibold text-ungu-muda">{NAMA_KELOMPOK[k]}</h3>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {MAKANAN.filter((m) => m.kelompok === k).map((m) => (
                <button key={m.id} type="button" aria-pressed={menu === m.id} onClick={() => setMenu(m.id)}
                  className={`flex min-h-12 flex-col items-center gap-1 rounded-kartu p-2 text-kecil font-semibold transition-colors outline-none focus-visible:ring-4 focus-visible:ring-jagung ${menu === m.id ? "bg-ungu-tint ring-2 ring-ungu" : "bg-latar hover:bg-ungu-tint"}`}>
                  <img src={m.gambar[0]} alt="" className="size-14" loading="lazy" />
                  {m.nama}
                </button>
              ))}
            </div>
          </div>
        ))}
        <label className="flex min-h-12 items-start gap-3 rounded-kartu bg-latar p-3">
          <input type="checkbox" className="mt-1 size-6 shrink-0 accent-ungu" checked={baru} onChange={(e) => setBaru(e.target.checked)} />
          <span>
            <span className="block text-isi font-semibold">Makanan baru?</span>
            <span className="block text-kecil text-ungu-muda">Makanan yang belum biasa dimakan. Dihitung di pelacak 10 kali coba.</span>
          </span>
        </label>
      </section>

      {menu && (
        <section className={`${bento} pudar-masuk flex flex-col gap-4`}>
          <JudulLangkah n={3}>{sapaan} duduk di sebelah mana anak?</JudulLangkah>
          <IlustrasiDuduk sisi={sisi} />
          <div className={`${wadahSegmen} grid-cols-2`}>
            {(["kiri", "kanan"] as const).map((s) => (
              <button key={s} type="button" aria-pressed={sisi === s} onClick={() => setSisi(s)} className={tombolSegmen(sisi === s)}>
                {s === "kiri" ? "Kiri anak" : "Kanan anak"}
              </button>
            ))}
          </div>
          <p className="text-kecil text-ungu-muda">Dilihat dari arah anak menghadap layar.</p>
        </section>
      )}

      {menu && sisi && (
        <section className="pudar-masuk flex flex-col gap-4 rounded-bento bg-ungu p-6 text-latar shadow-kartu">
          <JudulLangkah n={4} gelap>Posisi HP</JudulLangkah>
          <p className="text-isi text-latar/90">Letakkan HP sedikit di samping depan anak, setinggi wajahnya. Wajah anak harus terlihat. Jauhkan HP dari jangkauan tangan anak.</p>
          <button type="button" className={tombolHero} disabled={memuat} aria-busy={memuat || undefined} onClick={tekanMulai}>
            {memuat ? "Menyiapkan…" : "Mulai makan"}
          </button>
        </section>
      )}
    </main>
  );
}

function JudulLangkah({ n, gelap = false, children }: { n: number; gelap?: boolean; children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 font-judul text-subjudul font-bold">
      <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full text-kecil tabular-nums ${gelap ? "bg-jagung text-ungu" : "bg-ungu-tint text-ungu"}`}>{n}</span>
      {children}
    </h2>
  );
}

/** Tampak atas: HP di atas, anak di tengah menghadap HP, dua kursi. Kursi terpilih diisi ungu. */
function IlustrasiDuduk({ sisi }: { sisi: "kiri" | "kanan" | null }) {
  // Anak menghadap ke atas (ke HP), jadi kiri anak = kiri gambar.
  const kursi = (x: number, aktif: boolean) => (
    <g>
      <rect x={x - 22} y="78" width="44" height="44" rx="12" fill={aktif ? "#4B2E5A" : "#FFFDF8"} stroke="#C9B79C" strokeWidth="3" />
      {aktif && <circle cx={x} cy="100" r="11" fill="#FBEFD2" />}
    </g>
  );
  return (
    <svg viewBox="0 0 240 140" className="mx-auto h-32 w-full max-w-[280px]" role="img"
      aria-label={sisi ? `Pengasuh duduk di ${sisi} anak` : "Tampak atas: HP, anak, dua kursi"}>
      <rect x="96" y="6" width="48" height="26" rx="6" fill="#4B2E5A" />
      <text x="120" y="24" textAnchor="middle" fontSize="12" fill="#FFFDF8" fontWeight="700">HP</text>
      <rect x="92" y="74" width="56" height="52" rx="16" fill="#FBEFD2" stroke="#C9B79C" strokeWidth="3" />
      <circle cx="120" cy="92" r="14" fill="#F6D7B8" />
      <path d="M113 80 L120 70 L127 80" fill="none" stroke="#4B2E5A" strokeWidth="3" strokeLinecap="round" />
      <text x="120" y="120" textAnchor="middle" fontSize="11" fill="#4B2E5A">anak</text>
      {kursi(46, sisi === "kiri")}
      {kursi(194, sisi === "kanan")}
      <text x="46" y="136" textAnchor="middle" fontSize="11" fill="#6E5A78">kiri</text>
      <text x="194" y="136" textAnchor="middle" fontSize="11" fill="#6E5A78">kanan</text>
    </svg>
  );
}
