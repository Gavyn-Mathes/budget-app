// shared/schemas/fund_event.ts
import { z } from "zod";
import { IdSchema, IsoDateSchema, IsoTimestampSchema } from "./common";

export const FundEventSchema = z.object({
  eventId: IdSchema,
  eventTypeId: IdSchema,
  eventDate: IsoDateSchema,
  memo: z.string().nullable(),
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

export type FundEventDTO = z.infer<typeof FundEventSchema>;
