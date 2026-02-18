// src/main/services/account_types.service.ts

import type Database from "better-sqlite3";
import type { AccountType } from "../../shared/types/account_type";
import { withTx } from "./common";
import { AccountTypesRepo } from "../db/repos/account_types.repo";

export class AccountTypesService {
  constructor(
    private readonly db: Database.Database,
    private readonly repo: AccountTypesRepo
  ) {}

  // matches "List" -> lowerFirst("List") === "list"
  list(): AccountType[] {
    return this.repo.list();
  }

  // matches "Upsert" -> "upsert"
  upsert(input: AccountType): AccountType {
    return withTx(this.db, () => this.repo.upsert(input));
  }

  // matches "Delete" -> "delete"
  delete(accountTypeId: string): void {
    return withTx(this.db, () => this.repo.delete(accountTypeId));
  }
}
