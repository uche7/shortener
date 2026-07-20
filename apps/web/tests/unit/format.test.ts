import { describe, expect, it } from "vitest";
import { formatCompactNumber, formatDateTime } from "@/lib/format";

describe("formatCompactNumber", () => {
  it("groups values below ten thousand", () => {
    expect(formatCompactNumber(0)).toBe("0");
    expect(formatCompactNumber(1284)).toBe("1,284");
    expect(formatCompactNumber(9999)).toBe("9,999");
  });

  it("compacts values from ten thousand upward", () => {
    expect(formatCompactNumber(12930)).toBe("12.9K");
    expect(formatCompactNumber(4_200_000)).toBe("4.2M");
  });
});

describe("formatDateTime", () => {
  it("renders a medium date with time", () => {
    const formatted = formatDateTime("2026-07-20T12:00:00Z");
    expect(formatted).toContain("2026");
    expect(formatted).toMatch(/\d{1,2}:\d{2}/);
  });
});
