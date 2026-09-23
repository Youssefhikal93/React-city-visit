import type { VisitDatePrecision } from "../types";

function monthStart(date: Date | string): Date {
  if (date instanceof Date)
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));

  const parsedDate = new Date(date);
  return new Date(Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), 1));
}

export function serializeVisitDate(
  date: Date | string | null | undefined,
  precision: VisitDatePrecision,
): string {
  const selectedDate = date ?? new Date();
  return precision === "month"
    ? monthStart(selectedDate).toISOString()
    : selectedDate instanceof Date
      ? selectedDate.toISOString()
      : new Date(selectedDate).toISOString();
}

export function visitDateForPicker(
  date: string | null,
  precision: VisitDatePrecision,
): Date | null {
  if (!date) return null;

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return null;

  if (precision === "month") {
    return new Date(
      parsedDate.getUTCFullYear(),
      parsedDate.getUTCMonth(),
      1,
    );
  }

  return parsedDate;
}

export function isValidVisitDate(date: Date | null): date is Date {
  return date !== null && !Number.isNaN(date.getTime());
}

export function formatVisitDate(
  date: string,
  precision: VisitDatePrecision,
  fullDateFormat: Intl.DateTimeFormatOptions,
): string {
  if (precision === "month") {
    const month = fullDateFormat.month === "short" ? "short" : "long";
    return new Intl.DateTimeFormat("en", { month, year: "numeric", timeZone: "UTC" }).format(new Date(date));
  }

  return new Intl.DateTimeFormat("en", fullDateFormat).format(new Date(date));
}
