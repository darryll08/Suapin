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
      // Sama dengan penilai gerbang (getarDiamRekaman): persentil 10 simpangan baku per potongan ±1,5 detik.
      // SD 10 detik penuh ikut menghitung geser kepala/bicara → ambang kunyah terlalu tinggi, kunyahan tidak terbaca.
      if (isi.length < 2) return 0;
      const sd: number[] = [];
      for (let i = 0; i < isi.length; ) {
        let j = i;
        while (j < isi.length && isi[j].t - isi[i].t < 1_500) j++;
        if (j - i >= 2) sd.push(simpangan(isi.slice(i, j).map((x) => x.v)));
        i = j;
      }
      if (!sd.length) return simpangan(isi.map((x) => x.v));
      sd.sort((a, b) => a - b);
      return sd[Math.floor(sd.length * 0.1)];
    },
  };
}

function simpangan(v: number[]): number {
  if (v.length < 2) return 0;
  const rata = v.reduce((s, x) => s + x, 0) / v.length;
  return Math.sqrt(v.reduce((s, x) => s + (x - rata) ** 2, 0) / (v.length - 1));
}
