// src/main/ipc/common.ts
import { ipcMain } from "electron";
import { getDb } from "../db";

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
  // snake_case / kebab-case -> camelCase
  return s
    .toLowerCase()
    .replace(/[-_]+([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

function deriveListKey(namespace: string) {
  // e.g. "account_types" -> "accountTypes"
  return toCamel(namespace);
}

/**
 * Find the exported IPC map from shared module.
 * Expects something like:
 *   export const ACCOUNT_TYPES_IPC = { List: "...", Upsert: "...", ... } as const;
 */
function pickIpcMap(shared: AnyRecord): IpcMap {
  for (const [k, v] of Object.entries(shared)) {
    if (!k.endsWith("_IPC")) continue;
    if (isIpcMap(v)) return v;
  }

  throw new Error(
    `Could not find *_IPC export in shared module. Exports: ${Object.keys(shared).join(", ")}`
  );
}

/**
 * Find an exported Repo class (e.g. AccountTypesRepo).
 */
function pickRepoClass(repoModule: AnyRecord): new (db: any) => AnyRecord {
  for (const [k, v] of Object.entries(repoModule)) {
    if (!k.endsWith("Repo")) continue;
    if (typeof v === "function" && v.prototype) return v as any;
  }

  throw new Error(
    `Could not find Repo class export in repo module. Exports: ${Object.keys(repoModule).join(", ")}`
  );
}

function isZodSchema(v: any): v is { parse: (x: any) => any; safeParse?: (x: any) => any } {
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

function unwrapReqToRepoArgs(req: AnyRecord): any[] {
  // Common pattern in your shared IPC:
  // - {} -> no args
  // - { x: value } -> pass value
  // - { a, b } -> pass whole object
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

  // 1) For List ops, if repo returns an array, wrap it in { <derivedKey>: [...] }
  if (op === "List" && Array.isArray(result)) {
    const wrapped = { [deriveListKey(namespace)]: result };
    return resSchema.parse(wrapped);
  }

  // 2) Try parsing the repo result directly (some ops may return full objects)
  try {
    return resSchema.parse(result);
  } catch {
    // ignore
  }

  // 3) For Upsert/Delete style ops that often return void/object but response is { ok: true }
  try {
    return resSchema.parse({ ok: true });
  } catch {
    // ignore
  }

  // 4) Last resort: if result is object, try parse it as-is
  if (isPlainObject(result)) return resSchema.parse(result);

  // If none worked, throw with a helpful hint.
  throw new Error(
    `Could not build a valid response for ${namespace}.${op}. ` +
      `Check that ${op}Res matches what the repo method returns (or expects {ok:true}).`
  );
}

export function registerZodRepoIpc(opts: {
  namespace: string;     // e.g. "account_types"
  shared: AnyRecord;     // shared/ipc/<table>.ts module namespace import
  repoModule: AnyRecord; // main/db/repos/<table>.repo.ts module namespace import
  methodMap?: Record<string, string>; // optional overrides: { Upsert: "upsertById" }
}) {
  const { namespace, shared, repoModule, methodMap } = opts;

  const ipcMap = pickIpcMap(shared);
  const RepoClass = pickRepoClass(repoModule);

  // Instantiate once
  const repo = new RepoClass(getDb());

  for (const [op, channel] of Object.entries(ipcMap)) {
    const reqSchema = pickSchema(shared, `${op}Req`);
    const resSchema = pickSchema(shared, `${op}Res`);

    const methodName = methodMap?.[op] ?? lowerFirst(op);
    const fn = (repo as any)[methodName];

    if (typeof fn !== "function") {
      throw new Error(
        `Repo method not found for ${namespace}.${op}: expected repo.${methodName}(). ` +
          `Repo methods: ${Object.getOwnPropertyNames(Object.getPrototypeOf(repo)).join(", ")}`
      );
    }

    ipcMain.handle(channel, async (_event, ...args) => {
      const raw = args[0] ?? {};
      const req = reqSchema.parse(raw);

      const repoArgs = unwrapReqToRepoArgs(req);
      const result = await Promise.resolve(fn.apply(repo, repoArgs));

      return buildResponse({ op, namespace, result, resSchema });
    });
  }
}
