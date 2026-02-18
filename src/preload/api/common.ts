// src/preload/api/common.ts
import { invoke } from "../ipc/invoke";

type AnyRecord = Record<string, any>;
type IpcMap = Record<string, string>;

function isPlainObject(v: any): v is AnyRecord {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function isIpcMap(v: any): v is IpcMap {
  return isPlainObject(v) && Object.values(v).every((x) => typeof x === "string");
}

function lowerFirst(s: string) {
  return s.length ? s[0].toLowerCase() + s.slice(1) : s;
}

function pickIpcMap(shared: AnyRecord): IpcMap {
  for (const [k, v] of Object.entries(shared)) {
    if (!k.endsWith("_IPC")) continue;
    if (isIpcMap(v)) return v;
  }
  throw new Error(
    `Could not find *_IPC export in shared ipc module. Exports: ${Object.keys(shared).join(", ")}`
  );
}

/**
 * Builds an API object whose keys are lowerCamel versions of ops:
 *  { List: "...", Upsert: "..."} -> { list(req?), upsert(req) }
 *
 * Preload is a THIN bridge:
 *  - does NOT parse with Zod (main does that in registerZodIpc)
 *  - simply invokes the channel and returns the result
 */
export function makeApiModule(shared: AnyRecord) {
  const ipcMap = pickIpcMap(shared);
  const out: AnyRecord = {};

  for (const [op, channel] of Object.entries(ipcMap)) {
    const methodName = lowerFirst(op);

    out[methodName] = (req?: unknown) =>
      invoke(channel, (req ?? {}) as any);
  }

  return Object.freeze(out);
}
