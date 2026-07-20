"use client";

import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ApiResult } from "@/lib/api-client";
import type { UrlDto } from "@/types/api";
import { CopyIconButton } from "./copy-icon-button";

export function DecodedUrlResult({ result }: { result: ApiResult<UrlDto> }) {
  const { longUrl, shortUrl, visitCount } = result.data;

  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">
          This short link points to
        </p>
        <div className="flex items-center justify-between gap-3">
          <a
            href={longUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-0 items-center gap-2 font-medium text-primary hover:underline"
          >
            <span className="truncate" title={longUrl}>
              {longUrl}
            </span>
            <ExternalLink className="size-4 shrink-0" aria-hidden />
          </a>
          <CopyIconButton text={longUrl} />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="truncate font-mono" title={shortUrl}>
            {shortUrl}
          </span>
          <Badge variant="secondary">
            {visitCount} {visitCount === 1 ? "visit" : "visits"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
