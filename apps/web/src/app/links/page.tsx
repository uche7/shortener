import type { Metadata } from "next";
import { UrlList } from "@/features/urls/components/url-list";

export const metadata: Metadata = {
  title: "Your links",
};

export default function LinksPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Your links</h1>
        <p className="text-sm text-muted-foreground">
          Every short link you have created, with visits and history.
        </p>
      </div>
      <UrlList />
    </div>
  );
}
