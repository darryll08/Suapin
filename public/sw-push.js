// Penangan Web Push Suapin. Di build PWA diimpor oleh service worker Workbox (importScripts);
// saat `npm run dev` didaftarkan langsung sebagai service worker sendiri.
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { isi: event.data ? event.data.text() : "" }; }
  const judul = data.judul || "Suapin";
  event.waitUntil(self.registration.showNotification(judul, {
    body: data.isi || "",
    icon: "/ikon/ikon-192.png",
    badge: "/ikon/ikon-192.png",
    tag: data.tag || "suapin",
    lang: "id",
    data: { tautan: data.tautan || "/beranda" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const tujuan = new URL(event.notification.data?.tautan || "/beranda", self.location.origin).href;
  event.waitUntil((async () => {
    const semua = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const klien of semua) {
      if (new URL(klien.url).origin === self.location.origin && "focus" in klien) {
        await klien.focus();
        if ("navigate" in klien) await klien.navigate(tujuan);
        return;
      }
    }
    await self.clients.openWindow(tujuan);
  })());
});

// Saat dev, service worker ini berdiri sendiri: aktif segera tanpa menunggu tab lama ditutup.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
