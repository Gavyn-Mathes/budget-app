// main/db/mappers/common.ts
import crypto from "crypto";

export type ISODate = string;
export type ID = string;

export function nowIso(): ISODate {
  return new Date().toISOString();
}

export function newId(): ID {
  return crypto.randomUUID();
}

export function assertChanges(result: { changes: number }, msg: string): void {
  if (!result || result.changes !== 1) throw new Error(msg);
}
