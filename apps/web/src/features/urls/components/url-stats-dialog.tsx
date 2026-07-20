"use client";

import { BarChart3, RotateCw } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompactNumber, formatDateTime } from "@/lib/format";
import type { UrlDto, UrlStatsDto } from "@/types/api";
import { useUrlStats } from "../hooks/use-url-stats";

export function UrlStatsDialog({ url }: { url: UrlDto }) {
  const [open, setOpen] = useState(false);
  const stats = useUrlStats(url.shortPath, open);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Statistics for /${url.shortPath}`}
        >
          <BarChart3 className="size-4" aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono">/{url.shortPath}</DialogTitle>
          <DialogDescription className="truncate" title={url.longUrl}>
            {url.longUrl}
          </DialogDescription>
        </DialogHeader>

        {stats.isPending ? (
          <StatsSkeleton />
        ) : stats.isError ? (
          <StatsError onRetry={() => stats.refetch()} />
        ) : (
          <StatsBody stats={stats.data} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatsBody({ stats }: { stats: UrlStatsDto }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <StatTile
          label="Total visits"
          value={formatCompactNumber(stats.visitCount)}
        />
        <StatTile
          label="Avg visits per day"
          value={formatCompactNumber(stats.averageVisitsPerDay)}
        />
        <StatTile
          label="Days active"
          value={formatCompactNumber(stats.ageInDays)}
        />
        <StatTile
          label="Days since last visit"
          value={
            stats.daysSinceLastVisit === null
              ? "—"
              : formatCompactNumber(stats.daysSinceLastVisit)
          }
        />
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <DetailRow label="Status">
          <Badge variant={stats.hasBeenVisited ? "default" : "secondary"}>
            {stats.hasBeenVisited ? "Visited" : "Never visited"}
          </Badge>
        </DetailRow>
        <DetailRow label="Destination">{stats.longUrlDomain}</DetailRow>
        <DetailRow label="Created">{formatDateTime(stats.createdAt)}</DetailRow>
        <DetailRow label="First visit">
          {stats.firstVisitedAt ? formatDateTime(stats.firstVisitedAt) : "—"}
        </DetailRow>
        <DetailRow label="Last visit">
          {stats.lastVisitedAt ? formatDateTime(stats.lastVisitedAt) : "—"}
        </DetailRow>
      </dl>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate">{children}</dd>
    </>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  );
}

function StatsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <p className="text-sm text-muted-foreground">
        Could not load statistics for this link.
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RotateCw className="size-4" aria-hidden />
        Try again
      </Button>
    </div>
  );
}
