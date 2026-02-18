// src/renderer/src/api/event_types.ts
import type { EventType } from "../../../shared/types/event_type";
import { getApi, unwrapList } from "./common";

const api = () => getApi().eventTypes;
type Api = ReturnType<typeof api>;

type ListReq = Parameters<Api["list"]>[0];
type GetByIdReq = Parameters<Api["getById"]>[0];
type CreateReq = Parameters<Api["create"]>[0];
type UpdateReq = Parameters<Api["update"]>[0];
type DeleteReq = Parameters<Api["delete"]>[0];

export const eventTypesClient = {
  list: unwrapList<ListReq, "eventTypes", EventType>((req: ListReq) => api().list(req), "eventTypes"),
  getById: (req: GetByIdReq) => api().getById(req),
  create: (req: CreateReq) => api().create(req),
  update: (req: UpdateReq) => api().update(req),
  delete: (req: DeleteReq) => api().delete(req),
};
