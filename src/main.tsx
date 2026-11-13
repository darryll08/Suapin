// Pemilik: B (Satya). Kerangka dari A0.1.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./gaya/token.css";
import App from "./app.tsx";

// Setelah deploy baru, tab lama masih menunjuk potongan JS versi lama yang sudah tidak ada → muat ulang sekali.
window.addEventListener("vite:preloadError", (e) => {
  try {
    if (sessionStorage.getItem("tm_muat_ulang")) return;
    sessionStorage.setItem("tm_muat_ulang", "1");
  } catch { /* tanpa sessionStorage: tetap coba sekali */ }
  e.preventDefault();
  location.reload();
});
window.addEventListener("load", () => setTimeout(() => { try { sessionStorage.removeItem("tm_muat_ulang"); } catch { /* abaikan */ } }, 10_000));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
