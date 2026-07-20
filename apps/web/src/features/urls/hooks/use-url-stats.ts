"use client";

import { useQuery } from "@tanstack/react-query";
import { urlKeys } from "@/lib/query-keys";
import { fetchUrlStats } from "../api";

/** `enabled` gates fetching until the stats dialog is actually opened. */
export function useUrlStats(shortPath: string, enabled: boolean) {
  return useQuery({
    queryKey: urlKeys.stats(shortPath),
    queryFn: () => fetchUrlStats(shortPath),
    select: (result) => result.data,
    enabled,
  });
}
