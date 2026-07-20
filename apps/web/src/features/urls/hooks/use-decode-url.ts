"use client";

import { useMutation } from "@tanstack/react-query";
import { decodeUrl } from "../api";

/* Modeled as a mutation although it reads: decodes are imperative one-off
 * lookups with no cache worth maintaining. */
export function useDecodeUrl() {
  return useMutation({ mutationFn: decodeUrl });
}
