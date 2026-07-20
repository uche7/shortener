"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MIN_SEARCH_LENGTH } from "../validation";

interface UrlSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function UrlSearchInput({ value, onChange }: UrlSearchInputProps) {
  const tooShort =
    value.trim().length > 0 && value.trim().length < MIN_SEARCH_LENGTH;

  return (
    <div className="w-full sm:max-w-sm">
      <Label htmlFor="url-search" className="sr-only">
        Search your links
      </Label>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id="url-search"
          type="search"
          placeholder="Search by original URL…"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pl-9"
        />
      </div>
      <p
        className="mt-1.5 min-h-5 text-xs text-muted-foreground"
        aria-live="polite"
      >
        {tooShort
          ? `Keep typing — search needs at least ${MIN_SEARCH_LENGTH} characters`
          : ""}
      </p>
    </div>
  );
}
