// main/db/index.ts
import Database from "better-sqlite3";
import { openDatabase } from "./connection";
import { resolveDbPath, resolveMigrationsDir } from "./paths";
import { runMigrations } from "./migrate";

let db: Database.Database | null = null;

export function initDb(): void {
  if (db) return;

  // Important: call this after app.whenReady() in Electron main
  const dbPath = resolveDbPath();
  db = openDatabase(dbPath);

  const migrationsDir = resolveMigrationsDir();
  runMigrations(db, migrationsDir);

  console.log("SQLite DB path:", dbPath);
}

export function getDb(): Database.Database {
  if (!db) throw new Error("DB not initialized. Call initDb() first.");
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
