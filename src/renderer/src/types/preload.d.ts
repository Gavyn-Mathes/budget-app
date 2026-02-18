// renderer/src/types/preload.d.ts
import type { PreloadApi } from "../../../preload/api";

declare global {
  interface Window {
    api: PreloadApi;
  }
}

export {};
