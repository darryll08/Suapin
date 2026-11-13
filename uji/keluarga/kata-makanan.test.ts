import { describe, expect, it } from "vitest";
import { MAKANAN } from "../../bersama/konten/makanan.ts";
import { KATA_MAKANAN, pilihKata } from "../../src/halaman/keluarga/sesi/kata-makanan.ts";

describe("bank kata badge makanan", () => {
  it("setiap makanan punya ≥ 3 kata", () => {
    for (const m of MAKANAN) expect(KATA_MAKANAN[m.id]?.length ?? 0).toBeGreaterThanOrEqual(3);
  });
  it("tidak mengulang kata yang sama berturut-turut", () => {
    let k: string | null = null;
    for (let i = 0; i < 50; i++) { const b = pilihKata("ayam", k); expect(b).not.toBe(k); k = b; }
  });
});
