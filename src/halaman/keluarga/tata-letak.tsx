// Pemilik: B (Satya). Kerangka halaman keluarga + penjaga rute `ButuhKeluarga` (B0.2).
import { createContext, use, useEffect, type ReactNode } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { Memuat, PesanGalat } from "../../komponen/dasar.tsx";
import { wadahKeluarga } from "../../gaya/gaya.ts";
import { useMuat } from "./bantu.ts";
import { api, GalatApi, type Saya } from "./data.ts";

type KonteksKeluarga = { saya: Saya; muatUlang: () => void };
const Konteks = createContext<KonteksKeluarga | null>(null);

export function useSaya(): KonteksKeluarga {
  const k = use(Konteks);
  if (!k) throw new Error("useSaya dipakai di luar ButuhKeluarga");
  return k;
}

/** Rute yang tetap bisa dibuka saat trial habis. */
const BOLEH_SAAT_TRIAL_HABIS = ["/beranda", "/laporan", "/langganan"];

export function ButuhKeluarga() {
  const { data, galat, memuat, ulangi } = useMuat(() => api.saya().catch((e: unknown) => {
    if (e instanceof GalatApi && e.status === 401) return null;
    throw e;
  }));
  const lokasi = useLocation();
  const pindah = useNavigate();

  useEffect(() => {
    if (memuat) return;
    if (data === null && !galat) { void pindah("/", { replace: true }); return; }
    if (!data) return;
    const p = lokasi.pathname;
    if (data.alasan_terkunci === "skrining_belum" && p !== "/mulai/skrining") void pindah("/mulai/skrining", { replace: true });
    else if (data.alasan_terkunci === "trial_habis" && !BOLEH_SAAT_TRIAL_HABIS.includes(p)) void pindah("/langganan", { replace: true });
  }, [data, galat, memuat, lokasi.pathname, pindah]);

  if (galat) return <div className={`${wadahKeluarga} pt-10`}><PesanGalat pesan={galat} ulangi={ulangi} /></div>;
  if (!data) return <Memuat />;
  return (
    <Konteks value={{ saya: data, muatUlang: ulangi }}>
      <Outlet />
    </Konteks>
  );
}

/** Logo kecil + nama, dipakai di kepala halaman keluarga. */
export function Logo({ ke = "/beranda", onClick }: { ke?: string; onClick?: () => void }) {
  return (
    <Link to={ke} onClick={onClick} className="inline-flex min-h-12 items-center gap-2 font-judul text-subjudul font-bold text-ungu">
      <img src="/ikon/suapin-ikon-ungu-putih.svg" alt="" className="size-9 rounded-isian" />
      Suapin
    </Link>
  );
}

export function Halaman({ children, kanan }: { children: ReactNode; kanan?: ReactNode }) {
  return (
    <div className={wadahKeluarga}>
      <div className="flex items-center justify-between pt-3">
        <Logo />
        {kanan}
      </div>
      {children}
    </div>
  );
}
