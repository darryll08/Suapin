// Pemilik: B (Satya). Laporan `/laporan` (B3.5, UI UX 10.11): ringkasan AI → bagikan → sesi 14 hari.
import { useState } from "react";
import { cariMakanan } from "../../../bersama/konten/makanan.ts";
import { LabelAI } from "../../komponen/beranda.tsx";
import { Kartu, KepalaHalaman, Memuat, PesanGalat, Tombol } from "../../komponen/dasar.tsx";
import { LembarBawah } from "../../komponen/lembar.tsx";
import { wadahKeluarga } from "../../gaya/gaya.ts";
import { formatTanggal, useMuat } from "./bantu.ts";
import { api, type Ringkasan, type SesiLaporan } from "./data.ts";
import { useSaya } from "./tata-letak.tsx";

export function Laporan() {
  const { saya } = useSaya();
  const c = saya.child;
  const { data: lap, galat, memuat, ulangi } = useMuat(() => api.laporan(c.id), [c.id]);
  const [ringkasan, setRingkasan] = useState<Ringkasan | null>(null);
  const [memuatR, setMemuatR] = useState(false);
  const [galatR, setGalatR] = useState("");
  const [link, setLink] = useState("");
  const [memuatB, setMemuatB] = useState(false);
  const [galatB, setGalatB] = useState("");

  const buatRingkasan = async () => {
    setMemuatR(true); setGalatR("");
    try { setRingkasan(await api.ringkasan(c.id)); } catch (e) { setGalatR(e instanceof Error ? e.message : String(e)); }
    finally { setMemuatR(false); }
  };
  const bagikan = async () => {
    setMemuatB(true); setGalatB("");
    try { const r = await api.bagikan(); setLink(`${location.origin}${r.url}`); }
    catch (e) { setGalatB(e instanceof Error ? e.message : String(e)); }
    finally { setMemuatB(false); }
  };

  const teksRingkasan = ringkasan?.keluarga ?? lap?.ringkasan_keluarga ?? null;
  const sumber = ringkasan?.sumber ?? "cache";

  return (
    <main className={wadahKeluarga}>
      <KepalaHalaman judul={`Laporan makan ${c.panggilan}`} kembali="/beranda" />
      {memuat && !lap ? <Memuat /> : galat ? <PesanGalat pesan={galat} ulangi={ulangi} /> : lap && (
        <div className="flex flex-col gap-5">
          <Kartu className="flex flex-col gap-3">
            <h2 className="font-judul text-subjudul font-bold">Ringkasan minggu ini</h2>
            {memuatR ? <Memuat teks="Menyusun ringkasan…" /> : teksRingkasan ? (
              <>
                <LabelAI sumber={sumber} />
                <p className="border-l-[3px] border-ungu-muda pl-3 text-isi">{teksRingkasan}</p>
              </>
            ) : (
              <Tombol varian="kedua" onClick={buatRingkasan}>Buat ringkasan minggu ini</Tombol>
            )}
            {galatR && <PesanGalat pesan={galatR} ulangi={buatRingkasan} />}
          </Kartu>

          <Tombol memuat={memuatB} onClick={bagikan} className="sm:w-full">Bagikan ke dokter</Tombol>
          {galatB && <PesanGalat pesan={galatB} />}

          <section className="flex flex-col gap-4">
            <h2 className="font-judul text-subjudul font-bold">Sesi 14 hari terakhir</h2>
            {lap.sesi.length === 0 ? <p className="text-isi text-ungu-muda">Belum ada sesi.</p> : <DaftarSesi sesi={lap.sesi} />}
          </section>
        </div>
      )}
      {link && <LembarBagikan link={link} panggilan={c.panggilan} tutup={() => setLink("")} />}
    </main>
  );
}

function DaftarSesi({ sesi }: { sesi: SesiLaporan[] }) {
  const perHari = new Map<string, SesiLaporan[]>();
  for (const s of [...sesi].sort((a, b) => (b.tanggal + b.jam).localeCompare(a.tanggal + a.jam))) {
    perHari.set(s.tanggal, [...(perHari.get(s.tanggal) ?? []), s]);
  }
  return (
    <ul className="flex flex-col gap-3">
      {[...perHari].map(([tgl, daftar]) => (
        <li key={tgl}>
          <h3 className="text-kecil font-semibold text-ungu-muda">{formatTanggal(tgl)}</h3>
          <ul>
            {daftar.map((s) => (
              <li key={s.id} className="border-b border-garis/50 py-2 text-isi tabular-nums">
                {s.jam} · {cariMakanan(s.menu).nama === "Lainnya" ? "Menu lain" : cariMakanan(s.menu).nama} · {s.diterima} diterima · {s.ditolak} ditolak
                {s.ngemut > 0 && ` · ${s.ngemut} ngemut`} · {s.durasi} mnt
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function LembarBagikan({ link, panggilan, tutup }: { link: string; panggilan: string; tutup: () => void }) {
  const [tersalin, setTersalin] = useState(false);
  const bisaBagi = typeof navigator.share === "function";
  const salin = async () => {
    try { await navigator.clipboard.writeText(link); } catch { /* abaikan */ }
    setTersalin(true);
    setTimeout(() => setTersalin(false), 2000);
  };
  return (
    <LembarBawah judul="Bagikan ke dokter" tutup={tutup}>
      <p className="truncate rounded-isian border-2 border-garis bg-latar px-3 py-3 font-mono text-kecil" title={link}>
        {link.length > 44 ? `${link.slice(0, 26)}…${link.slice(-14)}` : link}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Tombol onClick={salin} className="sm:w-full">{tersalin ? "✓ Tersalin" : "Salin link"}</Tombol>
        {bisaBagi && (
          <Tombol varian="kedua" className="sm:w-full"
            onClick={() => void navigator.share({ title: `Laporan makan ${panggilan}`, url: link }).catch(() => {})}>
            Bagikan
          </Tombol>
        )}
      </div>
      <p className="text-kecil text-ungu-muda">Siapa pun yang punya link ini bisa melihat laporan. Kirim hanya ke dokter Anda.</p>
    </LembarBawah>
  );
}
