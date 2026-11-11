// Pemilik: A (Darryl). A3.1: panel ambang. Semua angka di src/mesin/ambang.ts bisa disetel saat aplikasi jalan
// (disimpan di browser), karena kode beku setelah submit sedangkan cahaya ruangan final bisa berbeda.
// Dibuka lewat ketuk logo landing 5× atau URL /dev/ambang.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { panggil } from "../lib/panggil.ts";
import { AMBANG_AWAL, bacaAmbang, gabungAmbang, hapusAmbang, simpanAmbang, type Ambang, type KunciAmbang } from "../mesin/ambang.ts";

const KUNCI = Object.keys(AMBANG_AWAL) as KunciAmbang[];
const tombol = "min-h-12 rounded-2xl border border-ungu-muda bg-permukaan px-4 text-kecil font-semibold";

export function HalamanAmbang() {
  const pindah = useNavigate();
  const [ambang, setAmbang] = useState<Ambang>(bacaAmbang);
  const [pesan, setPesan] = useState("");
  const [sehat, setSehat] = useState<{ db: boolean; openai_key: boolean; demo: boolean } | null>(null);

  useEffect(() => {
    panggil("sehat").then(setSehat, () => setSehat(null));
  }, []);

  const ubah = (k: KunciAmbang, v: string | boolean) =>
    setAmbang((a) => gabungAmbang({ ...a, [k]: typeof v === "boolean" ? v : Number(v) }));

  const simpan = () => {
    simpanAmbang(ambang);
    setPesan("Tersimpan. Berlaku di sesi berikutnya dan di /dev/kamera setelah dimuat ulang.");
  };
  const kembalikan = () => {
    hapusAmbang();
    setAmbang({ ...AMBANG_AWAL });
    setPesan("Dikembalikan ke nilai awal.");
  };
  const reset = async () => {
    if (!window.confirm("Kembalikan database ke data demo awal? Data latihan akan terhapus.")) return;
    try {
      const r = await panggil("demoReset");
      setPesan("Data demo dikembalikan: " + Object.entries(r.jumlah).map(([k, v]) => `${k} ${v}`).join(", "));
    } catch (e) {
      setPesan(e instanceof Error ? e.message : "Reset gagal.");
    }
  };
  const masukDemo = async (sebagai: "keluarga_dika" | "dokter_demo") => {
    try {
      await panggil("demoMasuk", { body: { sebagai } });
      void pindah(sebagai === "keluarga_dika" ? "/beranda" : "/klinik/pasien");
    } catch (e) {
      setPesan(e instanceof Error ? e.message : "Masuk demo gagal.");
    }
  };

  return (
    <main className="mx-auto grid max-w-3xl gap-5 bg-latar p-4 text-ungu">
      <header className="grid gap-1">
        <h1 className="text-2xl font-bold">Panel ambang</h1>
        <p className="text-kecil text-ungu-muda">
          Setel ambang deteksi tanpa mengubah kode. Angka live untuk menyetel ada di{" "}
          <Link className="underline" to="/dev/kamera">/dev/kamera</Link>.
        </p>
      </header>

      {pesan && <p role="status" className="rounded-xl bg-ungu-tint p-3 text-kecil">{pesan}</p>}

      <section className="grid gap-2 rounded-2xl border border-ungu-muda/25 bg-permukaan p-4 text-kecil">
        <h2 className="font-bold">Server</h2>
        <p>
          {sehat
            ? `Database ${sehat.db ? "tersambung" : "tidak tersambung"} · kunci OpenAI ${sehat.openai_key ? "ada" : "tidak ada (AI pakai cache/template)"} · mode demo ${sehat.demo ? "aktif" : "mati"}`
            : "Server API tidak menjawab."}
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={tombol} onClick={() => void masukDemo("keluarga_dika")}>Masuk sebagai keluarga Dika</button>
          <button type="button" className={tombol} onClick={() => void masukDemo("dokter_demo")}>Masuk sebagai dokter demo</button>
          <button type="button" className={tombol} onClick={() => void reset()}>Reset data demo</button>
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-ungu-muda/25 bg-permukaan p-4 text-kecil">
        <h2 className="font-bold">Ambang deteksi</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {KUNCI.map((k) => {
            const v = ambang[k];
            const beda = v !== AMBANG_AWAL[k];
            return typeof v === "boolean" ? (
              <label key={k} className="flex min-h-12 items-center gap-3">
                <input type="checkbox" className="size-5" checked={v} onChange={(e) => ubah(k, e.target.checked)} />
                <span className={beda ? "font-bold" : ""}>{k}</span>
              </label>
            ) : (
              <label key={k} className="grid gap-1">
                <span className={beda ? "font-bold" : ""}>{k} <span className="text-ungu-muda">(awal {AMBANG_AWAL[k]})</span></span>
                <input type="number" step="any" inputMode="decimal" value={v} onChange={(e) => ubah(k, e.target.value)}
                  className="min-h-12 rounded-xl border border-ungu-muda bg-latar px-3 font-mono" />
              </label>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={`${tombol} bg-ungu text-latar`} onClick={simpan}>Simpan</button>
          <button type="button" className={tombol} onClick={kembalikan}>Kembalikan awal</button>
        </div>
      </section>
    </main>
  );
}
