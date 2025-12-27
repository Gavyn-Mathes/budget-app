import { randomUUID } from "crypto"
import { getDb } from "../../index"

export type Category = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

// DB row shape (snake_case columns)
type CategoryRow = {
  id: string
  name: string
  created_at: string
  updated_at: string
}

function rowToCategory(r: CategoryRow): Category {
  return {
    id: r.id,
    name: r.name,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

/**
 * Create a new category.
 * - name must be unique (SQLite UNIQUE constraint).
 * - trims whitespace; rejects empty strings.
 */
export function createCategory(input: { name: string }): Category {
  const db = getDb()
  const now = new Date().toISOString()

  const name = input.name.trim()
  if (!name) throw new Error("category name cannot be empty")

  const row: CategoryRow = {
    id: randomUUID(),
    name,
    created_at: now,
    updated_at: now,
  }

  db.prepare(`
    INSERT INTO entry_categories (id, name, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `).run(row.id, row.name, row.created_at, row.updated_at)

  return rowToCategory(row)
}

/**
 * List categories sorted alphabetically.
 */
export function listCategories(): Category[] {
  const db = getDb()
  const rows = db
    .prepare(`SELECT id, name, created_at, updated_at FROM entry_categories ORDER BY name ASC`)
    .all() as CategoryRow[]

  return rows.map(rowToCategory)
}

/**
 * Get a category by id (returns null if missing).
 */
export function getCategoryById(id: string): Category | null {
  const db = getDb()
  const row = db
    .prepare(`SELECT id, name, created_at, updated_at FROM entry_categories WHERE id = ?`)
    .get(id) as CategoryRow | undefined

  return row ? rowToCategory(row) : null
}

/**
 * Get a category by name (case-sensitive, since SQLite UNIQUE is case-sensitive by default).
 * If you want case-insensitive uniqueness, we can enforce that via COLLATE NOCASE.
 */
export function getCategoryByName(name: string): Category | null {
  const db = getDb()
  const row = db
    .prepare(`SELECT id, name, created_at, updated_at FROM entry_categories WHERE name = ?`)
    .get(name.trim()) as CategoryRow | undefined

  return row ? rowToCategory(row) : null
}

/**
 * Rename a category. (Will throw if name collides with an existing category.)
 */
export function renameCategory(input: { id: string; name: string }): void {
  const db = getDb()
  const now = new Date().toISOString()

  const name = input.name.trim()
  if (!name) throw new Error("category name cannot be empty")

  const res = db.prepare(`
    UPDATE entry_categories
    SET name = ?, updated_at = ?
    WHERE id = ?
  `).run(name, now, input.id)

  if (res.changes === 0) throw new Error(`category not found: ${input.id}`)
}

/**
 * Delete a category.
 * NOTE: This will fail if any fund_entries reference it, because fund_entries.category_id is ON DELETE RESTRICT.
 */
export function deleteCategory(id: string): void {
  const db = getDb()
  const res = db.prepare(`DELETE FROM entry_categories WHERE id = ?`).run(id)
  if (res.changes === 0) throw new Error(`category not found: ${id}`)
}
