// src/main/services/liabilities.service.ts

import type Database from "better-sqlite3";
import type { Liability, LiabilityWithBalance } from "../../shared/types/liability";
import type {
  LiabilityAccountMove,
  LiabilityAccountMoveCreateInput,
} from "../../shared/types/liability_account_move";
import { withTx } from "./common";
import { LiabilitiesRepo } from "../db/repos/liabilities.repo";
import { LiabilityAccountMovesRepo } from "../db/repos/liability_account_moves.repo";

export class LiabilitiesService {
  constructor(
    private readonly db: Database.Database,
    private readonly repo: LiabilitiesRepo,
    private readonly movesRepo: LiabilityAccountMovesRepo
  ) {}

  list(): Liability[] {
    return this.repo.list();
  }

  listWithBalances(): LiabilityWithBalance[] {
    return this.repo.listWithBalances();
  }

  listByFund(fundId: string): Liability[] {
    return this.repo.listByFund(fundId);
  }

  getById(liabilityId: string): Liability | null {
    return this.repo.getById(liabilityId);
  }

  upsert(input: Liability): Liability {
    return withTx(this.db, () => this.repo.upsert(input));
  }

  delete(liabilityId: string): void {
    return withTx(this.db, () => this.repo.delete(liabilityId));
  }

  moveAccount(input: LiabilityAccountMoveCreateInput): LiabilityAccountMove {
    return withTx(this.db, () => this.movesRepo.create(input));
  }
}
