// main/db/mappers/categories.mapper.ts
import type { Category } from "../../../shared/types/category";

export type DbCategoryRow = {
  category_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export function mapCategory(row: DbCategoryRow): Category {
  return {
    categoryId: row.category_id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
