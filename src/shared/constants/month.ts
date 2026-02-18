// shared/constants/month.ts
export const MONTH_KEY_RE = /^\d{4}-\d{2}$/;
export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/; // "YYYY-MM-DD"

export function isValidMonthKey(value: string): boolean {
  const input = String(value ?? "").trim();
  if (!MONTH_KEY_RE.test(input)) return false;

  const month = Number(input.slice(5, 7));
  return Number.isInteger(month) && month >= 1 && month <= 12;
}

export function isValidIsoDate(value: string): boolean {
  const input = String(value ?? "").trim();
  if (!ISO_DATE_RE.test(input)) return false;

  const year = Number(input.slice(0, 4));
  const month = Number(input.slice(5, 7));
  const day = Number(input.slice(8, 10));

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }

  if (month < 1 || month > 12 || day < 1) return false;
  return day <= daysInMonth(year, month);
}

function daysInMonth(year: number, month: number): number {
  switch (month) {
    case 2:
      return isLeapYear(year) ? 29 : 28;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    default:
      return 31;
  }
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
