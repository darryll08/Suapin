// Pemilik: B (Satya). Persiapan sesi `/sesi` (B2.1, UI UX 10.7). Tiga langkah dalam satu halaman.
// `sisiPengasuh` = dilihat dari arah anak menghadap layar (disepakati A+B, docs/status.md).
import { useState } from "react";
import { Link } from "react-router";
import { MAKANAN } from "../../../../bersama/konten/makanan.ts";
import { KepalaHalaman, Tombol } from "../../../komponen/dasar.tsx";
import { tombolUtama, wadahKeluarga } from "../../../gaya/gaya.ts";
import { NAMA_SAPAAN } from "../bantu.ts";
import type { Saya } from "../data.ts";

export type PilihanSesi = { menu: string; makananBaru: boolean; sisi: "kiri" | "kanan" };

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

  if (!saya.sesi_dibuka) {
    const kunci = saya.alasan_terkunci;
    return (
      <main className={wadahKeluarga}>
        <KepalaHalaman judul="Sesi belum dibuka" kembali="/beranda" />
        <p className="mb-6 text-isi">
          {kunci === "trial_habis" ? "Trial 5 hari sudah selesai. Lanjutkan program untuk membuka sesi lagi."
            : kunci === "tanda_bahaya" ? "Sebaiknya periksa ke dokter dulu. Dokter bisa membuka program lewat link laporan."
              : "Isi skrining dulu supaya program aman untuk anak."}
        </p>
        <Link className={tombolUtama} to={kunci === "trial_habis" ? "/langganan" : kunci === "tanda_bahaya" ? "/laporan" : "/mulai/skrining"}>
          {kunci === "trial_habis" ? "Lanjutkan program" : kunci === "tanda_bahaya" ? "Bagikan laporan ke dokter" : "Isi skrining"}
        </Link>
      </main>
    );
  }

  if (tahap >= 4) {
    return (
      <main className={wadahKeluarga}>
        <KepalaHalaman judul="Siapkan makan" kembali="/beranda" />
        <div className="rounded-kartu bg-ungu-tint p-5 text-isi">
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
    await mulai({ menu, makananBaru: baru, sisi });
  };

  return (
    <main className={wadahKeluarga}>
      <KepalaHalaman judul="Siapkan makan" kembali="/beranda" />
      <section className="flex flex-col gap-3">
        <h2 className="font-judul text-subjudul font-bold">1 Menu hari ini</h2>
        <div className="grid grid-cols-2 gap-3">
          {MAKANAN.map((m) => (
            <button key={m.id} type="button" aria-pressed={menu === m.id} onClick={() => setMenu(m.id)}
              className={`flex flex-col items-center gap-2 rounded-kartu border-2 bg-permukaan p-3 text-isi font-semibold transition-colors ${menu === m.id ? "border-ungu bg-ungu-tint" : "border-garis"}`}>
              <img src={m.gambar[0]} alt="" className="size-24" />
              {m.nama}
            </button>
          ))}
        </div>
        <label className="flex min-h-12 items-start gap-3">
          <input type="checkbox" className="mt-1 size-6 shrink-0 accent-ungu" checked={baru} onChange={(e) => setBaru(e.target.checked)} />
          <span>
            <span className="block text-isi font-semibold">Makanan baru?</span>
            <span className="block text-kecil text-ungu-muda">Makanan yang belum biasa dimakan. Dihitung di pelacak 10 kali coba.</span>
          </span>
        </label>
      </section>

      {menu && (
        <section className="pudar-masuk mt-6 flex flex-col gap-3">
          <h2 className="font-judul text-subjudul font-bold">2 {sapaan} duduk di sebelah mana anak?</h2>
          <IlustrasiDuduk sisi={sisi} />
          <div className="grid grid-cols-2 gap-3">
            {(["kiri", "kanan"] as const).map((s) => (
              <button key={s} type="button" aria-pressed={sisi === s} onClick={() => setSisi(s)}
                className={`min-h-14 rounded-tombol border-2 text-tombol font-bold transition-colors ${sisi === s ? "border-ungu bg-ungu text-permukaan" : "border-garis bg-permukaan text-ungu"}`}>
                {s === "kiri" ? "Kiri anak" : "Kanan anak"}
              </button>
            ))}
          </div>
          <p className="text-kecil text-ungu-muda">Dilihat dari arah anak menghadap layar.</p>
        </section>
      )}

      {menu && sisi && (
        <section className="pudar-masuk mt-6 flex flex-col gap-3 pb-6">
          <h2 className="font-judul text-subjudul font-bold">3 Posisi HP</h2>
          <p className="text-isi">Letakkan HP sedikit di samping depan anak, setinggi wajahnya. Wajah anak harus terlihat. Jauhkan HP dari jangkauan tangan anak.</p>
          <Tombol className="mt-2 sm:w-full" memuat={memuat} onClick={tekanMulai}>{memuat ? "Menyiapkan…" : "Mulai makan"}</Tombol>
        </section>
      )}
    </main>
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
