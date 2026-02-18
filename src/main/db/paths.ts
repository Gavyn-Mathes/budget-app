// main/db/path.ts
import { app } from "electron";
import fs from "fs";
import path from "path";

function ensureDir(dir: string): string {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * DB path:
 * - explicit override: BUDGET_DB_PATH or BUDGET_DB_DIR
 * - packaged default: Electron userData (writable install-safe location)
 * - dev default: repo data folder
 */
export function resolveDbPath(): string {
  const explicit = process.env.BUDGET_DB_PATH;
  if (explicit) {
    ensureDir(path.dirname(explicit));
    return explicit;
  }

  const dirOverride = process.env.BUDGET_DB_DIR;
  if (dirOverride) {
    ensureDir(dirOverride);
    return path.join(dirOverride, "budget.db");
  }

  if (app.isPackaged) {
    const userDataDir = ensureDir(app.getPath("userData"));
    return path.join(userDataDir, "budget.db");
  }

  const dataDir = ensureDir(path.join(process.cwd(), "data"));
  return path.join(dataDir, "budget.db");
}

/**
 * Migrations dir:
 * - packaged: resources/migrations (copied via electron-builder extraResources)
 * - dev: repo resources/migrations
 */
export function resolveMigrationsDir(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "migrations");
  }
  return path.join(process.cwd(), "resources", "migrations");
}
