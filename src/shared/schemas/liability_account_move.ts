// shared/schemas/liability_account_move.ts
import { z } from "zod";
import { IdSchema, IsoDateSchema, IsoTimestampSchema } from "./common";

export const LiabilityAccountMoveCreateInputSchema = z.object({
  liabilityId: IdSchema,
  toAccountId: IdSchema,
  eventDate: IsoDateSchema,
  memo: z.string().nullable().optional().default(null),
});

export const LiabilityAccountMoveSchema = z.object({
  moveId: IdSchema,
  liabilityId: IdSchema,
  fromAccountId: IdSchema,
  toAccountId: IdSchema,
  eventDate: IsoDateSchema,
  memo: z.string().nullable(),
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

export type LiabilityAccountMoveDTO = z.infer<typeof LiabilityAccountMoveSchema>;
export type LiabilityAccountMoveCreateInputDTO = z.infer<
  typeof LiabilityAccountMoveCreateInputSchema
>;
