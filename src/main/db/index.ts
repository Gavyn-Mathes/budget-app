// main/db/index.ts
import Database from "better-sqlite3"
import { app } from "electron"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

let db: Database.Database | null = null

function projectRoot(): string {
  return process.cwd()
}

function ensureProjectDataDir(): string {
  const dir = path.join(projectRoot(), "data")
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

function ensureDataDir(): string {
  const dir = path.join(app.getPath("userData"), "data")
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(ensureProjectDataDir(), "budget.db")
    console.log("SQLite DB path:", dbPath)

    db = new Database(dbPath)
    db.pragma("foreign_keys = ON")
  }
  return db
}

function getHereDir(): string {
  // Works in both CJS and ESM builds
  // - CJS: __dirname exists
  // - ESM: compute from import.meta.url
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyGlobal = globalThis as any
  if (typeof anyGlobal.__dirname !== "undefined") return anyGlobal.__dirname
  try {
    // In many TS builds, __dirname still exists. If not, use import.meta.url.
    // @ts-ignore
    if (typeof __dirname !== "undefined") return __dirname
  } catch {}
  // ESM fallback
  // @ts-ignore
  return path.dirname(fileURLToPath(import.meta.url))
}

function resolveMigrationsDir(): string {
  // Packaged app: copied by electron-builder extraResources -> process.resourcesPath/migrations
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "migrations")
  }

  // Dev: read from your repo folder
  return path.join(process.cwd(), "resources", "migrations")
}

export function initDb(): void {
  const db = getDb()

  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `)

  const appliedRows = db.prepare("SELECT id FROM migrations").all() as Array<{ id: string }>
  const applied = new Set(appliedRows.map(r => r.id))

  const dir = resolveMigrationsDir()

  const files = fs
    .readdirSync(dir)
    .filter(f => f.endsWith(".sql"))
    .sort() // 001_..., 002_...

  const insertMigration = db.prepare("INSERT INTO migrations (id, applied_at) VALUES (?, ?)")

  const tx = db.transaction(() => {
    for (const file of files) {
      if (applied.has(file)) continue
      const sql = fs.readFileSync(path.join(dir, file), "utf8")
      db.exec(sql)
      insertMigration.run(file, new Date().toISOString())
    }
  })

  tx()
}
