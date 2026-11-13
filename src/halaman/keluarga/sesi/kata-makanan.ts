// Pemilik: B (Satya). Bank kata badge kenalan makanan (13 Nov): diucapkan acak saat badge diketuk.
// Isinya sengaja sensorik saja (warna, bentuk, rasa, tekstur, bunyi), bukan klaim gizi atau ajakan "habiskan":
// paparan bertahap lewat mengenal makanan, tanpa tekanan.

export const KATA_MAKANAN: Record<string, string[]> = {
  nasi: ["Nasi! Putih dan hangat.", "Nasinya pulen, lembut.", "Butir nasi kecil-kecil.", "Nasi, teman lauk."],
  kentang: ["Kentang! Kuning dan lembut.", "Kentang empuk, hangat.", "Kentang bulat dari tanah.", "Kentang, rasanya gurih."],
  ubi: ["Ubi ungu! Warnanya ungu.", "Ubi ungu manis, lho.", "Ubi lembut kalau dikukus.", "Ungu, seperti Suapin!"],
  jagung: ["Jagung! Kuning cerah.", "Jagung manis, butirnya banyak.", "Jagung bunyinya krenyes.", "Butir jagung berbaris rapi."],
  roti: ["Roti! Empuk sekali.", "Roti cokelat di pinggir.", "Roti bentuknya kotak.", "Roti lembut, bisa disobek."],
  mi: ["Mi! Panjang-panjang.", "Mi licin, sluurp!", "Mi kuning, meliuk-liuk.", "Mi lembut dan hangat."],
  telur_rebus: ["Telur rebus! Ada kuningnya.", "Putih di luar, kuning di dalam.", "Telur bulat lonjong.", "Telur rebus lembut."],
  telur_dadar: ["Telur dadar! Kuning dan lebar.", "Telur dadar gurih.", "Telur dadar lipat-lipat.", "Hangat dan empuk."],
  ayam: ["Ayam! Gurih dan empuk.", "Ayam warnanya cokelat.", "Ayam lembut digigit.", "Ayam, hangat dan wangi."],
  ikan: ["Ikan! Dari air.", "Ikan lembut sekali.", "Ikan gurih, hati-hati duri.", "Ikan berenang, sekarang di piring."],
  bakso: ["Bakso! Bulat seperti bola.", "Bakso kenyal, boing!", "Bakso hangat dan gurih.", "Bulat, bulat, bakso!"],
  tahu: ["Tahu! Putih dan lembut.", "Tahu kotak-kotak.", "Tahu empuk sekali.", "Tahu dari kedelai."],
  tempe: ["Tempe! Ada bintik-bintiknya.", "Tempe gurih dan renyah.", "Tempe kotak, cokelat.", "Tempe dari kedelai."],
  brokoli: ["Brokoli! Seperti pohon kecil.", "Brokoli hijau segar.", "Brokoli, pohon mini!", "Brokoli lembut kalau dikukus."],
  wortel: ["Wortel! Oranye cerah.", "Wortel panjang dan lancip.", "Wortel manis, lho.", "Wortel bunyinya kriuk."],
  buncis: ["Buncis! Hijau panjang.", "Buncis renyah, kriuk.", "Buncis seperti pensil hijau.", "Buncis segar."],
  labu: ["Labu kuning! Oranye.", "Labu manis dan lembut.", "Labu besar dan bulat.", "Labu lembut sekali."],
  bayam: ["Bayam! Daunnya hijau.", "Bayam lembut dan segar.", "Daun bayam lebar.", "Bayam hijau tua."],
  kembang_kol: ["Kembang kol! Putih seperti awan.", "Kembang kol, awan kecil.", "Kembang kol lembut.", "Putih dan bergelombang."],
  pakcoy: ["Pakcoy! Hijau dan putih.", "Pakcoy segar.", "Daun pakcoy seperti sendok.", "Pakcoy renyah."],
  timun: ["Timun! Hijau dan segar.", "Timun dingin, kriuk.", "Timun banyak airnya.", "Timun panjang, hijau."],
  tomat: ["Tomat! Merah bulat.", "Tomat segar dan berair.", "Tomat sedikit asam.", "Tomat bulat seperti bola."],
  pisang: ["Pisang! Kuning dan panjang.", "Pisang manis dan lembut.", "Pisang melengkung, seperti senyum.", "Kupas dulu kulitnya."],
  pepaya: ["Pepaya! Oranye manis.", "Pepaya lembut sekali.", "Pepaya punya biji hitam kecil.", "Pepaya segar."],
  apel: ["Apel! Bulat dan merah.", "Apel renyah, kriuk.", "Apel manis segar.", "Apel ada tangkainya."],
  semangka: ["Semangka! Merah di dalam.", "Semangka banyak airnya.", "Hijau di luar, merah di dalam.", "Semangka dingin segar."],
  jeruk: ["Jeruk! Oranye bulat.", "Jeruk manis asam.", "Jeruk berair, segar.", "Jeruk ada potongannya."],
  mangga: ["Mangga! Kuning manis.", "Mangga lembut dan harum.", "Mangga segar sekali.", "Mangga bentuknya lonjong."],
  alpukat: ["Alpukat! Hijau lembut.", "Alpukat halus seperti krim.", "Alpukat punya biji besar.", "Alpukat lembut di mulut."],
  melon: ["Melon! Hijau segar.", "Melon manis dan berair.", "Melon dingin, segar.", "Melon bulat besar."],
  umum: ["Makanan kita hari ini!", "Yuk kenalan sama makanannya.", "Lihat, apa warnanya?", "Hmm, wanginya enak."],
};

/** Ambil satu kata acak untuk makanan, tidak sama dengan kata sebelumnya. */
export function pilihKata(id: string, sebelum: string | null, acak = Math.random): string {
  const daftar = KATA_MAKANAN[id] ?? KATA_MAKANAN.umum;
  const calon = daftar.length > 1 ? daftar.filter((k) => k !== sebelum) : daftar;
  return calon[Math.floor(acak() * calon.length)];
}
