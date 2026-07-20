"use client";

import { useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useUrlList } from "../hooks/use-url-list";
import { UrlListTable } from "./url-list-table";
import { UrlListEmpty, UrlListError, UrlListSkeleton } from "./url-list-states";
import { UrlSearchInput } from "./url-search-input";

export function UrlList() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const { data, isPending, isError, refetch, activeSearch } =
    useUrlList(debouncedSearch);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <UrlSearchInput value={search} onChange={setSearch} />
        {data && (
          <p className="text-sm text-muted-foreground">
            {data.total} {data.total === 1 ? "link" : "links"}
          </p>
        )}
      </div>

      {isPending ? (
        <UrlListSkeleton />
      ) : isError ? (
        <UrlListError onRetry={() => refetch()} />
      ) : data.total === 0 ? (
        <UrlListEmpty search={activeSearch} />
      ) : (
        <UrlListTable urls={data.urls} />
      )}
    </div>
  );
}
