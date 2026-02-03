// shared/ipc/event_types.ts
import { z } from "zod";
import { IdSchema } from "../schemas/common";
import { EventTypeSchema } from "../schemas/event_type";

export const EVENT_TYPES_IPC = {
  List: "event-types:list",
  GetById: "event-types:get-by-id",
  Create: "event-types:create",
  Update: "event-types:update",
  Delete: "event-types:delete",
} as const;

export const ListReq = z.object({});
export const ListRes = z.object({
  types: z.array(EventTypeSchema),
});

export const GetByIdReq = z.object({ eventTypeId: IdSchema });
export const GetByIdRes = z.object({
  data: EventTypeSchema.nullable(),
});

export const CreateReq = z.object({
  eventType: z.string().min(1),
});
export const CreateRes = z.object({
  data: EventTypeSchema,
});

export const UpdateReq = z.object({
  eventTypeId: IdSchema,
  eventType: z.string().min(1),
});
export const UpdateRes = z.object({
  data: EventTypeSchema,
});

export const DeleteReq = z.object({ eventTypeId: IdSchema });
export const DeleteRes = z.object({ ok: z.literal(true) });
