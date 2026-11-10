// Pemilik: A (Darryl). Dijalankan postinstall: salin WASM MediaPipe ke public/ supaya disajikan lokal (final offline).
import { cpSync, existsSync } from "node:fs";

const asal = "node_modules/@mediapipe/tasks-vision/wasm";
if (existsSync(asal)) cpSync(asal, "public/mediapipe/wasm", { recursive: true });
