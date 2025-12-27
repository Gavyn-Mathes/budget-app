// main/db/index.ts
import Database from "better-sqlite3"
import { app } from "electron"
import fs from "fs"
import path from "path"

let db: Database.Database | null = null

function ensureDataDir(): string {
  // Ensures a writable /data directory inside Electron's per-user app data folder.
  const dir = path.join(app.getPath("userData"), "data")
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

function migrationsDir(): string {
  // Expect migrations at: main/db/migrations/*.sql (and copied alongside compiled output)
  return path.join(__dirname, "migrations")
}

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(ensureDataDir(), "budget.db")
    db = new Database(dbPath)

    // Better defaults for desktop apps
    db.pragma("journal_mode = WAL")
    db.pragma("busy_timeout = 5000")
    db.pragma("foreign_keys = ON")
  }
  return db
}

export function initDb(): void {
  const conn = getDb()

  // Track which migrations have been applied
  conn.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `)

  const appliedRows = conn.prepare("SELECT id FROM migrations").all() as Array<{ id: string }>
  const applied = new Set(appliedRows.map(r => r.id))

  const dir = migrationsDir()
  if (!fs.existsSync(dir)) {
    throw new Error(`Migrations directory not found: ${dir}`)
  }

  const files = fs
    .readdirSync(dir)
    .filter(f => f.endsWith(".sql"))
    .sort() // 001_..., 002_..., ...

  const insertMigration = conn.prepare("INSERT INTO migrations (id, applied_at) VALUES (?, ?)")

  const tx = conn.transaction(() => {
    for (const file of files) {
      if (applied.has(file)) continue

      const sql = fs.readFileSync(path.join(dir, file), "utf8")
      conn.exec(sql)

      insertMigration.run(file, new Date().toISOString())
    }
  })

  tx()
}
