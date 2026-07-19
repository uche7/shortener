import { describe, expect, it } from "vitest";
import { BASE62_ALPHABET, generateBase62Slug } from "../../src/utils/base62";

describe("generateBase62Slug", () => {
  it("generates a slug of the requested length", () => {
    expect(generateBase62Slug(6)).toHaveLength(6);
    expect(generateBase62Slug(12)).toHaveLength(12);
  });

  it("only uses characters from the Base62 alphabet", () => {
    const slug = generateBase62Slug(200);
    for (const char of slug) {
      expect(BASE62_ALPHABET).toContain(char);
    }
  });

  it("is deterministic when the RNG is injected", () => {
    const fixedRng = () => 0;
    expect(generateBase62Slug(4, fixedRng)).toBe("0000");

    let calls = 0;
    const sequentialRng = () => calls++;
    expect(generateBase62Slug(3, sequentialRng)).toBe("012");
  });

  it("rejects non-positive or fractional lengths", () => {
    expect(() => generateBase62Slug(0)).toThrow(/positive integer/);
    expect(() => generateBase62Slug(-1)).toThrow(/positive integer/);
    expect(() => generateBase62Slug(2.5)).toThrow(/positive integer/);
  });
});
