import { z } from "zod";
import { MIN_SEARCH_LENGTH } from "../constants/url";

/** An empty ?search= is treated as "no filter", not as a too-short query. */
const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

export const listQuerySchema = z.object({
  search: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .min(
        MIN_SEARCH_LENGTH,
        `search must be at least ${MIN_SEARCH_LENGTH} characters`
      )
      .optional()
  ),
});

export type ListQueryDto = z.infer<typeof listQuerySchema>;
