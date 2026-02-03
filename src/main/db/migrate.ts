// main/db/migrate.ts
import Database from "better-sqlite3";
import crypto from "crypto";
import fs from "fs";
import path from "path";

type MigrationRow = { id: string; checksum: string };

function sha256(s: string): string {
  return crypto.createHash("sha256").update(s, "utf8").digest("hex");
}

export function runMigrations(db: Database.Database, migrationsDir: string): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id         TEXT PRIMARY KEY,
      checksum   TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = new Map<string, string>();
  const rows = db.prepare("SELECT id, checksum FROM migrations").all() as MigrationRow[];
  for (const r of rows) applied.set(r.id, r.checksum);

  const files = fs
    .readdirSync(migrationsDir)
    .filter(f => f.endsWith(".sql"))
    .sort();

  const insert = db.prepare("INSERT INTO migrations (id, checksum, applied_at) VALUES (?, ?, ?)");
  const tx = db.transaction(() => {
    for (const file of files) {
      const full = path.join(migrationsDir, file);
      const sql = fs.readFileSync(full, "utf8");
      const checksum = sha256(sql);

      const already = applied.get(file);
      if (already) {
        // If someone changed an already-applied migration, fail fast.
        if (already !== checksum) {
          throw new Error(
            `Migration checksum mismatch for ${file}. ` +
            `It was applied before but the file contents changed.`
          );
        }
        continue;
      }

      db.exec(sql);
      insert.run(file, checksum, new Date().toISOString());
    }
  });

  tx();
}
