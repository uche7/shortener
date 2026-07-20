import { z } from "zod";

/* Mirrors apps/api/src/validators/encode.validator.ts (the source of truth)
 * so most invalid input is caught before a network round-trip. */
export const MAX_URL_LENGTH = 2048;
export const MIN_SEARCH_LENGTH = 3;

function isHttpUrl(value: string): boolean {
  try {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export const decodeFormSchema = z.object({
  shortUrl: z.string().trim().min(1, "Paste a short URL to decode"),
});

export type DecodeFormValues = z.infer<typeof decodeFormSchema>;

export const encodeFormSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Paste a URL to shorten")
    .max(MAX_URL_LENGTH, `URLs can be at most ${MAX_URL_LENGTH} characters`)
    .refine(isHttpUrl, "Enter a valid http(s) URL, e.g. https://example.com"),
});

export type EncodeFormValues = z.infer<typeof encodeFormSchema>;
