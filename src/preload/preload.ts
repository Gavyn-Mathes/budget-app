// src/preload/preload.ts
import { contextBridge } from "electron";
import { api } from "./api";

console.log("[preload] starting");

try {
  console.log("[preload] contextIsolated =", process.contextIsolated);

  if (process.contextIsolated) {
    contextBridge.exposeInMainWorld("api", api);
  } else {
    (window as any).api = api;
  }
  console.log("[preload] sandboxed =", (process as any).sandboxed);
  console.log("[preload] exposed api keys:", Object.keys(api));
} catch (err) {
  console.error("[preload] ERROR while exposing api:", err);
}
