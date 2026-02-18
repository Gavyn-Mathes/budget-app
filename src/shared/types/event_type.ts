// shared/types/event_type.ts
import type { EventTypeDTO, EventTypeEditableDTO } from "../schemas/event_type";

export type EventTypeId = EventTypeDTO["eventTypeId"];
export type EventType = EventTypeDTO;
export type EventTypeEditable = EventTypeEditableDTO;
