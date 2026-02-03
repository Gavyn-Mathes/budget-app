// shared/domain/month
import type { MonthKey } from "../types/common";

export function prevMonthKey(monthKey: MonthKey): MonthKey {
  const [yStr, mStr] = monthKey.split("-");
  const y = Number(yStr);
  const m = Number(mStr);

  const mm = m - 1;
  if (mm >= 1) return `${yStr}-${String(mm).padStart(2, "0")}`;

  const prevY = y - 1;
  return `${String(prevY).padStart(4, "0")}-12`;
}
