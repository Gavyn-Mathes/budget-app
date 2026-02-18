// shared/schemas/category.ts
import { z } from "zod";
import { IdSchema, IsoTimestampSchema } from "./common";

export const CategoryEditableSchema = z.object({
  name: z.string().min(1),
});

export const CategorySchema = CategoryEditableSchema.extend({
  categoryId: IdSchema,
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

export const CategoryUpsertInputSchema = CategoryEditableSchema.extend({
  categoryId: IdSchema.optional(),
});

export type CategoryDTO = z.infer<typeof CategorySchema>;
export type CategoryUpsertInputDTO = z.infer<typeof CategoryUpsertInputSchema>;
