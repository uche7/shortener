import { BarChart3, Link2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UrlShortener } from "@/features/urls/components/url-shortener";

const highlights = [
  { icon: Link2, label: "Instant short links" },
  { icon: BarChart3, label: "Visit analytics" },
  { icon: Search, label: "Searchable history" },
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      <section className="flex flex-col items-center gap-6 py-20 text-center">
        <Badge variant="secondary">Free · No sign-up · Open API</Badge>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Shorten long URLs. Track every visit.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Paste a link and get a short URL you can share anywhere with creation
          history, search and per-link analytics built in.
        </p>
        <UrlShortener />
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {highlights.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon className="size-4" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
