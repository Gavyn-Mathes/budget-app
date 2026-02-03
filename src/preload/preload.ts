// src/preload/preload.ts
import { contextBridge } from "electron";
import { api } from "./api";

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld("api", api);
} else {
  (window as any).api = api;
}
