// Pemilik: A (Darryl). Kamera + MediaPipe FaceLandmarker di browser (A1.1, versi dasar untuk A0.4).
// Model dan WASM dimuat dari public/mediapipe/ supaya jalan tanpa internet. Video tidak pernah keluar dari browser.
import { FaceLandmarker, FilesetResolver, type FaceLandmarkerResult } from "@mediapipe/tasks-vision";

export type Pelacak = {
  /** Hentikan loop, matikan kamera, dan lepaskan model. Aman dipanggil berulang. */
  hentikan(): void;
  /** Frame deteksi per detik, rata-rata 2 detik terakhir. */
  fps(): number;
  /** "GPU" atau "CPU", tergantung yang berhasil dibuat. */
  delegate: "GPU" | "CPU";
};

/** Pesan galat kamera dalam bahasa Indonesia, siap ditampilkan ke pengguna. */
export function pesanGalatKamera(e: unknown): string {
  const nama = e instanceof DOMException || e instanceof Error ? e.name : "";
  if (nama === "NotAllowedError") return "Izin kamera ditolak. Izinkan kamera di pengaturan browser, lalu muat ulang.";
  if (nama === "NotFoundError" || nama === "OverconstrainedError") return "Kamera tidak ditemukan di perangkat ini.";
  if (nama === "NotReadableError") return "Kamera sedang dipakai aplikasi lain. Tutup aplikasi itu, lalu coba lagi.";
  return e instanceof Error && e.message ? e.message : "Kamera tidak bisa dibuka.";
}

async function buatLandmarker(): Promise<{ landmarker: FaceLandmarker; delegate: "GPU" | "CPU" }> {
  const fileset = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
  const opsi = (delegate: "GPU" | "CPU") => ({
    baseOptions: { modelAssetPath: "/mediapipe/face_landmarker.task", delegate },
    runningMode: "VIDEO" as const,
    numFaces: 2, // pengasuh bisa ikut masuk kamera; wajah anak dipilih di A1.2
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
  });
  try {
    return { landmarker: await FaceLandmarker.createFromOptions(fileset, opsi("GPU")), delegate: "GPU" };
  } catch {
    return { landmarker: await FaceLandmarker.createFromOptions(fileset, opsi("CPU")), delegate: "CPU" };
  }
}

/**
 * Membuka kamera depan, memuat FaceLandmarker, lalu memanggil `onHasil` untuk setiap frame yang dideteksi.
 * Deteksi dibatasi `fpsMaks` (awal 20). Melempar Error berpesan Indonesia bila kamera atau model gagal.
 */
export async function mulaiPelacak(
  video: HTMLVideoElement,
  onHasil: (hasil: FaceLandmarkerResult, t: number) => void,
  fpsMaks = 20,
  dibatalkan: () => boolean = () => false,
): Promise<Pelacak> {
  if (!window.isSecureContext) {
    throw new Error("Kamera hanya bisa dibuka lewat localhost atau HTTPS. Alamat seperti http://192.168.x.x tidak didukung.");
  }

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });
  } catch (e) {
    throw new Error(pesanGalatKamera(e), { cause: e });
  }

  let landmarker: FaceLandmarker;
  let delegate: "GPU" | "CPU";
  try {
    ({ landmarker, delegate } = await buatLandmarker());
  } catch (e) {
    stream.getTracks().forEach((t) => t.stop());
    throw new Error("Model pembaca wajah gagal dimuat. Muat ulang halaman.", { cause: e });
  }
  // Pemanggil sudah berhenti selama kamera/model dimuat: jangan sentuh <video>, pemanggil baru mungkin sedang memakainya.
  if (dibatalkan()) {
    stream.getTracks().forEach((t) => t.stop());
    landmarker.close();
    throw new Error("dibatalkan");
  }

  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  try {
    await video.play();
  } catch (e) {
    // play() bisa ditolak di HP (mis. AbortError): matikan kamera, jangan biarkan lampu kamera menyala tanpa pemilik.
    stream.getTracks().forEach((t) => t.stop());
    if (video.srcObject === stream) video.srcObject = null;
    landmarker.close();
    throw new Error("Kamera gagal diputar. Muat ulang halaman.", { cause: e });
  }

  let jalan = true;
  let terakhir = -Infinity;
  const waktuDeteksi: number[] = [];

  const langkah = () => {
    if (!jalan) return;
    const t = performance.now();
    if (t - terakhir >= 1000 / fpsMaks && video.readyState >= 2) {
      terakhir = t;
      waktuDeteksi.push(t);
      while (waktuDeteksi[0] < t - 2000) waktuDeteksi.shift();
      onHasil(landmarker.detectForVideo(video, t), t);
    }
    jadwalkan();
  };
  const jadwalkan = () =>
    "requestVideoFrameCallback" in video ? video.requestVideoFrameCallback(langkah) : requestAnimationFrame(langkah);
  jadwalkan();

  return {
    delegate,
    fps: () => (waktuDeteksi.length < 2 ? 0 : ((waktuDeteksi.length - 1) * 1000) / (waktuDeteksi.at(-1)! - waktuDeteksi[0])),
    hentikan: () => {
      if (!jalan) return;
      jalan = false;
      stream.getTracks().forEach((t) => t.stop());
      if (video.srcObject === stream) video.srcObject = null;
      landmarker.close();
    },
  };
}
