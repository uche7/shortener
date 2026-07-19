import { apiClient, type ApiResult } from "@/lib/api-client";
import type { UrlDto } from "@/types/api";

export function encodeUrl(url: string): Promise<ApiResult<UrlDto>> {
  return apiClient.post<UrlDto>("/api/encode", { url });
}
