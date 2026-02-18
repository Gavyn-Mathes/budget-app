// src/renderer/src/components/features/funds/events/pages/hooks/useFundEventsLinesPage.ts
import { useEffect, useMemo, useState } from "react";
import { fundEventsClient } from "../../../../../../api/fund_events";
import { eventTypesClient } from "../../../../../../api/event_types";
import { assetsClient } from "../../../../../../api/assets";
import { liabilitiesClient } from "../../../../../../api/liabilities";
import type { FundEvent } from "../../../../../../../../shared/types/fund_event";
import type { FundEventWithLinesUpsertInput, FundEventWithLines } from "../../../../../../../../shared/types/fund_event_line";
import type { EventType } from "../../../../../../../../shared/types/event_type";
import type { Asset } from "../../../../../../../../shared/types/asset";
import type { Liability } from "../../../../../../../../shared/types/liability";
import {
  DraftCreateLine,
  draftCreateLineToUpsert,
  storedLinesToUpsert,
  sOrNull,
} from "../utils/fundEventLines.helpers";
import { firstOfMonth, lastOfMonth, yyyyMmDd, todayIsoDate } from "../../../../../utils/month";

type EventTransferSummary = {
  amountMinor: number;
  fromAssetId: string;
  toAssetId: string;
};

function getTransferSummary(event: FundEventWithLines | null): EventTransferSummary | null {
  if (!event) return null;

  const moneyAssetLines = event.lines.filter(
    (line) => line.lineKind === "ASSET_MONEY" && !!line.assetId
  );

  if (moneyAssetLines.length < 2) return null;

  const negatives = moneyAssetLines.filter((line) => line.moneyDelta < 0);
  const positives = moneyAssetLines.filter((line) => line.moneyDelta > 0);

  if (negatives.length !== 1 || positives.length !== 1) return null;

  const from = negatives[0];
  const to = positives[0];
  if (Math.abs(from.moneyDelta) !== to.moneyDelta) return null;

  return {
    amountMinor: to.moneyDelta,
    fromAssetId: from.assetId!,
    toAssetId: to.assetId!,
  };
}

export function useFundEventsLinesPage() {
  // list state
  const now = new Date();
  const [startDate, setStartDate] = useState(yyyyMmDd(firstOfMonth(now)));
  const [endDate, setEndDate] = useState(yyyyMmDd(lastOfMonth(now)));
  const [rows, setRows] = useState<FundEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [transferSummaryByEventId, setTransferSummaryByEventId] = useState<
    Record<string, EventTransferSummary | null>
  >({});
  const [transferSummaryLoading, setTransferSummaryLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // dialogs state
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  // selected event
  const [selected, setSelected] = useState<FundEventWithLines | null>(null);

  // create draft
  const [createEventTypeId, setCreateEventTypeId] = useState("");
  const [createEventDate, setCreateEventDate] = useState(todayIsoDate());
  const [createMemo, setCreateMemo] = useState("");
  const [createLines, setCreateLines] = useState<DraftCreateLine[]>([
    {
      lineKind: "LIABILITY_MONEY",
      assetId: "",
      liabilityId: "",
      quantityDeltaMinor: "",
      moneyDelta: "",
      unitPrice: "",
      fee: "",
      notes: "",
    },
  ]);

  // edit draft (event fields only)
  const [editEventTypeId, setEditEventTypeId] = useState("");
  const [editEventDate, setEditEventDate] = useState("");
  const [editMemo, setEditMemo] = useState("");

  const eventTypeNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const eventType of eventTypes) {
      map.set(eventType.eventTypeId, eventType.eventType);
    }
    return map;
  }, [eventTypes]);

  const assetNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const asset of assets) {
      map.set(asset.assetId, asset.name ?? asset.assetId);
    }
    return map;
  }, [assets]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const list = await fundEventsClient.listByDateRange({ startDate, endDate });
      setRows(list);

      if (list.length === 0) {
        setTransferSummaryByEventId({});
        return;
      }

      setTransferSummaryLoading(true);
      const entries = await Promise.all(
        list.map(async (event) => {
          try {
            const detailRes = await fundEventsClient.getById({ eventId: event.eventId });
            const summary = getTransferSummary((detailRes as any)?.data ?? null);
            return [event.eventId, summary] as const;
          } catch {
            return [event.eventId, null] as const;
          }
        })
      );

      setTransferSummaryByEventId(Object.fromEntries(entries));
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setTransferSummaryByEventId({});
    } finally {
      setTransferSummaryLoading(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  useEffect(() => {
    let alive = true;

    async function refreshMeta() {
      setMetaLoading(true);
      setMetaError(null);
      try {
        const [eventTypesRes, assetsRes, liabilitiesRes] = await Promise.all([
          eventTypesClient.list({} as any),
          assetsClient.list({} as any),
          liabilitiesClient.list({} as any),
        ]);
        if (!alive) return;

        setEventTypes(
          [...(eventTypesRes ?? [])].sort((a, b) =>
            String(a.eventType ?? "").localeCompare(String(b.eventType ?? ""), undefined, {
              sensitivity: "base",
            })
          )
        );
        setAssets(
          [...(assetsRes ?? [])].sort((a, b) =>
            String(a.name ?? "").localeCompare(String(b.name ?? ""), undefined, {
              sensitivity: "base",
            })
          )
        );
        setLiabilities(
          [...(liabilitiesRes ?? [])].sort((a, b) =>
            String(a.name ?? "").localeCompare(String(b.name ?? ""), undefined, {
              sensitivity: "base",
            })
          )
        );
      } catch (e: any) {
        if (!alive) return;
        setEventTypes([]);
        setAssets([]);
        setLiabilities([]);
        setMetaError(e?.message ?? String(e));
      } finally {
        if (alive) setMetaLoading(false);
      }
    }

    void refreshMeta();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!createOpen) return;
    if (createEventTypeId) return;
    if (eventTypes.length === 0) return;
    setCreateEventTypeId(eventTypes[0].eventTypeId);
  }, [createOpen, createEventTypeId, eventTypes]);

  async function openEdit(eventId: string) {
    setDialogError(null);
    setBusy(true);
    try {
      const res = await fundEventsClient.getById({ eventId });
      const data = res.data;
      if (!data) throw new Error("Event not found");
      setSelected(data);

      setEditEventTypeId(data.event.eventTypeId);
      setEditEventDate(data.event.eventDate);
      setEditMemo(data.event.memo ?? "");

      setEditOpen(true);
    } catch (e: any) {
      setDialogError(e?.message ?? String(e));
      setEditOpen(true);
    } finally {
      setBusy(false);
    }
  }

  async function openDelete(eventId: string) {
    setDialogError(null);
    setBusy(true);
    try {
      const res = await fundEventsClient.getById({ eventId });
      const data = res.data;
      if (!data) throw new Error("Event not found");
      setSelected(data);
      setDeleteOpen(true);
    } catch (e: any) {
      setDialogError(e?.message ?? String(e));
      setDeleteOpen(true);
    } finally {
      setBusy(false);
    }
  }

  function openCreate() {
    setDialogError(null);
    setCreateEventTypeId(eventTypes[0]?.eventTypeId ?? "");
    setCreateEventDate(todayIsoDate());
    setCreateMemo("");
    setCreateLines([
      {
        lineKind: "LIABILITY_MONEY",
        assetId: "",
        liabilityId: "",
        quantityDeltaMinor: "",
        moneyDelta: "",
        unitPrice: "",
        fee: "",
        notes: "",
      },
    ]);
    setCreateOpen(true);
  }

  function cancelCreate() {
    setCreateOpen(false);
    setDialogError(null);
  }

  function cancelEdit() {
    setEditOpen(false);
    setDialogError(null);
    setSelected(null);
  }

  function cancelDelete() {
    setDeleteOpen(false);
    setDialogError(null);
    setSelected(null);
  }

  function addCreateLine() {
    setCreateLines((xs) => [
      ...xs,
      {
        lineKind: "LIABILITY_MONEY",
        assetId: "",
        liabilityId: "",
        quantityDeltaMinor: "",
        moneyDelta: "",
        unitPrice: "",
        fee: "",
        notes: "",
      },
    ]);
  }

  function removeCreateLine(idx: number) {
    setCreateLines((xs) => xs.filter((_, i) => i !== idx));
  }

  function patchCreateLine(idx: number, patch: Partial<DraftCreateLine>) {
    setCreateLines((xs) => xs.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  }

  async function confirmCreate() {
    setBusy(true);
    setDialogError(null);
    try {
      if (!createEventTypeId.trim()) throw new Error("eventTypeId is required");

      const payload: FundEventWithLinesUpsertInput = {
        event: {
          eventTypeId: createEventTypeId.trim(),
          eventDate: createEventDate,
          memo: sOrNull(createMemo),
        },
        lines: createLines.map(draftCreateLineToUpsert),
      };

      await fundEventsClient.upsert({ data: payload });

      setCreateOpen(false);
      await refresh();
    } catch (e: any) {
      setDialogError(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  async function confirmEdit() {
    setBusy(true);
    setDialogError(null);
    try {
      if (!selected) throw new Error("No selected event");
      if (!editEventTypeId.trim()) throw new Error("eventTypeId is required");

      const payload: FundEventWithLinesUpsertInput = {
        event: {
          eventId: selected.event.eventId,
          eventTypeId: editEventTypeId.trim(),
          eventDate: editEventDate,
          memo: sOrNull(editMemo),
        },
        lines: storedLinesToUpsert(selected.lines),
      };

      await fundEventsClient.upsert({ data: payload });

      setEditOpen(false);
      setSelected(null);
      await refresh();
    } catch (e: any) {
      setDialogError(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    setBusy(true);
    setDialogError(null);
    try {
      if (!selected) throw new Error("No selected event");
      await fundEventsClient.delete({ eventId: selected.event.eventId });

      setDeleteOpen(false);
      setSelected(null);
      await refresh();
    } catch (e: any) {
      setDialogError(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return useMemo(
    () => ({
      rows,
      eventTypes,
      eventTypeNameById,
      assets,
      assetNameById,
      liabilities,
      metaLoading,
      metaError,
      transferSummaryByEventId,
      transferSummaryLoading,
      loading,
      error,
      startDate,
      endDate,
      setStartDate,
      setEndDate,
      refresh,

      busy,
      dialogError,
      selected,

      createOpen,
      openCreate,
      cancelCreate,
      confirmCreate,
      createEventTypeId,
      setCreateEventTypeId,
      createEventDate,
      setCreateEventDate,
      createMemo,
      setCreateMemo,
      createLines,
      addCreateLine,
      removeCreateLine,
      patchCreateLine,

      editOpen,
      openEdit,
      cancelEdit,
      confirmEdit,
      editEventTypeId,
      setEditEventTypeId,
      editEventDate,
      setEditEventDate,
      editMemo,
      setEditMemo,

      deleteOpen,
      openDelete,
      cancelDelete,
      confirmDelete,
    }),
    [
      rows,
      eventTypes,
      eventTypeNameById,
      assets,
      assetNameById,
      liabilities,
      metaLoading,
      metaError,
      transferSummaryByEventId,
      transferSummaryLoading,
      loading,
      error,
      startDate,
      endDate,
      busy,
      dialogError,
      selected,

      createOpen,
      createEventTypeId,
      createEventDate,
      createMemo,
      createLines,

      editOpen,
      editEventTypeId,
      editEventDate,
      editMemo,

      deleteOpen,
    ]
  );
}
