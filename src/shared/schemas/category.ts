// shared/schemas/category.ts
import { z } from "zod";
import { IdSchema, IsoTimestampSchema } from "./common";

export const CategorySchema = z.object({
  categoryId: IdSchema,
  name: z.string().min(1),
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

export type CategoryDTO = z.infer<typeof CategorySchema>;
