// Pemilik: B (Satya). Adit menyambungkan fungsi data ini ke API sesuai docs/status.md.
import type { Input, Keluaran } from "../../../bersama/kontrak/api.ts";
import type { SesiSelesai } from "../../../bersama/kontrak/sesi.ts";
import { panggil } from "../../lib/panggil.ts";

export { GalatApi } from "../../lib/panggil.ts";
export type Saya = Keluaran<"saya">;
export type AturanAnak = Keluaran<"aturanBaca">;
export type HasilSimpanSesi = Keluaran<"sesiSimpan">;
export type Laporan = Keluaran<"laporanKeluarga">;
export type SesiLaporan = Laporan["sesi"][number];
export type Ringkasan = Keluaran<"ringkasanBuat">;

export function usiaBulan(tanggalLahir: string, kini = new Date()): number {
  const l = new Date(tanggalLahir);
  let b = (kini.getFullYear() - l.getFullYear()) * 12 + (kini.getMonth() - l.getMonth());
  if (kini.getDate() < l.getDate()) b -= 1;
  return Math.max(0, b);
}

export const api = {
  buatAnak: (body: Input<"anakBuat">) => panggil("anakBuat", { body }),
  masuk: (email: string, kata_sandi: string) => panggil("masuk", { body: { email, kata_sandi } }),
  demoMasukDika: () => panggil("demoMasuk", { body: { sebagai: "keluarga_dika" } }),
  saya: () => panggil("saya"),
  skrining: (jawaban: boolean[]) => panggil("skriningSimpan", { body: { jawaban } }),
  aturan: (childId: string) => panggil("aturanBaca", { params: { id: childId } }),
  simpanSesi: (body: SesiSelesai) => panggil("sesiSimpan", { body }),
  catatan: (sessionId: string, body: Input<"catatanSimpan">) =>
    panggil("catatanSimpan", { params: { id: sessionId }, body }),
  laporan: (childId: string) => panggil("laporanKeluarga", { params: { id: childId } }),
  ringkasan: (childId: string) => panggil("ringkasanBuat", { params: { childId } }),
  bagikan: () => panggil("laporanBagikan"),
  aktifkan: (paket: "program_30") => panggil("paketAktifkan", { body: { paket } }),
};
