"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const RESET_AFTER_MS = 2000;

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(
        () => setCopied(false),
        RESET_AFTER_MS
      );
      return true;
    } catch {
      return false;
    }
  }, []);

  return { copied, copy };
}
