export interface UrlDto {
  shortPath: string;
  shortUrl: string;
  longUrl: string;
  createdAt: string;
  visitCount: number;
  firstVisitedAt: string | null;
  lastVisitedAt: string | null;
}
