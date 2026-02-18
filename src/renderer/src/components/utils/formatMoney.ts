// src/renderer/src/components/utils/formatMoney.ts
import type { Money } from "../../../../shared/types/common";

export const MONEY_DECIMALS = 2;
export const MONEY_SCALE = 10 ** MONEY_DECIMALS;
export const MONEY_ZERO_INPUT = "0.00";

export function moneyFromMinor(minor: number): Money {
  if (!Number.isInteger(minor)) throw new Error("Money minor must be integer");
  return minor as Money;
}

export function moneyToMinor(m: Money): number {
  return m as number;
}

/**
 * Format a Money (minor units) to a localized currency string.
 */
export function formatMoney(m: Money, currency: string = "USD") {
  const minor = moneyToMinor(m);
  const amountMajor = minor / MONEY_SCALE;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: MONEY_DECIMALS,
      maximumFractionDigits: MONEY_DECIMALS,
    }).format(amountMajor);
  } catch {
    const sign = amountMajor < 0 ? "-" : "";
    const abs = Math.abs(amountMajor);
    return `${sign}$${abs.toFixed(MONEY_DECIMALS)}`;
  }
}

/**
 * Convert Money (minor units) to a string suitable for an <input /> value, e.g. "12.34"
 */
export function toMoneyInputString(m: Money): string {
  const minor = Math.trunc(moneyToMinor(m));
  const sign = minor < 0 ? "-" : "";
  const abs = Math.abs(minor);

  const whole = Math.floor(abs / MONEY_SCALE);
  const frac = abs % MONEY_SCALE;

  return `${sign}${whole}.${String(frac).padStart(MONEY_DECIMALS, "0")}`;
}

/**
 * Parse a currency-like string (e.g. "12.34", "$1,200.00") to Money (minor units).
 * Throws on invalid input.
 */
export function parseMoney(input: string): Money {
  const s = input.trim();
  if (!s) throw new Error("Empty money");

  const normalized = s.replace(/[$,]/g, "");
  const negative = normalized.startsWith("-");
  const t = negative ? normalized.slice(1) : normalized;

  // allow "123", "123.", "123.4", ".45"
  if (!/^\d*(\.\d*)?$/.test(t)) {
    throw new Error("Invalid money");
  }

  const [wholeRaw, fracRaw = ""] = t.split(".");
  const whole = wholeRaw.length ? wholeRaw : "0";
  const frac = (fracRaw + "0".repeat(MONEY_DECIMALS)).slice(0, MONEY_DECIMALS);

  const wholeInt = parseInt(whole, 10);
  const fracInt = parseInt(frac || "0", 10);

  const minor = wholeInt * MONEY_SCALE + fracInt;
  return moneyFromMinor(negative ? -minor : minor);
}

/**
 * UI helper for money text inputs:
 * - on focus, clear the default zero value to make typing faster
 * - on blur, restore default zero if left empty
 */
export function moneyInputFocusValue(value: string): string {
  return String(value ?? "").trim() === MONEY_ZERO_INPUT ? "" : value;
}

export function moneyInputBlurValue(value: string): string {
  return String(value ?? "").trim().length === 0 ? MONEY_ZERO_INPUT : value;
}
