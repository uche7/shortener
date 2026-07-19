import { z } from "zod";
import { MAX_URL_LENGTH } from "../constants/url";

const ALLOWED_PROTOCOLS = ["http:", "https:"];

function isHttpUrl(value: string): boolean {
  try {
    return ALLOWED_PROTOCOLS.includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export const encodeRequestSchema = z.object({
  url: z
    .string({ error: "url is required and must be a string" })
    .trim()
    .min(1, "url must not be empty")
    .max(MAX_URL_LENGTH, `url must be at most ${MAX_URL_LENGTH} characters`)
    .refine(isHttpUrl, "url must be a valid http(s) URL"),
});

export type EncodeRequestDto = z.infer<typeof encodeRequestSchema>;
