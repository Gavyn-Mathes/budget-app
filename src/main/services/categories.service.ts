// src/main/services/categories.service.ts

import type Database from "better-sqlite3";
import type { Category } from "../../shared/types/category";
import { withTx } from "./common";
import { CategoriesRepo } from "../db/repos/categories.repo";

export class CategoriesService {
  constructor(
    private readonly db: Database.Database,
    private readonly repo: CategoriesRepo
  ) {}

  list(): Category[] {
    return this.repo.list();
  }

  upsert(input: Category): Category {
    return withTx(this.db, () => this.repo.upsert(input));
  }

  delete(categoryId: string): void {
    return withTx(this.db, () => this.repo.delete(categoryId));
  }
}
