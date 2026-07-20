"use client";

import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import type { UrlDto } from "@/types/api";
import { CopyIconButton } from "./copy-icon-button";
import { UrlStatsDialog } from "./url-stats-dialog";

export function UrlListTable({ urls }: { urls: UrlDto[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Short link</TableHead>
            <TableHead>Original URL</TableHead>
            <TableHead className="text-center">Visits</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last visit</TableHead>
            <TableHead className="w-24" aria-label="Actions" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {urls.map((url) => (
            <TableRow key={url.shortPath}>
              <TableCell>
                <a
                  href={url.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono font-medium text-primary hover:underline"
                >
                  /{url.shortPath}
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              </TableCell>
              <TableCell className="max-w-72">
                <span className="block truncate" title={url.longUrl}>
                  {url.longUrl}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={url.visitCount > 0 ? "default" : "secondary"}>
                  {url.visitCount}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatDateTime(url.createdAt)}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {url.lastVisitedAt
                  ? formatDateTime(url.lastVisitedAt)
                  : "Never"}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-0.5">
                  <UrlStatsDialog url={url} />
                  <CopyIconButton text={url.shortUrl} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
