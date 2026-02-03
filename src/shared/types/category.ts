// shared/types/category.ts
import type { Id, IsoTimestamp } from "./common";

export type CategoryId = Id;

export interface Category {
  categoryId: CategoryId;
  name: string;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}
