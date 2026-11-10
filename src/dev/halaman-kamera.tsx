// Pemilik: A (Darryl). /dev/kamera: uji kamera dan FaceLandmarker (A0.4, syarat I0).
// Menampilkan pratinjau, fps nyata, jumlah wajah, jawOpen, dan yaw mentah untuk gerbang go/no-go.
// Gerbang (A1.5) nanti menambah tombol Suap, log percobaan, dan rekam sinyal di halaman ini.
import { useEffect, useRef, useState } from "react";
import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import { mulaiPelacak, type Pelacak } from "../deteksi/pelacak.ts";

type Angka = { fps: number; wajah: number; jawOpen: number | null; yaw: number | null };

function bacaAngka(hasil: FaceLandmarkerResult | null, fps: number): Angka {
  const bs = hasil?.faceBlendshapes[0]?.categories;
  const m = hasil?.facialTransformationMatrixes?.[0]?.data;
  return {
    fps,
    wajah: hasil?.faceLandmarks.length ?? 0,
    jawOpen: bs?.find((c) => c.categoryName === "jawOpen")?.score ?? null,
    // Yaw mentah wajah pertama. Tanda (kanan kamera = + atau −) diverifikasi di gerbang dan dicatat di docs/gerbang.md.
    yaw: m ? (Math.atan2(m[8], m[10]) * 180) / Math.PI : null,
  };
}

export function HalamanKamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasilRef = useRef<FaceLandmarkerResult | null>(null);
  const [status, setStatus] = useState<"memuat" | "jalan" | "galat">("memuat");
  const [galat, setGalat] = useState("");
  const [delegate, setDelegate] = useState("");
  const [angka, setAngka] = useState<Angka>(bacaAngka(null, 0));

  useEffect(() => {
    let batal = false;
    let pelacak: Pelacak | null = null;
    let interval = 0;
    mulaiPelacak(videoRef.current!, (h) => (hasilRef.current = h))
      .then((p) => {
        if (batal) return p.hentikan();
        pelacak = p;
        setDelegate(p.delegate);
        setStatus("jalan");
        // Angka diperbarui 4 kali per detik supaya terbaca dan tidak me-render ulang 20 kali per detik.
        interval = window.setInterval(() => setAngka(bacaAngka(hasilRef.current, p.fps())), 250);
      })
      .catch((e: unknown) => {
        if (batal) return;
        setGalat(e instanceof Error ? e.message : String(e));
        setStatus("galat");
      });
    return () => {
      batal = true;
      window.clearInterval(interval);
      pelacak?.hentikan();
    };
  }, []);

  const baris: [string, string][] = [
    ["Status", status === "memuat" ? "Menyiapkan kamera dan model…" : status === "jalan" ? `Jalan (${delegate})` : "Galat"],
    ["FPS deteksi", angka.fps.toFixed(1) + (status === "jalan" && angka.fps < 15 ? "  (di bawah target 15)" : "")],
    ["Jumlah wajah", String(angka.wajah)],
    ["jawOpen", angka.jawOpen === null ? "-" : angka.jawOpen.toFixed(3)],
    ["Yaw mentah (derajat)", angka.yaw === null ? "-" : angka.yaw.toFixed(1)],
  ];

  return (
    <main className="mx-auto max-w-3xl p-4 text-ungu">
      <h1 className="text-subjudul font-bold">Uji kamera</h1>
      <p className="text-kecil text-ungu-muda">Halaman alat tim. Video hanya diproses di browser ini, tidak direkam dan tidak dikirim.</p>

      <div className="mt-4 grid gap-4 md:grid-cols-[320px_1fr]">
        <video
          ref={videoRef}
          className="aspect-[4/3] w-full rounded-2xl bg-ungu-tint object-cover"
          style={{ transform: "scaleX(-1)" }}
          muted
          playsInline
          aria-label="Pratinjau kamera"
        />
        <div>
          {status === "galat" && (
            <p role="alert" className="mb-3 rounded-xl border-l-4 border-jagung bg-jagung-muda p-3 text-kecil text-jagung-tua">
              {galat}
            </p>
          )}
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-kecil">
            {baris.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-ungu-muda">{k}</dt>
                <dd className="font-mono tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 h-3 w-full rounded-full bg-ungu-tint" aria-hidden>
            <div className="h-3 rounded-full bg-jagung" style={{ width: `${Math.round((angka.jawOpen ?? 0) * 100)}%` }} />
          </div>
        </div>
      </div>
    </main>
  );
}
