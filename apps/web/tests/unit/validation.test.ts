import { describe, expect, it } from "vitest";
import { encodeFormSchema, MAX_URL_LENGTH } from "@/features/urls/validation";

function firstError(input: string): string | undefined {
  const result = encodeFormSchema.safeParse({ url: input });
  return result.success ? undefined : result.error.issues[0]?.message;
}

describe("encodeFormSchema", () => {
  it("accepts a valid http(s) URL and trims whitespace", () => {
    const result = encodeFormSchema.safeParse({
      url: "  https://indicina.co  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.url).toBe("https://indicina.co");
    }
  });

  it("rejects an empty value with the friendly message", () => {
    expect(firstError("   ")).toBe("Paste a URL to shorten");
  });

  it.each(["not-a-url", "indicina.co", "ftp://indicina.co"])(
    "rejects %s as not an http(s) URL",
    (input) => {
      expect(firstError(input)).toMatch(/valid http\(s\) URL/);
    }
  );

  it("rejects URLs over the maximum length", () => {
    const tooLong = `https://example.com/${"a".repeat(MAX_URL_LENGTH)}`;
    expect(firstError(tooLong)).toMatch(/at most/);
  });
});
