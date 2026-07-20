"use client";

import { useQuery } from "@tanstack/react-query";
import { urlKeys } from "@/lib/query-keys";
import { fetchUrlStats } from "../api";
import { LIVE_REFRESH_INTERVAL_MS } from "../constants";

/**
 * `enabled` gates fetching until the stats dialog is actually opened; it also
 * stops the live-refresh interval while the dialog is closed.
 */
export function useUrlStats(shortPath: string, enabled: boolean) {
  return useQuery({
    queryKey: urlKeys.stats(shortPath),
    queryFn: () => fetchUrlStats(shortPath),
    select: (result) => result.data,
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: LIVE_REFRESH_INTERVAL_MS,
  });
}
