import { randomInt } from "node:crypto";

export const BASE62_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export type RandomIntFn = (maxExclusive: number) => number;

/**
 * Generates a random Base62 slug. Uses crypto.randomInt by default for
 * unbiased, unguessable output; the RNG is injectable so tests can be
 * deterministic.
 */
export function generateBase62Slug(
  length: number,
  rng: RandomIntFn = randomInt
): string {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error(`Slug length must be a positive integer, got ${length}`);
  }

  let slug = "";
  for (let i = 0; i < length; i += 1) {
    slug += BASE62_ALPHABET.charAt(rng(BASE62_ALPHABET.length));
  }
  return slug;
}
