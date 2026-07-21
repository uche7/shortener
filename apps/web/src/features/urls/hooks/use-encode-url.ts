"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { encodeUrl } from "../api";
import { urlKeys } from "@/lib/query-keys";

export function useEncodeUrl() {
  const queryClient = useQueryClient();

  /* Only list views are affected by a new URL; scoping the invalidation
   * this way avoids refetching an unrelated open stats dialog. */
  return useMutation({
    mutationFn: encodeUrl,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: urlKeys.lists() }),
  });
}
