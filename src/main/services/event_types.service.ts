// src/main/services/event_types.service.ts

import type Database from "better-sqlite3";
import type { EventType, EventTypeEditable } from "../../shared/types/event_type";
import { withTx } from "./common";
import { EventTypesRepo } from "../db/repos/event_types.repo";

export class EventTypesService {
  constructor(
    private readonly db: Database.Database,
    private readonly repo: EventTypesRepo
  ) {}

  list(): EventType[] {
    return this.repo.list();
  }

  create(eventType: EventTypeEditable): EventType {
    return withTx(this.db, () => this.repo.create(eventType));
  }

  getById(eventTypeId: string): EventType | null {
    return this.repo.getById(eventTypeId);
  }

  update(req: { eventTypeId: string; eventType: EventTypeEditable }): EventType {
    return withTx(this.db, () => this.repo.update(req.eventTypeId, req.eventType));
  }

  delete(eventTypeId: string): void {
    return withTx(this.db, () => this.repo.delete(eventTypeId));
  }
}
