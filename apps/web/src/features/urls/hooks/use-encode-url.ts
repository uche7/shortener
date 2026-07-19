"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { encodeUrl } from "../api";
import { urlKeys } from "@/lib/query-keys";

export function useEncodeUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: encodeUrl,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: urlKeys.all }),
  });
}
