"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { urlKeys } from "@/lib/query-keys";
import { fetchUrls } from "../api";
import { MIN_SEARCH_LENGTH } from "../validation";

/** Below the minimum search length the unfiltered list is queried instead. */
export function useUrlList(search: string) {
  const trimmed = search.trim();
  const activeSearch =
    trimmed.length >= MIN_SEARCH_LENGTH ? trimmed : undefined;

  const query = useQuery({
    queryKey: urlKeys.list(activeSearch),
    queryFn: () => fetchUrls(activeSearch),
    select: (result) => result.data,
    placeholderData: keepPreviousData,
  });

  return { ...query, activeSearch };
}
