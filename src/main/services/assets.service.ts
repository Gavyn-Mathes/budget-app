// src/main/services/assets.service.ts

import type Database from "better-sqlite3";
import type { Asset, AssetUpsertInput, AssetWithBalance } from "../../shared/types/asset";
import { withTx } from "./common";
import { AssetsRepo } from "../db/repos/assets.repo";

export class AssetsService {
  constructor(
    private readonly db: Database.Database,
    private readonly repo: AssetsRepo
  ) {}

  list(): Asset[] {
    return this.repo.list();
  }

  listWithBalances(): AssetWithBalance[] {
    return this.repo.listWithBalances();
  }

  listByFund(fundId: string): Asset[] {
    return this.repo.listByFund(fundId);
  }

  getById(assetId: string): Asset | null {
    return this.repo.getById(assetId);
  }

  upsert(input: AssetUpsertInput): Asset {
    return withTx(this.db, () => this.repo.upsert(input));
  }

  delete(assetId: string): void {
    return withTx(this.db, () => this.repo.delete(assetId));
  }
}
