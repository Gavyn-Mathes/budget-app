// src/shared/domain/money.ts

/**
 * Parses common user inputs like:
 * "$2,500.50", "2500.50", "  2500 ", "-10"
 */
export function parseMoney(input: string): number {
  const cleaned = input.replace(/[^0-9.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function formatMoney(amount: number): string {
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}