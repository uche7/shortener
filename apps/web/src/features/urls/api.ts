import { apiClient, type ApiResult } from "@/lib/api-client";
import type { UrlDto, UrlListDto } from "@/types/api";

export function encodeUrl(url: string): Promise<ApiResult<UrlDto>> {
  return apiClient.post<UrlDto>("/api/encode", { url });
}

export function fetchUrls(search?: string): Promise<ApiResult<UrlListDto>> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiClient.get<UrlListDto>(`/api/list${query}`);
}
