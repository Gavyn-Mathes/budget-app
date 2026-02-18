// src/renderer/src/components/features/funds/events/types/hooks/useEventTypesPage.ts
import { useEffect, useMemo, useState } from "react";
import type { EventType } from "../../../../../../../../shared/types/event_type";
import { eventTypesClient } from "@/api/event_types";
import {
  makeDraftEventType,
  normalizeEventTypeUpsert,
  upsertInputFromEventType,
  type EventTypeUpsertInput,
} from "../utils/eventTypes.helpers";

export function useEventTypesPage() {
  const [rows, setRows] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editor, setEditor] = useState<EventTypeUpsertInput | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EventType | null>(null);

  const count = useMemo(() => rows.length, [rows]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const eventTypes = await eventTypesClient.list({});
      setRows(eventTypes);
    } catch (e: unknown) {
      setRows([]);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditor(makeDraftEventType());
    setEditorOpen(true);
  }

  function openEdit(row: EventType) {
    setEditor(upsertInputFromEventType(row));
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditor(null);
  }

  function patchEditor(patch: Partial<EventTypeUpsertInput>) {
    setEditor((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  async function saveEditor() {
    if (!editor) return;

    const normalized = normalizeEventTypeUpsert(editor);

    // NOTE: normalizeEventTypeUpsert(editor) appears to produce:
    // { eventTypeId?: string, eventType: { eventType: string } }
    const name = normalized.eventType.eventType;

    if (!name.trim()) {
      setError("Event type name is required.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (normalized.eventTypeId) {
        // UPDATE
        await eventTypesClient.update({
          eventTypeId: normalized.eventTypeId,
          eventType: name,
        });
      } else {
        // CREATE
        await eventTypesClient.create({
          eventType: name,
        });
      }

      closeEditor();
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  function requestDelete(row: EventType) {
    setDeleteTarget(row);
    setDeleteOpen(true);
  }

  function cancelDelete() {
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setLoading(true);
    setError(null);
    try {
      await eventTypesClient.delete({ eventTypeId: deleteTarget.eventTypeId });
      cancelDelete();
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return {
    rows,
    count,
    loading,
    error,

    refresh,

    editorOpen,
    editor,
    openCreate,
    openEdit,
    closeEditor,
    patchEditor,
    saveEditor,

    deleteOpen,
    deleteTarget,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
}
