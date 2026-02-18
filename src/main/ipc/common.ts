// src/main/ipc/common.ts
import { ipcMain } from "electron";

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

function toCamel(s: string) {
  return s
    .toLowerCase()
    .replace(/[-_]+([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

function deriveListKey(namespace: string) {
  return toCamel(namespace);
}

function pickIpcMap(shared: AnyRecord): IpcMap {
  for (const [k, v] of Object.entries(shared)) {
    if (!k.endsWith("_IPC")) continue;
    if (isIpcMap(v)) return v;
  }

  throw new Error(
    `Could not find *_IPC export in shared module. Exports: ${Object.keys(shared).join(", ")}`
  );
}

function isZodSchema(v: any): v is { parse: (x: any) => any } {
  return !!v && typeof v.parse === "function";
}

function pickSchema(shared: AnyRecord, name: string) {
  const v = shared[name];
  if (!isZodSchema(v)) {
    throw new Error(
      `Missing or invalid Zod schema export '${name}'. Exports: ${Object.keys(shared).join(", ")}`
    );
  }
  return v;
}

function unwrapReqToImplArgs(req: AnyRecord): any[] {
  const keys = isPlainObject(req) ? Object.keys(req) : [];
  if (keys.length === 0) return [];
  if (keys.length === 1) return [req[keys[0]]];
  return [req];
}

function buildResponse(opts: {
  op: string;
  namespace: string;
  result: any;
  resSchema: { parse: (x: any) => any };
}) {
  const { op, namespace, result, resSchema } = opts;

  if (op.startsWith("List") && Array.isArray(result)) {
    const wrapped = { [deriveListKey(namespace)]: result };
    return resSchema.parse(wrapped);
  }

  try {
    return resSchema.parse(result);
  } catch {
    // ignore
  }

  try {
    return resSchema.parse({ ok: true });
  } catch {
    // ignore
  }

  if (isPlainObject(result)) return resSchema.parse(result);

  throw new Error(
    `Could not build a valid response for ${namespace}.${op}. ` +
      `Either align ${op}Res with what impl.${lowerFirst(op)} returns, or provide responseMap['${op}'].`
  );
}

/**
 * impl-only IPC registrar (impl can be repo or service)
 */
export function registerZodIpc(opts: {
  namespace: string;
  shared: AnyRecord;
  impl: AnyRecord;

  methodMap?: Record<string, string>;
  responseMap?: Record<string, (result: any, req: AnyRecord) => any>;
  argMap?: Record<string, (req: AnyRecord) => any[]>;
}) {
  const { namespace, shared, impl, methodMap, responseMap, argMap } = opts;

  const ipcMap = pickIpcMap(shared);

  for (const [op, channel] of Object.entries(ipcMap)) {
    const reqSchema = pickSchema(shared, `${op}Req`);
    const resSchema = pickSchema(shared, `${op}Res`);

    const methodName = methodMap?.[op] ?? lowerFirst(op);
    const fn = (impl as any)[methodName];

    if (typeof fn !== "function") {
      throw new Error(
        `Impl method not found for ${namespace}.${op}: expected impl.${methodName}(). ` +
          `Impl methods: ${Object.getOwnPropertyNames(Object.getPrototypeOf(impl)).join(", ")}`
      );
    }

    ipcMain.handle(channel, async (_event, ...args) => {
      try {
        console.log(`[main][ipc] hit ${namespace}.${op} (${channel})`);

        const raw = args[0] ?? {};
        const req = reqSchema.parse(raw);
        
        const toArgs = argMap?.[op] ?? unwrapReqToImplArgs;
        const implArgs = toArgs(req);

        const result = await Promise.resolve(fn.apply(impl, implArgs));

        const wrapper = responseMap?.[op];
        if (wrapper) return resSchema.parse(wrapper(result, req));

        return buildResponse({ op, namespace, result, resSchema });
      } catch (e: any) {
        console.error(`[main][ipc] ERROR ${namespace}.${op} (${channel})`, e);
        console.error("[main][ipc] stack:", e?.stack);
        throw e;
      }
    });
  }
}
