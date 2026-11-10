import { seedDariTerminal } from "../server/db/seed"
void seedDariTerminal(true).catch(() => { console.error("Reset gagal"); process.exitCode = 1 })
