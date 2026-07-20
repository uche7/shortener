import { apiClient, type ApiResult } from "@/lib/api-client";
import type { UrlDto, UrlListDto, UrlStatsDto } from "@/types/api";

export function encodeUrl(url: string): Promise<ApiResult<UrlDto>> {
  return apiClient.post<UrlDto>("/api/encode", { url });
}

export function decodeUrl(shortUrl: string): Promise<ApiResult<UrlDto>> {
  return apiClient.post<UrlDto>("/api/decode", { shortUrl });
}

export function fetchUrls(search?: string): Promise<ApiResult<UrlListDto>> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiClient.get<UrlListDto>(`/api/list${query}`);
}

export function fetchUrlStats(
  shortPath: string
): Promise<ApiResult<UrlStatsDto>> {
  return apiClient.get<UrlStatsDto>(`/api/statistic/${shortPath}`);
}
