"use client";

import { useState } from "react";
import type { ApiResult } from "@/lib/api-client";
import type { UrlDto } from "@/types/api";
import { DecodedUrlResult } from "./decoded-url-result";
import { UrlDecoderForm } from "./url-decoder-form";

export function UrlDecoder() {
  const [result, setResult] = useState<ApiResult<UrlDto> | null>(null);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <UrlDecoderForm onSuccess={setResult} />
      {result && <DecodedUrlResult result={result} />}
    </div>
  );
}
