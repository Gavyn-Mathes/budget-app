// src/renderer/src/components/features/funds/events/lines/utils/fundEventsLines.helpers.ts
import type {
  FundEventLineUpsertInput,
  FundEventWithLines,
} from "../../../../../../../../shared/types/fund_event_line";
import { parseMoney } from "../../../../../utils/formatMoney";

export type LineKind = "ASSET_QUANTITY" | "ASSET_MONEY" | "LIABILITY_MONEY";

export type DraftCreateLine = {
  lineKind: LineKind;
  assetId: string;
  liabilityId: string;
  quantityDeltaMinor: string; // int
  moneyDelta: string; // decimal major input -> parsed to minor
  unitPrice: string;
  fee: string; // decimal major input -> parsed to minor
  notes: string;
};

export function sOrNull(s: string): string | null {
  const t = s.trim();
  return t ? t : null;
}

export function toIntRequired(s: string, label: string): number {
  const t = s.trim();
  if (!t) throw new Error(`${label} is required`);
  const n = Number(t);
  if (!Number.isInteger(n)) throw new Error(`${label} must be an integer (minor units)`);
  return n;
}

function toMoneyRequired(s: string, label: string): number {
  const t = s.trim();
  if (!t) throw new Error(`${label} is required`);
  try {
    return parseMoney(t);
  } catch {
    throw new Error(`${label} must be a valid amount (e.g. 12.34)`);
  }
}

function toMoneyNonNegativeOrNull(s: string, label: string): number | null {
  const t = s.trim();
  if (!t) return null;
  let value = 0;
  try {
    value = parseMoney(t);
  } catch {
    throw new Error(`${label} must be a valid amount (e.g. 12.34)`);
  }
  if (value < 0) throw new Error(`${label} must be non-negative`);
  return value;
}

export function storedLinesToUpsert(lines: FundEventWithLines["lines"]): FundEventLineUpsertInput[] {
  return lines.map((line) => {
    if (line.lineKind === "ASSET_QUANTITY") {
      return {
        lineId: line.lineId,
        lineNo: line.lineNo,
        lineKind: "ASSET_QUANTITY",
        assetId: line.assetId,
        liabilityId: null,
        quantityDeltaMinor: line.quantityDeltaMinor,
        moneyDelta: null,
        unitPrice: line.unitPrice,
        fee: line.fee,
        notes: line.notes,
      };
    }
    if (line.lineKind === "ASSET_MONEY") {
      return {
        lineId: line.lineId,
        lineNo: line.lineNo,
        lineKind: "ASSET_MONEY",
        assetId: line.assetId,
        liabilityId: null,
        quantityDeltaMinor: null,
        moneyDelta: line.moneyDelta,
        unitPrice: line.unitPrice,
        fee: line.fee,
        notes: line.notes,
      };
    }
    return {
      lineId: line.lineId,
      lineNo: line.lineNo,
      lineKind: "LIABILITY_MONEY",
      assetId: null,
      liabilityId: line.liabilityId,
      quantityDeltaMinor: null,
      moneyDelta: line.moneyDelta,
      unitPrice: line.unitPrice,
      fee: line.fee,
      notes: line.notes,
    };
  });
}

export function draftCreateLineToUpsert(line: DraftCreateLine, idx: number): FundEventLineUpsertInput {
  const common = {
    lineNo: idx,
    unitPrice: sOrNull(line.unitPrice),
    fee: toMoneyNonNegativeOrNull(line.fee, `Line ${idx + 1}: fee`),
    notes: sOrNull(line.notes),
  };

  if (line.lineKind === "ASSET_QUANTITY") {
    if (!line.assetId.trim()) throw new Error(`Line ${idx + 1}: assetId is required`);
    return {
      ...common,
      lineKind: "ASSET_QUANTITY",
      assetId: line.assetId.trim(),
      liabilityId: null,
      quantityDeltaMinor: toIntRequired(line.quantityDeltaMinor, `Line ${idx + 1}: quantityDeltaMinor`),
      moneyDelta: null,
    };
  }

  if (line.lineKind === "ASSET_MONEY") {
    if (!line.assetId.trim()) throw new Error(`Line ${idx + 1}: assetId is required`);
    return {
      ...common,
      lineKind: "ASSET_MONEY",
      assetId: line.assetId.trim(),
      liabilityId: null,
      quantityDeltaMinor: null,
      moneyDelta: toMoneyRequired(line.moneyDelta, `Line ${idx + 1}: moneyDelta`),
    };
  }

  if (!line.liabilityId.trim()) throw new Error(`Line ${idx + 1}: liabilityId is required`);
  return {
    ...common,
    lineKind: "LIABILITY_MONEY",
    assetId: null,
    liabilityId: line.liabilityId.trim(),
    quantityDeltaMinor: null,
    moneyDelta: toMoneyRequired(line.moneyDelta, `Line ${idx + 1}: moneyDelta`),
  };
}
