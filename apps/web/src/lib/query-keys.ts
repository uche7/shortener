export const urlKeys = {
  all: ["urls"] as const,
  /** Prefix shared by every list query; matches any search variant. */
  lists: () => [...urlKeys.all, "list"] as const,
  list: (search?: string) => [...urlKeys.lists(), search ?? ""] as const,
  stats: (shortPath: string) => [...urlKeys.all, "stats", shortPath] as const,
};
