// shared/schemas/common.ts
import { z } from "zod";
import { MONTH_KEY_RE, ISO_DATE_RE, isValidIsoDate, isValidMonthKey } from "../constants/month";

export const MonthKeySchema = z
  .string()
  .regex(MONTH_KEY_RE, "Expected YYYY-MM")
  .refine(isValidMonthKey, { message: "Month must be between 01 and 12" });
export const IsoDateSchema = z
  .string()
  .regex(ISO_DATE_RE, "Expected YYYY-MM-DD")
  .refine(isValidIsoDate, { message: "Expected a real calendar date (YYYY-MM-DD)" });

export const MoneySchema = z.number().finite().int(); // add .nonnegative() where needed
export const IdSchema = z.string().min(1);

export const CurrencyCodeSchema = z
  .string()
  .regex(/^[A-Z]{3}$/, "Expected 3 uppercase letters (e.g. USD)");

// ISO timestamp (parseable by Date.parse)
export const IsoTimestampSchema = z
  .string()
  .min(1)
  .refine((v) => !Number.isNaN(Date.parse(v)), {
    message: "Expected ISO timestamp",
});
