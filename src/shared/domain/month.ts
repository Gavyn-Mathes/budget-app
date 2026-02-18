// shared/domain/month.ts
import type { MonthKey } from "../types/common";

export function prevMonthKey(monthKey: MonthKey): MonthKey {
  const [yStr, mStr] = monthKey.split("-");
  const y = Number(yStr);
  const m = Number(mStr);

  const mm = m - 1;
  if (mm >= 1) return `${yStr}-${String(mm).padStart(2, "0")}` as MonthKey;

  const prevY = y - 1;
  return `${String(prevY).padStart(4, "0")}-12` as MonthKey;
}

export function monthKeyFromDate(d: Date = new Date()): MonthKey {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${String(y).padStart(4, "0")}-${m}` as MonthKey;
}

export function defaultDateForMonth(monthKey: string) {
  // "YYYY-MM" -> "YYYY-MM-01"
  return `${monthKey}-01`;
}

export function shiftMonthKey(monthKey: MonthKey, deltaMonths: number): MonthKey {
  const [yStr, mStr] = monthKey.split("-");
  let y = Number(yStr);
  let m = Number(mStr);

  let total = (y * 12 + (m - 1)) + deltaMonths; // month index
  y = Math.floor(total / 12);
  m = (total % 12) + 1;

  const yy = String(y).padStart(4, "0");
  const mm = String(m).padStart(2, "0");
  return `${yy}-${mm}` as MonthKey;
}

export function nextMonthKey(monthKey: MonthKey): MonthKey {
  return shiftMonthKey(monthKey, 1);
}

export function rangeMonthKeys(center: MonthKey, back: number, forward: number): MonthKey[] {
  const out: MonthKey[] = [];
  for (let i = -back; i <= forward; i++) out.push(shiftMonthKey(center, i));
  return out;
}

export function monthToRange(monthKey: string): { start: string; endExclusive: string } {
  // monthKey: "YYYY-MM"
  const [yStr, mStr] = monthKey.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
    throw new Error(`Invalid monthKey: ${monthKey}`);
  }
  const start = `${yStr}-${mStr}-01`;

  // compute next month
  let ny = y;
  let nm = m + 1;
  if (nm === 13) {
    nm = 1;
    ny = y + 1;
  }
  const nmStr = String(nm).padStart(2, "0");
  const endExclusive = `${String(ny)}-${nmStr}-01`;
  return { start, endExclusive };
}