import type { Metadata } from "next";
import { UrlDecoder } from "@/features/urls/components/url-decoder";

export const metadata: Metadata = {
  title: "Decode",
};

export default function DecodePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Decode a short link
        </h1>
        <p className="text-sm text-muted-foreground">
          Paste a ShortLink URL or just its path to see where it leads before
          you visit it.
        </p>
      </div>
      <UrlDecoder />
    </div>
  );
}
