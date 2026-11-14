// Format rentang tanggal untuk keterangan grafik (dipakai laporan keluarga dan kartu pasien dokter).
/** "1–14 November 2026", atau "25 Oktober – 7 November 2026" bila melewati pergantian bulan. Input YYYY-MM-DD. */
export function rentangTanggal(awal: string, akhir: string): string {
  const f = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("id-ID", { timeZone: "UTC", ...o });
  return awal.slice(0, 7) === akhir.slice(0, 7)
    ? `${Number(awal.slice(8, 10))}–${f(akhir, { day: "numeric", month: "long", year: "numeric" })}`
    : `${f(awal, { day: "numeric", month: "long" })} – ${f(akhir, { day: "numeric", month: "long", year: "numeric" })}`;
}
