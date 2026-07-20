const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDateTime(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

const groupedFormatter = new Intl.NumberFormat(undefined);
const compactFormatter = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** 1284 → "1,284", 12930 → "12.9K" — grouped below 10k, compact above. */
export function formatCompactNumber(value: number): string {
  return value < 10_000
    ? groupedFormatter.format(value)
    : compactFormatter.format(value);
}
