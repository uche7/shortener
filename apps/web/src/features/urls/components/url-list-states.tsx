"use client";

import { Link2, RotateCw, SearchX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function UrlListSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function UrlListError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          Could not load your links. Is the API running?
        </p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw className="size-4" aria-hidden />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}

export function UrlListEmpty({ search }: { search?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        {search ? (
          <>
            <SearchX className="size-8 text-muted-foreground" aria-hidden />
            <p className="font-medium">No matches for “{search}”</p>
            <p className="text-sm text-muted-foreground">
              Try a different part of the original URL.
            </p>
          </>
        ) : (
          <>
            <Link2 className="size-8 text-muted-foreground" aria-hidden />
            <p className="font-medium">No links yet</p>
            <p className="text-sm text-muted-foreground">
              Shorten your first URL and it will show up here.
            </p>
            <Button asChild size="sm">
              <Link href="/">Create a short link</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
