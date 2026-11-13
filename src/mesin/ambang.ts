// Pemilik: A (Darryl). Semua angka ambang deteksi dan engine ada di sini (K10), tidak ditulis di kode lain.
// Nilai bisa diubah saat aplikasi jalan lewat /dev/ambang dan disimpan di browser, karena kode beku 14 Nov
// sedangkan ruangan final 29 Nov bisa berbeda. Angka awal adalah titik mulai; disetel ulang dari hasil gerbang.

export const AMBANG_AWAL = {
  terbuka: 0.3, // mulut (0..1) dianggap terbuka
  tutup: 0.15, // histeresis: bukaan baru selesai bila mulut di bawah ini...
  tutupDetik: 0.5, // ...selama ini (tangisan naik-turun tidak terpecah jadi bukaan pendek)
  minBukaDetik: 0.3, // lama buka minimal untuk suapan
  batasBukaDetik: 6.5, // lama buka maksimal; gerbang 12 Nov: 4 terlalu ketat untuk suapan pelan (uji 1, 6)
  jendelaDetik: 6, // jendela penilaian sejak Suap
  jendelaMaksDetik: 12, // batas perpanjangan jendela selama mulut masih terbuka
  bufferSebelumSuapDetik: 3, // sinyal sebelum Suap yang ikut dinilai
  yawMenolakDerajat: 25, // menoleh menjauhi pengasuh
  yawMenolakDetik: 1,
  yawKePengasuhDerajat: 20, // condong ke pengasuh: tanpa bukaan terbaca → tidak pasti, bukan ditolak (jawOpen melemah saat menoleh)
  nangis: 0.5, // rata-rata eyeSquint + browDown
  kunyahKaliGetar: 3, // ambang satu siklus = kelipatan getar rahang saat diam
  kunyahMinimal: 0.01, // batas bawah ambang siklus
  kunyahPitchMaks: 4, // derajat; siklus rahang dengan perubahan pitch lebih besar = angguk, bukan kunyah
  timerJedaDetik: 15,
  ngemutDetik: 15,
  menolakTungguDetik: 60,
  tidakPastiTungguDetik: 10,
  tidakTerlihatDetik: 1.5,
  fpsMaks: 20,
  hasilDariKamera: true, // false = hasil suapan dari tombol pengasuh (cadangan gerbang)
  kunyahDariKamera: true, // false = jeda kunyah selesai lewat timer atau Lanjut
};

export type Ambang = typeof AMBANG_AWAL;
export type KunciAmbang = keyof Ambang;

const KUNCI_SIMPAN = "tm_ambang_v1";

/** Gabungkan nilai tersimpan dengan nilai awal. Kunci asing atau bertipe salah diabaikan. */
export function gabungAmbang(tersimpan: unknown): Ambang {
  const hasil: Ambang = { ...AMBANG_AWAL };
  if (!tersimpan || typeof tersimpan !== "object") return hasil;
  for (const k of Object.keys(AMBANG_AWAL) as KunciAmbang[]) {
    const v = (tersimpan as Record<string, unknown>)[k];
    const awal = AMBANG_AWAL[k];
    if (typeof v === typeof awal && (typeof v !== "number" || Number.isFinite(v))) {
      (hasil as Record<KunciAmbang, number | boolean>)[k] = v as number | boolean;
    }
  }
  return hasil;
}

export function bacaAmbang(): Ambang {
  try {
    return gabungAmbang(JSON.parse(localStorage.getItem(KUNCI_SIMPAN) ?? "null"));
  } catch {
    return { ...AMBANG_AWAL };
  }
}

export function simpanAmbang(a: Ambang): void {
  try {
    localStorage.setItem(KUNCI_SIMPAN, JSON.stringify(a));
  } catch {
    // mode samaran atau penyimpanan diblokir: ambang tetap berlaku sampai halaman ditutup
  }
}

export function hapusAmbang(): void {
  try {
    localStorage.removeItem(KUNCI_SIMPAN);
  } catch {
    // sama seperti di atas
  }
}
