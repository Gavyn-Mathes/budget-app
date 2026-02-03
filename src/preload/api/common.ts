// src/preload/api/common.ts
import type { ZodTypeAny } from "zod";
import { invokeZod } from "../ipc/invokeZod";

type AnyRecord = Record<string, any>;
type IpcMap = Record<string, string>;

function isPlainObject(v: any): v is AnyRecord {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function isIpcMap(v: any): v is IpcMap {
  return isPlainObject(v) && Object.values(v).every((x) => typeof x === "string");
}

function isZodSchema(v: any): v is ZodTypeAny {
  return !!v && typeof v.parse === "function";
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

function pickSchema(shared: AnyRecord, name: string): ZodTypeAny {
  const v = shared[name];
  if (!isZodSchema(v)) {
    throw new Error(
      `Missing or invalid schema export '${name}'. Exports: ${Object.keys(shared).join(", ")}`
    );
  }
  return v;
}

/**
 * Builds an API object whose keys are lowerCamel versions of ops:
 *  { List: "...", Upsert: "..."} -> { list(req?), upsert(req) }
 *
 * Each method:
 *  - parses req using <Op>Req
 *  - invokes channel
 *  - parses response using <Op>Res
 */
export function makeZodApiModule(shared: AnyRecord) {
  const ipcMap = pickIpcMap(shared);
  const out: AnyRecord = {};

  for (const [op, channel] of Object.entries(ipcMap)) {
    const reqSchema = pickSchema(shared, `${op}Req`);
    const resSchema = pickSchema(shared, `${op}Res`);
    const methodName = lowerFirst(op);

    out[methodName] = (req?: unknown) =>
      invokeZod({
        channel,
        reqSchema,
        resSchema,
        // most of your Req schemas are z.object(...), so default to {}
        req: (req ?? {}) as any,
      });
  }

  return Object.freeze(out);
}
