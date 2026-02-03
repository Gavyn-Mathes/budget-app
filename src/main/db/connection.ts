// main/db/connection.ts
import Database from "better-sqlite3";

export function openDatabase(dbPath: string): Database.Database {
  const db = new Database(dbPath);

  // Good defaults for desktop apps
  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  db.pragma("synchronous = NORMAL");

  return db;
}
