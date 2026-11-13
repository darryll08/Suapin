// Pemilik: B (Satya). Menu bawah halaman orang tua (permintaan Satya 13 Nov, pola aplikasi HP seperti Talkly):
// Beranda · Laporan · Profil. Disembunyikan di layar sesi, catatan sesi, dan skrining supaya fokus.
// Titik jagung di Profil = ada notifikasi belum dibaca (notifikasi sekarang ada di halaman Profil).
import { useEffect, useRef, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router";
import { usePanggil } from "../lib/panggil.ts";

const SEMBUNYI = ["/sesi", "/mulai/skrining"];
export const adaNavKeluarga = (path: string) => !SEMBUNYI.some((p) => path === p || path.startsWith(p + "/"));

/** Ruang kosong di bawah isi halaman supaya tidak tertutup menu (tinggi menu + area aman HP). */
export const ruangNav = "pb-[calc(5rem+env(safe-area-inset-bottom))]";

type Menu = { ke: string; label: string; ikon: ReactNode; juga?: string[] };
const MENU: Menu[] = [
  { ke: "/beranda", label: "Beranda", ikon: <IkonRumah /> },
  { ke: "/laporan", label: "Laporan", ikon: <IkonGrafik /> },
  { ke: "/profil", label: "Profil", ikon: <IkonOrang />, juga: ["/langganan"] },
];

export function NavKeluarga() {
  const { pathname } = useLocation();
  const { data, ulang } = usePanggil("notifikasiDaftar");
  // Muat ulang jumlah belum dibaca tiap pindah halaman (membuka Profil menandai semua sudah dibaca).
  const pertama = useRef(true);
  useEffect(() => {
    if (pertama.current) { pertama.current = false; return; }
    ulang();
  }, [pathname, ulang]);
  if (!adaNavKeluarga(pathname)) return null;
  const belum = data?.belum_dibaca ?? 0;

  return (
    <nav aria-label="Menu utama"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-garis/60 bg-permukaan/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg">
      <ul className="mx-auto flex max-w-[560px] px-2">
        {MENU.map((m) => {
          const juga = m.juga?.some((p) => pathname.startsWith(p)) ?? false;
          return (
            <li key={m.ke} className="flex-1">
              <NavLink to={m.ke}
                aria-label={m.ke === "/profil" && belum ? `Profil, ${belum} notifikasi baru` : undefined}
                className={({ isActive }) => `group flex min-h-16 flex-col items-center justify-center gap-0.5 text-mini font-semibold outline-none ${
                  isActive || juga ? "aktif text-ungu" : "text-ungu-muda"}`}>
                <span className="relative inline-flex h-8 w-16 items-center justify-center rounded-full transition-colors duration-200 group-[.aktif]:bg-ungu-tint group-focus-visible:ring-4 group-focus-visible:ring-jagung">
                  {m.ikon}
                  {m.ke === "/profil" && belum > 0 && (
                    <span aria-hidden="true" className="absolute top-0.5 right-4 size-2.5 rounded-full border-2 border-permukaan bg-jagung" />
                  )}
                </span>
                {m.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const garis = { viewBox: "0 0 24 24", className: "size-[22px]", fill: "none", stroke: "currentColor", strokeWidth: 2.2,
  strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

function IkonRumah() {
  return <svg {...garis}><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" /></svg>;
}
function IkonGrafik() {
  return <svg {...garis}><path d="M6 20V12M12 20V5M18 20v-9" /></svg>;
}
function IkonOrang() {
  return <svg {...garis}><circle cx="12" cy="8" r="4" /><path d="M4.5 20c.8-3.6 3.8-6 7.5-6s6.7 2.4 7.5 6" /></svg>;
}
