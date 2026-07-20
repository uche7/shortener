"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { ApiResult } from "@/lib/api-client";
import type { UrlDto } from "@/types/api";

const HTTP_CREATED = 201;

interface ShortUrlResultProps {
  result: ApiResult<UrlDto>;
}

export function ShortUrlResult({ result }: ShortUrlResultProps) {
  const { copied, copy } = useCopyToClipboard();
  const { shortUrl, longUrl } = result.data;
  const isNew = result.status === HTTP_CREATED;

  async function onCopy() {
    const ok = await copy(shortUrl);
    if (!ok) toast.error("Could not copy to clipboard");
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 max-w-full items-center gap-2 font-mono text-lg font-medium text-primary hover:underline"
          >
            <span className="truncate" title={shortUrl}>
              {shortUrl}
            </span>
            <ExternalLink className="size-4 shrink-0" aria-hidden />
          </a>
          <div className="flex items-center gap-2">
            <Badge variant={isNew ? "default" : "secondary"}>
              {isNew ? "New" : "Already existed"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={onCopy}
              aria-label="Copy short URL"
            >
              {copied ? (
                <Check className="size-4" aria-hidden />
              ) : (
                <Copy className="size-4" aria-hidden />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
        <p className="truncate text-sm text-muted-foreground" title={longUrl}>
          {longUrl}
        </p>
      </CardContent>
    </Card>
  );
}
