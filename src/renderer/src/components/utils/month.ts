// renderer/src/components/utils/month.ts
export function monthKeyFromIsoDate(date: string) {
  return String(date).slice(0, 7);
}

export function defaultDateForMonth(monthKey: string) {
  return `${monthKey}-01`;
}

export function isValidMonthKey(monthKey: string): boolean {
  if (!/^\d{4}-\d{2}$/.test(monthKey)) return false;
  const mm = Number(monthKey.slice(5, 7));
  return mm >= 1 && mm <= 12;
}

export function currentMonthKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export function yyyyMmDd(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function firstOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function lastOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}