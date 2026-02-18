// shared/schemas/fund_event.ts
import { z } from "zod";
import { IdSchema, IsoDateSchema, IsoTimestampSchema } from "./common";

export const FundEventEditableSchema = z.object({
  eventTypeId: IdSchema,
  eventDate: IsoDateSchema,
  memo: z.string().nullable().optional().default(null),
});

export const FundEventSchema = FundEventEditableSchema.extend({
  eventId: IdSchema,
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

export const FundEventUpsertInputSchema = FundEventEditableSchema.extend({
  eventId: IdSchema.optional(),
});

export type FundEventDTO = z.infer<typeof FundEventSchema>;
export type FundEventUpsertInputDTO = z.infer<typeof FundEventUpsertInputSchema>;
