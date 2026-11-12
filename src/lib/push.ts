// Pemilik: B (Satya). Web Push di browser: izin notifikasi, langganan, dan berhenti berlangganan.
// Produksi: service worker PWA (Workbox) sudah mengimpor /sw-push.js. Dev: /sw-push.js didaftarkan langsung.
// Push butuh HTTPS (atau localhost). iPhone/iPad hanya bisa setelah Suapin dipasang ke layar utama (iOS 16.4+).
import { panggil } from "./panggil"

export type StatusPush = "tidak_didukung" | "perlu_pasang" | "ditolak" | "mati" | "aktif"

export const pushDidukung = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window

const iosBelumDipasang = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.matchMedia("(display-mode: standalone)").matches

async function registrasi() {
  if (import.meta.env.DEV) {
    return await navigator.serviceWorker.getRegistration("/") ?? await navigator.serviceWorker.register("/sw-push.js")
  }
  return navigator.serviceWorker.ready
}

function kunciKeByte(base64: string) {
  const isi = (base64 + "=".repeat((4 - base64.length % 4) % 4)).replace(/-/g, "+").replace(/_/g, "/")
  return Uint8Array.from(atob(isi), (c) => c.charCodeAt(0))
}

export async function statusPush(): Promise<StatusPush> {
  if (!pushDidukung()) return iosBelumDipasang() ? "perlu_pasang" : "tidak_didukung"
  if (Notification.permission === "denied") return "ditolak"
  if (Notification.permission !== "granted") return "mati"
  const reg = await navigator.serviceWorker.getRegistration("/")
  return (await reg?.pushManager.getSubscription()) ? "aktif" : "mati"
}

/** Minta izin, berlangganan, lalu simpan langganan di server. Harus dipanggil dari ketukan pengguna. */
export async function nyalakanPush(kunciPublik: string): Promise<StatusPush> {
  if (!pushDidukung()) return iosBelumDipasang() ? "perlu_pasang" : "tidak_didukung"
  const izin = await Notification.requestPermission()
  if (izin !== "granted") return izin === "denied" ? "ditolak" : "mati"
  const reg = await registrasi()
  const lama = await reg.pushManager.getSubscription()
  const langganan = lama ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: kunciKeByte(kunciPublik) })
  const json = langganan.toJSON()
  await panggil("pushLangganan", { body: { endpoint: langganan.endpoint, keys: { p256dh: json.keys!.p256dh!, auth: json.keys!.auth! } } })
  return "aktif"
}

export async function matikanPush(): Promise<StatusPush> {
  const reg = await navigator.serviceWorker.getRegistration("/")
  const langganan = await reg?.pushManager.getSubscription()
  if (langganan) {
    await panggil("pushBerhenti", { body: { endpoint: langganan.endpoint } })
    await langganan.unsubscribe()
  }
  return "mati"
}
