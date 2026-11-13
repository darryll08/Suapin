// Pemilik: B (Satya). Laporan `/laporan` (B3.5, UI UX 10.11), gaya bento: angka 14 hari + grafik pil →
// ringkasan AI → daftar sesi → bagikan ke dokter.
// Pasien klinik: tanpa tombol bagikan (data otomatis terlihat dokternya), cukup satu baris info.
// Keluarga mandiri: kartu kecil di bawah; ditonjolkan di atas hanya bila skrining menemukan tanda bahaya.
import { useState } from "react";
import { cariMakanan } from "../../../bersama/konten/makanan.ts";
import { GrafikPil, KartuAngka, LabelAI, RiwayatTahap, TrackerTahap } from "../../komponen/beranda.tsx";
import { KepalaHalaman, Memuat, PesanGalat, Tombol } from "../../komponen/dasar.tsx";
import { LembarBawah } from "../../komponen/lembar.tsx";
import { bento, tombolTeks, wadahKeluarga } from "../../gaya/gaya.ts";
import { formatTanggal, tanggalLokal, tanggalTerakhir, totalPerHari, useMuat } from "./bantu.ts";
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
  const tandaBahaya = saya.alasan_terkunci === "tanda_bahaya";
  const kartuBagikan = lap && !lap.dokter_nama && (
    <KartuBagikan sorot={tandaBahaya} memuat={memuatB} galat={galatB} bagikan={() => void bagikan()} />
  );
  const sumber = ringkasan?.sumber ?? "cache";

  return (
    <main className={wadahKeluarga}>
      <KepalaHalaman judul={`Laporan makan ${c.panggilan}`} />
      {memuat && !lap ? <Memuat /> : galat ? <PesanGalat pesan={galat} ulangi={ulangi} /> : lap && (
        <div className="flex flex-col gap-4">
          {lap.dokter_nama && (
            <p className="flex items-start gap-2 rounded-kartu bg-ungu-tint p-3 text-kecil">
              <span aria-hidden="true" className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-ungu text-mini font-bold">i</span>
              Laporan ini otomatis terlihat oleh {lap.dokter_nama}.
            </p>
          )}
          {tandaBahaya && kartuBagikan}
          {lap.sesi.length > 0 && <Angka14 sesi={lap.sesi} panggilan={c.panggilan} />}
          <section className={`${bento} flex flex-col gap-4`}>
            <h2 className="font-judul text-subjudul font-bold">Perjalanan tahap</h2>
            <TrackerTahap tahap={lap.tahap} progres={lap.progres_tahap} />
            <RiwayatTahap tahap={lap.tahap} riwayat={lap.riwayat_tahap} />
          </section>

          <section className={`${bento} flex flex-col gap-3`}>
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
          </section>

          <section className={`${bento} flex flex-col gap-4`}>
            <h2 className="font-judul text-subjudul font-bold">Sesi 14 hari terakhir</h2>
            {lap.sesi.length === 0 ? <p className="text-isi text-ungu-muda">Belum ada sesi. Setelah sesi pertama, grafik dan daftar sesi muncul di sini.</p> : <DaftarSesi sesi={lap.sesi} />}
          </section>

          {!tandaBahaya && kartuBagikan}
        </div>
      )}
      {link && <LembarBagikan link={link} panggilan={c.panggilan} tutup={() => setLink("")} />}
    </main>
  );
}

function KartuBagikan({ sorot, memuat, galat, bagikan }: { sorot: boolean; memuat: boolean; galat: string; bagikan: () => void }) {
  if (sorot) {
    return (
      <section className="flex flex-col gap-3 rounded-bento border-2 border-jagung bg-jagung-muda p-5">
        <h2 className="font-judul text-subjudul font-bold text-jagung-tua">Periksa ke dokter dulu</h2>
        <p className="text-isi">Kirim laporan ini ke dokter anak. Setelah diperiksa, dokter bisa membuka program dari link ini.</p>
        <Tombol memuat={memuat} onClick={bagikan} className="sm:w-full">Bagikan laporan ke dokter</Tombol>
        {galat && <PesanGalat pesan={galat} />}
      </section>
    );
  }
  return (
    <section className={`${bento} flex flex-col gap-1`}>
      <h2 className="text-isi font-semibold">Mau periksa ke dokter anak?</h2>
      <p className="text-kecil text-ungu-muda">Bagikan laporan ini. Dokter bisa melihat catatan makan dan menjadikan anak pasiennya.</p>
      <button type="button" onClick={bagikan} disabled={memuat} className={`${tombolTeks} -ml-3 self-start`}>
        {memuat ? "Membuat link…" : "Bagikan laporan"}
      </button>
      {galat && <PesanGalat pesan={galat} />}
    </section>
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
              <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-garis/50 py-3 text-isi tabular-nums last:border-0">
                <span className="rounded-full bg-ungu-tint px-3 py-1 text-kecil font-bold">{s.jam.replace(":", ".")}</span>
                <span className="font-semibold">{cariMakanan(s.menu).nama === "Lainnya" ? "Menu lain" : cariMakanan(s.menu).nama}</span>
                <span className="basis-full text-kecil text-ungu-muda sm:basis-auto">
                  {s.diterima} diterima · {s.ditolak} ditolak{s.ngemut > 0 && ` · ${s.ngemut} ngemut`} · {s.durasi} mnt
                </span>
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

function Angka14({ sesi, panggilan }: { sesi: SesiLaporan[]; panggilan: string }) {
  const hari = totalPerHari(sesi, tanggalTerakhir(14));
  const hariIni = tanggalLokal(new Date());
  const diterima = sesi.reduce((a, x) => a + x.diterima, 0);
  const rata = diterima / Math.max(1, sesi.length);
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <KartuAngka label="Sesi makan" angka={sesi.length} ket="14 hari terakhir" />
        <KartuAngka label="Rata-rata diterima" angka={rata.toFixed(1).replace(".", ",")} ket="suapan per sesi" />
      </div>
      <section className={`${bento} flex flex-col gap-3`}>
        <h2 className="font-judul text-subjudul font-bold">Suapan per hari</h2>
        <GrafikPil judul={`Suapan ${panggilan} per hari, 14 hari terakhir`}
          batang={hari.map((h) => ({ label: String(Number(h.tanggal.slice(8, 10))), diterima: h.diterima, ditolak: h.ditolak, ada: h.ada, sorot: h.tanggal === hariIni }))} />
      </section>
    </>
  );
}
