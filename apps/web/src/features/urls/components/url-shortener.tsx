"use client";

import { useState } from "react";
import type { ApiResult } from "@/lib/api-client";
import type { UrlDto } from "@/types/api";
import { ShortUrlResult } from "./short-url-result";
import { UrlShortenerForm } from "./url-shortener-form";

export function UrlShortener() {
  const [result, setResult] = useState<ApiResult<UrlDto> | null>(null);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <UrlShortenerForm onSuccess={setResult} />
      {result && <ShortUrlResult result={result} />}
    </div>
  );
}
