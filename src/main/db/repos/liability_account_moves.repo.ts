// main/db/repos/liability_account_moves.repo.ts
import Database from "better-sqlite3";
import type {
  LiabilityAccountMove,
  LiabilityAccountMoveCreateInput,
} from "../../../shared/types/liability_account_move";
import {
  mapLiabilityAccountMove,
  type DbLiabilityAccountMoveRow,
} from "../mappers/liability_account_moves.mapper";
import { assertChanges, newId, nowIso } from "../mappers/common";

type LiabilityRow = {
  liability_id: string;
  account_id: string;
};

export class LiabilityAccountMovesRepo {
  constructor(private db: Database.Database) {}

  private selectBase = `
    SELECT
      move_id,
      liability_id,
      from_account_id,
      to_account_id,
      event_date,
      memo,
      created_at,
      updated_at
    FROM liability_account_move
  `;

  getById(moveId: string): LiabilityAccountMove | null {
    const row = this.db
      .prepare(
        `
        ${this.selectBase}
        WHERE move_id = ?
      `
      )
      .get(moveId) as DbLiabilityAccountMoveRow | undefined;

    return row ? mapLiabilityAccountMove(row) : null;
  }

  listByLiability(liabilityId: string): LiabilityAccountMove[] {
    const rows = this.db
      .prepare(
        `
        ${this.selectBase}
        WHERE liability_id = ?
        ORDER BY event_date ASC, created_at ASC
      `
      )
      .all(liabilityId) as DbLiabilityAccountMoveRow[];

    return rows.map(mapLiabilityAccountMove);
  }

  create(input: LiabilityAccountMoveCreateInput): LiabilityAccountMove {
    const ts = nowIso();
    const moveId = newId();

    const selectLiability = this.db.prepare(`
      SELECT liability_id, account_id
      FROM liability
      WHERE liability_id = ?
    `);

    const updateLiabilityAccount = this.db.prepare(`
      UPDATE liability
      SET account_id = ?, updated_at = ?
      WHERE liability_id = ?
    `);

    const insertMove = this.db.prepare(`
      INSERT INTO liability_account_move (
        move_id,
        liability_id,
        from_account_id,
        to_account_id,
        event_date,
        memo,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const existing = selectLiability.get(input.liabilityId) as LiabilityRow | undefined;
    if (!existing) {
      throw new Error(`Liability not found: ${input.liabilityId}`);
    }

    if (existing.account_id === input.toAccountId) {
      throw new Error(`Destination account must differ from current account`);
    }

    const insertResult = insertMove.run(
      moveId,
      input.liabilityId,
      existing.account_id,
      input.toAccountId,
      input.eventDate,
      input.memo ?? null,
      ts,
      ts
    );
    assertChanges(insertResult, "Failed to insert liability_account_move");

    const updateResult = updateLiabilityAccount.run(input.toAccountId, ts, input.liabilityId);
    assertChanges(updateResult, "Failed to update liability account");

    return this.getById(moveId)!;
  }
}
