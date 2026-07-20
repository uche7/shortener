/* Locale is pinned so SSR, every client and the test suite render
 * identically; the product copy is English throughout. */
const LOCALE = "en-US";

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDateTime(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

const groupedFormatter = new Intl.NumberFormat(LOCALE);
const compactFormatter = new Intl.NumberFormat(LOCALE, {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** 1284 → "1,284", 12930 → "12.9K" — grouped below 10k, compact above. */
export function formatCompactNumber(value: number): string {
  return value < 10_000
    ? groupedFormatter.format(value)
    : compactFormatter.format(value);
}
