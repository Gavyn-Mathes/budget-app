// main/db/mappers/fund_event_lines.mapper.ts
import type { FundEventLine } from "../../../shared/types/fund_event_line";

export type DbFundEventLineRow = {
  line_id: string;
  event_id: string;
  line_no: number;

  asset_id: string | null;
  liability_id: string | null;

  line_kind: "ASSET_QUANTITY" | "ASSET_MONEY" | "LIABILITY_MONEY";

  quantity_delta_minor: number | null;
  money_delta_minor: number | null;
  fee_minor: number | null;

  unit_price: string | null; // per your StoredBase: string|null
  notes: string | null;

  created_at: string;
  updated_at: string;
};

export function mapFundEventLine(row: DbFundEventLineRow): FundEventLine {
  const base = {
    lineId: row.line_id,
    eventId: row.event_id,
    lineNo: row.line_no,

    unitPrice: row.unit_price, // string | null
    fee: row.fee_minor,
    notes: row.notes,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as const;

  // sanity: exactly one target
  const hasAsset = row.asset_id !== null;
  const hasLiability = row.liability_id !== null;
  if (hasAsset === hasLiability) {
    throw new Error(
      `Invalid fund_event_line: expected exactly one of asset_id/liability_id (line_id=${row.line_id})`
    );
  }

  switch (row.line_kind) {
    case "ASSET_QUANTITY": {
      if (!hasAsset || row.quantity_delta_minor === null || row.money_delta_minor !== null) {
        throw new Error(`Invalid ASSET_QUANTITY fund_event_line (line_id=${row.line_id})`);
      }
      return {
        ...base,
        lineKind: "ASSET_QUANTITY",
        assetId: row.asset_id!,
        liabilityId: null,
        quantityDeltaMinor: row.quantity_delta_minor,
        moneyDelta: null,
      };
    }

    case "ASSET_MONEY": {
      if (!hasAsset || row.money_delta_minor === null || row.quantity_delta_minor !== null) {
        throw new Error(`Invalid ASSET_MONEY fund_event_line (line_id=${row.line_id})`);
      }
      return {
        ...base,
        lineKind: "ASSET_MONEY",
        assetId: row.asset_id!,
        liabilityId: null,
        quantityDeltaMinor: null,
        moneyDelta: row.money_delta_minor,
      };
    }

    case "LIABILITY_MONEY": {
      if (!hasLiability || row.money_delta_minor === null || row.quantity_delta_minor !== null) {
        throw new Error(`Invalid LIABILITY_MONEY fund_event_line (line_id=${row.line_id})`);
      }
      return {
        ...base,
        lineKind: "LIABILITY_MONEY",
        assetId: null,
        liabilityId: row.liability_id!,
        quantityDeltaMinor: null,
        moneyDelta: row.money_delta_minor,
      };
    }

    default: {
      const _exhaustive: never = row.line_kind;
      throw new Error(`Unknown line_kind=${_exhaustive}`);
    }
  }
}
