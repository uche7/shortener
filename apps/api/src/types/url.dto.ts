export interface UrlDto {
  shortPath: string;
  shortUrl: string;
  longUrl: string;
  createdAt: string;
  visitCount: number;
  firstVisitedAt: string | null;
  lastVisitedAt: string | null;
}

export interface UrlListDto {
  urls: UrlDto[];
  total: number;
}

export interface UrlStatsDto extends UrlDto {
  longUrlDomain: string;
  ageInDays: number;
  averageVisitsPerDay: number;
  hasBeenVisited: boolean;
  daysSinceLastVisit: number | null;
}
