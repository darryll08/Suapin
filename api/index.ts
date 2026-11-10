import { handle } from "hono/vercel"
import { buatApp } from "../server/app"
import { bacaEnv } from "../server/env"

export const config = { runtime: "nodejs" }
export default handle(buatApp(bacaEnv()))
