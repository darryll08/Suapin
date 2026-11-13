// Entry Vercel Function. Dibundel esbuild jadi api/index.mjs (`npm run deploy:vercel`) karena runtime Node di
// Vercel memakai ESM murni dan tidak bisa membaca import relatif tanpa ekstensi di server/.
// Diekspor sebagai handler Web per metode (Request → Response) yang didukung runtime Node Vercel.
import { buatApp } from "../server/app"
import { bacaEnv } from "../server/env"

const app = buatApp(bacaEnv())
const tangani = (req: Request) => app.fetch(req)

export const config = { runtime: "nodejs" }
export { tangani as GET, tangani as POST, tangani as PUT, tangani as PATCH, tangani as DELETE }
