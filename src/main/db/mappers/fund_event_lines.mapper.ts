// main/db/mappers/fund_event_lines.mapper.ts
import type { FundEventLine } from "../../../shared/types/fund_event_line";

export type DbFundEventLineRow = {
  line_id: string;
  event_id: string;

  asset_id: string | null;
  liability_id: string | null;

  quantity_delta: number | null;
  balance_delta: number | null;

  unit_price: number | null;
  fee: number | null;
  notes: string | null;

  created_at: string;
  updated_at: string;
};

export function mapFundEventLine(row: DbFundEventLineRow): FundEventLine {
  const base = {
    lineId: row.line_id,
    eventId: row.event_id,
    unitPrice: row.unit_price as any, // Money branded number
    fee: row.fee as any,              // Money branded number
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as const;

  // Asset line
  if (row.asset_id !== null) {
    if (row.liability_id !== null || row.quantity_delta === null || row.balance_delta !== null) {
      throw new Error(`Invalid asset fund_event_line for line_id=${row.line_id}`);
    }
    return {
      ...base,
      assetId: row.asset_id,
      liabilityId: null,
      quantityDelta: row.quantity_delta,
      balanceDelta: null,
    };
  }

  // Liability line
  if (row.liability_id !== null) {
    if (row.asset_id !== null || row.balance_delta === null || row.quantity_delta !== null) {
      throw new Error(`Invalid liability fund_event_line for line_id=${row.line_id}`);
    }
    return {
      ...base,
      assetId: null,
      liabilityId: row.liability_id,
      quantityDelta: null,
      balanceDelta: row.balance_delta as any, // Money branded number
    };
  }

  throw new Error(`Invalid fund_event_line: neither asset_id nor liability_id set (line_id=${row.line_id})`);
}
