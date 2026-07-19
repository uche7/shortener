export const urlKeys = {
  all: ["urls"] as const,
  list: (search?: string) => [...urlKeys.all, "list", search ?? ""] as const,
  stats: (shortPath: string) => [...urlKeys.all, "stats", shortPath] as const,
};
