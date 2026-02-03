// shared/schemas/account_type.ts
import { z } from "zod";
import { IdSchema, IsoTimestampSchema } from "./common";

export const AccountTypeSchema = z.object({
  accountTypeId: IdSchema,
  accountType: z.string().min(1),
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

export type AccountTypeDTO = z.infer<typeof AccountTypeSchema>;
