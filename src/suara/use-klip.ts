// Pemilik: B (Satya). Putar klip setiap `nonce` dari engine berubah (B1.5).
import { useEffect, useRef } from "react";
import type { IdKlip, Sapaan } from "../../bersama/konten/klip.ts";
import { hentikanSemua, putarKlip } from "./pemutar.ts";

export function useKlip(klip: { id: IdKlip; nonce: number } | null | undefined, opsi: { suara: boolean; sapaan?: Sapaan }) {
  const terakhir = useRef<number | null>(null);
  useEffect(() => {
    if (!klip || klip.nonce === terakhir.current) return;
    terakhir.current = klip.nonce;
    if (opsi.suara) putarKlip(klip.id, opsi.sapaan);
  }, [klip, opsi.suara, opsi.sapaan]);
  useEffect(() => hentikanSemua, []);
}
