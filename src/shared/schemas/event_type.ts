// shared/schemas/event_type.ts
import { z } from "zod";
import { IdSchema, IsoTimestampSchema } from "./common";

export const EventTypeSchema = z.object({
  eventTypeId: IdSchema,
  eventType: z.string().min(1),
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

export type EventTypeDTO = z.infer<typeof EventTypeSchema>;
