"use client";

import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

export function CopyIconButton({ text }: { text: string }) {
  const { copied, copy } = useCopyToClipboard();

  async function onCopy() {
    const ok = await copy(text);
    if (!ok) toast.error("Could not copy to clipboard");
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onCopy}
      aria-label={`Copy ${text}`}
    >
      {copied ? (
        <Check
          className="size-4 text-green-600 dark:text-green-500"
          aria-hidden
        />
      ) : (
        <Copy className="size-4" aria-hidden />
      )}
    </Button>
  );
}
