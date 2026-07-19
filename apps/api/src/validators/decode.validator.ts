import { z } from "zod";
import { SHORT_PATH_PATTERN } from "../constants/url";

/** Accepts a bare slug ("GeAi9K", "/GeAi9K") or a full short URL. */
function toShortPath(value: string): string | null {
  const direct = value.replace(/^\/+|\/+$/g, "");
  if (SHORT_PATH_PATTERN.test(direct)) return direct;

  try {
    const fromUrl = new URL(value).pathname.replace(/^\/+|\/+$/g, "");
    return SHORT_PATH_PATTERN.test(fromUrl) ? fromUrl : null;
  } catch {
    return null;
  }
}

export const decodeRequestSchema = z
  .object({
    shortUrl: z
      .string({ error: "shortUrl is required and must be a string" })
      .trim()
      .min(1, "shortUrl must not be empty"),
  })
  .transform(({ shortUrl }, ctx) => {
    const shortPath = toShortPath(shortUrl);
    if (shortPath === null) {
      ctx.addIssue({
        code: "custom",
        path: ["shortUrl"],
        message: "shortUrl must be a short URL or a Base62 short path",
      });
      return z.NEVER;
    }
    return { shortUrl, shortPath };
  });

export type DecodeRequestDto = z.infer<typeof decodeRequestSchema>;
