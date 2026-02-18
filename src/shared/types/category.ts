// shared/types/category.ts
import type { CategoryDTO, CategoryUpsertInputDTO } from "../schemas/category";

export type CategoryId = CategoryDTO["categoryId"];
export type Category = CategoryDTO;
export type CategoryUpsertInput = CategoryUpsertInputDTO;
