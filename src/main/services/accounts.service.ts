// src/main/services/accounts.service.ts

import type Database from "better-sqlite3";
import type { Account, AccountUpsertInput, AccountWithTotals } from "../../shared/types/account";
import { withTx } from "./common";
import { AccountsRepo } from "../db/repos/accounts.repo";
import { mapAccountWithTotals } from "../db/mappers/accounts.mapper";

export class AccountsService {
  constructor(
    private readonly db: Database.Database,
    private readonly repo: AccountsRepo
  ) {}

  list(): Account[] {
    return this.repo.list();
  }

  listWithTotals(): AccountWithTotals[] {
    return withTx(this.db, () => this.repo.listWithTotalsRows().map(mapAccountWithTotals));
  }

  upsert(input: AccountUpsertInput): Account {
    return withTx(this.db, () => this.repo.upsert(input));
  }

  delete(accountId: string): void {
    return withTx(this.db, () => this.repo.delete(accountId));
  }
}
