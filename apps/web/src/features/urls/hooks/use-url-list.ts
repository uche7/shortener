"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { urlKeys } from "@/lib/query-keys";
import { fetchUrls } from "../api";
import { LIVE_REFRESH_INTERVAL_MS } from "../constants";
import { MIN_SEARCH_LENGTH } from "../validation";

/** Below the minimum search length the unfiltered list is queried instead. */
export function useUrlList(search: string) {
  const trimmed = search.trim();
  const activeSearch =
    trimmed.length >= MIN_SEARCH_LENGTH ? trimmed : undefined;

  /* staleTime 0 overrides the provider default (30s), which would otherwise
   * suppress the focus refetch right after a short link was clicked. */
  const query = useQuery({
    queryKey: urlKeys.list(activeSearch),
    queryFn: () => fetchUrls(activeSearch),
    select: (result) => result.data,
    placeholderData: keepPreviousData,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: LIVE_REFRESH_INTERVAL_MS,
  });

  return { ...query, activeSearch };
}
