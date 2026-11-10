// Pemilik: C (Adit). Server lokal di port 8787; Vite mem-proxy /api ke sini.
import { serve } from "@hono/node-server";
import { app } from "./app.ts";

serve({ fetch: app.fetch, port: 8787, hostname: "127.0.0.1" }, (info) => console.log(`API jalan di http://localhost:${info.port}`));
