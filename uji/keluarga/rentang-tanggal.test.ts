import { expect, it } from "vitest";
import { rentangTanggal } from "../../src/lib/tanggal.ts";

it("rentang tanggal grafik: satu bulan dan lintas bulan", () => {
  expect(rentangTanggal("2026-11-01", "2026-11-14")).toBe("1–14 November 2026");
  expect(rentangTanggal("2026-10-25", "2026-11-07")).toBe("25 Oktober – 7 November 2026");
});
