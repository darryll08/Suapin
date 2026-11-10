// Pemilik: A (Darryl). A1.3: baseline bergulir. Balita jarang mau diam untuk kalibrasi, jadi nilai "normal"
// diambil terus dari 10 detik terakhir (persentil 20), hanya saat engine mengizinkan (bukan saat menilai
// suapan dan bukan saat kunyah aktif), supaya buka mulut dan kunyahan tidak ikut dianggap normal.

export type Baseline = {
  /** Engine memberi izin mengisi (`baselineBoleh`). */
  boleh(b: boolean): void;
  tambah(t: number, v: number): void;
  /** Persentil 20 jendela; `cadangan` bila jendela masih kosong. */
  nilai(cadangan: number): number;
  /** Simpangan baku jendela (getar saat diam), 0 bila kurang dari 2 sampel. */
  getar(): number;
};

export function buatBaseline(jendelaMs = 10_000): Baseline {
  const isi: { t: number; v: number }[] = [];
  let izin = true;
  return {
    boleh: (b) => { izin = b; },
    tambah: (t, v) => {
      if (!izin) return;
      isi.push({ t, v });
      while (isi.length && isi[0].t < t - jendelaMs) isi.shift();
    },
    nilai: (cadangan) => {
      if (!isi.length) return cadangan;
      const urut = isi.map((s) => s.v).sort((a, b) => a - b);
      return urut[Math.floor(0.2 * (urut.length - 1))];
    },
    getar: () => {
      if (isi.length < 2) return 0;
      const rata = isi.reduce((s, x) => s + x.v, 0) / isi.length;
      return Math.sqrt(isi.reduce((s, x) => s + (x.v - rata) ** 2, 0) / (isi.length - 1));
    },
  };
}
