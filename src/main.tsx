// Pemilik: B (Satya). Kerangka dari A0.1.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./gaya/token.css";
import App from "./app.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
