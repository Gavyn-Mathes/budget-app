// main/db/mappers/liability_account_moves.mapper.ts
import type { LiabilityAccountMove } from "../../../shared/types/liability_account_move";

export type DbLiabilityAccountMoveRow = {
  move_id: string;
  liability_id: string;
  from_account_id: string;
  to_account_id: string;
  event_date: string;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

export function mapLiabilityAccountMove(
  row: DbLiabilityAccountMoveRow
): LiabilityAccountMove {
  return {
    moveId: row.move_id,
    liabilityId: row.liability_id,
    fromAccountId: row.from_account_id,
    toAccountId: row.to_account_id,
    eventDate: row.event_date,
    memo: row.memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
