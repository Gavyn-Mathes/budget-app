// main/db/repos/categories.repo.ts
import Database from "better-sqlite3";
import type { Category } from "../../../shared/types/category";
import { mapCategory, type DbCategoryRow } from "../mappers/categories.mapper";
import { nowIso, newId, assertChanges } from "../mappers/common";

export class CategoriesRepo {
  constructor(private db: Database.Database) {}

  list(): Category[] {
    const rows = this.db
      .prepare(
        `
        SELECT category_id, name, created_at, updated_at
        FROM entry_categories
        ORDER BY name COLLATE NOCASE
      `
      )
      .all() as DbCategoryRow[];

    return rows.map(mapCategory);
  }

  getById(categoryId: string): Category | null {
    const row = this.db
      .prepare(
        `
        SELECT category_id, name, created_at, updated_at
        FROM entry_categories
        WHERE category_id = ?
      `
      )
      .get(categoryId) as DbCategoryRow | undefined;

    return row ? mapCategory(row) : null;
  }

  /**
   * Upsert by primary key (category_id).
   * Insert sets created_at/updated_at to now.
   * Update preserves created_at and bumps updated_at.
   *
   * Note: name is UNIQUE (SQLite will throw on conflicts).
   */
  upsert(input: Category): Category {
    const id = input.categoryId?.trim() ? input.categoryId : newId();
    const ts = nowIso();

    const existing = this.db
      .prepare(`SELECT created_at FROM entry_categories WHERE category_id = ?`)
      .get(id) as { created_at: string } | undefined;

    const createdAt = existing?.created_at ?? ts;

    this.db
      .prepare(
        `
        INSERT INTO entry_categories (category_id, name, created_at, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(category_id) DO UPDATE SET
          name       = excluded.name,
          updated_at = excluded.updated_at
      `
      )
      .run(id, input.name, createdAt, ts);

    return this.getById(id)!;
  }

  delete(categoryId: string): void {
    const result = this.db.prepare(`DELETE FROM entry_categories WHERE category_id = ?`).run(categoryId);
    assertChanges(result, `Category not found (delete): ${categoryId}`);
  }
}
