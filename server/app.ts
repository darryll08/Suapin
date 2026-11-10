// Pemilik: C (Adit). Kerangka dari A0.1 supaya `npm run dev` jalan. Dikembangkan di kartu C0.1.
// Satu app Hono dipakai server/dev.ts (lokal) dan api/index.ts (Vercel).
import { Hono } from "hono";

export const app = new Hono();

app.get("/api/sehat", (c) =>
  c.json({ db: false, openai_key: Boolean(process.env.OPENAI_API_KEY), demo: process.env.DEMO === "1" }),
);
