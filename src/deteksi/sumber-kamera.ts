// Pemilik: A (Darryl). A1.4: sumber sinyal dari kamera = pelacak (A1.1) + pilih wajah (A1.2) + pengolah (A1.3).
// Sumber kamera dan sumber palsu punya antarmuka sama (`SumberSinyal`), jadi engine dan karakter tidak peduli asalnya.
import { SinyalSchema, type Sinyal } from "../../bersama/kontrak/sinyal.ts";
import type { Ambang } from "../mesin/ambang.ts";
import { mulaiPelacak, type Pelacak } from "./pelacak.ts";
import { kotakDari, lacakWajah, perbaruiAcuan, pilihDiTitik, pilihSaatKalibrasi, type Acuan } from "./pilih-wajah.ts";
import { buatPengolahSinyal, skor, yawMentah } from "./sinyal.ts";

export type SumberSinyal = {
  /** Mulai mengirim sinyal. Melempar Error berpesan Indonesia bila gagal (misalnya izin kamera). */
  mulai(onSinyal: (s: Sinyal) => void): Promise<void>;
  berhenti(): void;
};

export type SumberKamera = SumberSinyal & {
  /** Pengasuh mengetuk pratinjau yang dicerminkan; `x`,`y` = posisi ketukan 0..1 di layar. */
  pilihWajahDiTitik(x: number, y: number): void;
  kalibrasi(aktif: boolean): void;
  baselineBoleh(b: boolean): void;
  getarDiam(): number;
  fps(): number;
  /** Angka mentah wajah terpilih untuk halaman uji (verifikasi tanda yaw saat gerbang). */
  mentah(): { wajah: number; jawOpen: number | null; yaw: number | null };
};

export function sumberKamera(o: {
  video: HTMLVideoElement;
  sisiPengasuh: "kiri" | "kanan";
  ambang: () => Ambang;
}): SumberKamera {
  const pengolah = buatPengolahSinyal({
    sisiPengasuh: o.sisiPengasuh,
    ukuranVideo: () => ({ lebar: o.video.videoWidth || 640, tinggi: o.video.videoHeight || 480 }),
    ambang: o.ambang,
  });
  let pelacak: Pelacak | null = null;
  let acuan: Acuan | null = null;
  let modeKalibrasi = false;
  let ketukan: { x: number; y: number } | null = null;
  let mentah: ReturnType<SumberKamera["mentah"]> = { wajah: 0, jawOpen: null, yaw: null };

  return {
    async mulai(onSinyal) {
      pelacak = await mulaiPelacak(
        o.video,
        (hasil, t) => {
          const kotak = hasil.faceLandmarks.map(kotakDari);
          let i: number;
          if (ketukan) {
            i = pilihDiTitik(kotak, ketukan.x, ketukan.y);
            ketukan = null;
            if (i < 0) i = acuan ? lacakWajah(acuan, kotak) : pilihSaatKalibrasi(kotak);
            else acuan = null; // ketukan mengganti acuan sepenuhnya
          } else {
            i = modeKalibrasi || !acuan ? pilihSaatKalibrasi(kotak) : lacakWajah(acuan, kotak);
          }
          if (i >= 0) acuan = modeKalibrasi || !acuan ? perbaruiAcuan(null, kotak[i]) : perbaruiAcuan(acuan, kotak[i]);

          const kategori = i >= 0 ? (hasil.faceBlendshapes[i]?.categories ?? []) : [];
          const matriks = i >= 0 ? (hasil.facialTransformationMatrixes?.[i]?.data ?? null) : null;
          mentah = {
            wajah: kotak.length,
            jawOpen: i >= 0 ? skor(kategori, "jawOpen") : null,
            yaw: matriks ? yawMentah(matriks) : null,
          };
          const s = pengolah.olah(t, i >= 0 ? { landmark: hasil.faceLandmarks[i], kategori, matriks } : null);
          if (import.meta.env.DEV) SinyalSchema.parse(s); // K4: bentuk sinyal tidak boleh berubah diam-diam
          onSinyal(s);
        },
        o.ambang().fpsMaks,
      );
    },
    berhenti() {
      pelacak?.hentikan();
      pelacak = null;
    },
    pilihWajahDiTitik(x, y) {
      ketukan = { x: 1 - x, y }; // pratinjau dicerminkan, frame kamera tidak
    },
    kalibrasi(aktif) {
      modeKalibrasi = aktif;
      if (aktif) acuan = null;
      pengolah.kalibrasi(aktif);
    },
    baselineBoleh: (b) => pengolah.baselineBoleh(b),
    getarDiam: () => pengolah.getarDiam(),
    fps: () => pelacak?.fps() ?? 0,
    mentah: () => mentah,
  };
}
