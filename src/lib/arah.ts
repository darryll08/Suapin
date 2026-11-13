// Pemilik: B (Satya). Login "nyangkut": satu peran per browser, rumah tiap peran, dan `?kembali=` yang aman.
// Sudah login → / dan /masuk langsung ke rumah perannya. Belum login di halaman dalam → /masuk?kembali=<link>,
// lalu setelah masuk kembali ke link itu bila link tersebut memang milik peran yang masuk.
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { panggil } from "./panggil.ts";

export type Peran = "keluarga" | "dokter" | "klinik" | "admin";
export const RUMAH: Record<Peran, string> = { keluarga: "/beranda", dokter: "/dokter", klinik: "/klinik", admin: "/admin" };

const AWALAN: Record<Peran, string[]> = {
  keluarga: ["/beranda", "/laporan", "/profil", "/langganan", "/sesi", "/mulai/skrining"],
  dokter: ["/dokter", "/r/"],
  klinik: ["/klinik"],
  admin: ["/admin"],
};

/** Tujuan setelah masuk: `kembali` bila aman dan milik peran ini, selain itu rumah perannya. */
export function tujuanSetelahMasuk(peran: Peran, kembali: string | null): string {
  const k = kembali ?? "";
  const aman = k.startsWith("/") && !k.startsWith("//") && !k.includes("\\")
    && AWALAN[peran].some((a) => k === a || k.startsWith(a.endsWith("/") ? a : a + "/") || k.startsWith(a + "?"));
  return aman ? k : RUMAH[peran];
}

/** Link ke /masuk yang membawa halaman sekarang sebagai `kembali`. */
export function keMasuk(path: string): string {
  return "/masuk?kembali=" + encodeURIComponent(path);
}
export function useKeMasuk(): string {
  const l = useLocation();
  return keMasuk(l.pathname + l.search);
}

/** Dipakai di / dan /masuk: bila browser ini sudah login, langsung pindah ke halaman perannya. */
export function useAlihkanBilaMasuk(): boolean {
  const pindah = useNavigate();
  const [param] = useSearchParams();
  const [memeriksa, setMemeriksa] = useState(true);
  const kembali = param.get("kembali");
  useEffect(() => {
    let hidup = true;
    panggil("peranAktif").then(({ peran }) => {
      if (!hidup) return;
      if (peran) void pindah(tujuanSetelahMasuk(peran, kembali), { replace: true });
      else setMemeriksa(false);
    }, () => { if (hidup) setMemeriksa(false); });
    return () => { hidup = false; };
  }, [pindah, kembali]);
  return memeriksa;
}
