// src/renderer/src/api/common.ts
import type { PreloadApi } from "../../../preload/api";

/**
 * Typed access to the preload API (window.api is declared in renderer/src/types/preload.d.ts).
 */
export function getApi(): PreloadApi {
  return window.api;
}

/**
 * Turn a preload method that returns `{ <key>: T[] }` into one that returns `T[]`.
 *
 * You choose `key` to match the shared IPC response shape, e.g.:
 *   ListByMonthRes = { incomes: Income[] }  -> key = "incomes"
 */
export function unwrapList<Req, Key extends string, Item>(
  fn: (req: Req) => Promise<unknown>,
  key: Key
) {
  
  return async (req: Req): Promise<Item[]> => {
    const res = (await fn(req)) as any;
    const list = res?.[key];
    if (!Array.isArray(list)) throw new Error(`Expected array at key "${key}"`);
    return Array.isArray(list) ? (list as Item[]) : [];
  };
}
