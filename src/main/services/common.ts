// src/main/services/common.ts

export class ServiceError extends Error {
  readonly code: string;
  readonly details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
    this.details = details;
  }
}

/**
 * Transaction helper:
 * - better-sqlite3: db.transaction(() => ...)()
 * - fallback: db.exec("BEGIN/COMMIT/ROLLBACK")
 * - otherwise: runs fn(db)
 */
export function withTx<T>(db: any, fn: (tx: any) => T): T {
  if (db && typeof db.transaction === "function") {
    const run = db.transaction(() => fn(db));
    return run();
  }

  if (db && typeof db.exec === "function") {
    db.exec("BEGIN");
    try {
      const out = fn(db);
      db.exec("COMMIT");
      return out;
    } catch (err) {
      try {
        db.exec("ROLLBACK");
      } catch {
        // ignore rollback failure
      }
      throw err;
    }
  }

  return fn(db);
}
