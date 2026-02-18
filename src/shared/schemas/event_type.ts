// shared/schemas/event_type.ts
import { z } from "zod";
import { IdSchema, IsoTimestampSchema } from "./common";

export const EventTypeEditableSchema = z.object({
  eventType: z.string().min(1),
});

export const EventTypeSchema = EventTypeEditableSchema.extend({
  eventTypeId: IdSchema,
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

export type EventTypeDTO = z.infer<typeof EventTypeSchema>;
export type EventTypeEditableDTO = z.infer<typeof EventTypeEditableSchema>;
