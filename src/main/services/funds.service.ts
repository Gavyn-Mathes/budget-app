// src/main/services/funds.service.ts
import type Database from "better-sqlite3";
import type { Fund, FundWithTotals } from "../../shared/types/fund";
import { withTx } from "./common";
import { FundsRepo } from "../db/repos/funds.repo";
import { mapFundWithTotals } from "../db/mappers/funds.mapper";

export class FundsService {
  constructor(
    private readonly db: Database.Database,
    private readonly repo: FundsRepo
  ) {}

  list(): Fund[] {
    return this.repo.list();
  }

  listWithTotals(): FundWithTotals[] {
    return withTx(this.db, () => this.repo.listWithTotalsRows().map(mapFundWithTotals));
  }

  upsert(input: Fund): Fund {
    return withTx(this.db, () => this.repo.upsert(input));
  }

  delete(fundId: string): void {
    return withTx(this.db, () => this.repo.delete(fundId));
  }
}
