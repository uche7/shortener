"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiResult } from "@/lib/api-client";
import type { UrlDto } from "@/types/api";
import { useEncodeUrl } from "../hooks/use-encode-url";
import { encodeFormSchema, type EncodeFormValues } from "../validation";

interface UrlShortenerFormProps {
  onSuccess: (result: ApiResult<UrlDto>) => void;
}

export function UrlShortenerForm({ onSuccess }: UrlShortenerFormProps) {
  const encode = useEncodeUrl();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EncodeFormValues>({
    resolver: zodResolver(encodeFormSchema),
    defaultValues: { url: "" },
  });

  const onSubmit = handleSubmit(({ url }) => {
    encode.mutate(url, {
      onSuccess: (result) => {
        toast.success(result.message);
        onSuccess(result);
        reset();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  });

  const urlError = errors.url?.message;

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <Label htmlFor="url" className="sr-only">
        URL to shorten
      </Label>
      <div className="flex w-full flex-col gap-2 sm:flex-row">
        <Input
          id="url"
          type="url"
          placeholder="https://example.com/very/long/link"
          autoComplete="off"
          aria-invalid={urlError ? true : undefined}
          aria-describedby={urlError ? "url-error" : undefined}
          disabled={encode.isPending}
          className="h-11 flex-1 text-base"
          {...register("url")}
        />
        <Button
          type="submit"
          size="lg"
          className="h-11"
          disabled={encode.isPending}
        >
          {encode.isPending && (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          )}
          {encode.isPending ? "Shortening…" : "Shorten URL"}
        </Button>
      </div>
      {urlError && (
        <p
          id="url-error"
          role="alert"
          className="mt-2 text-sm text-destructive"
        >
          {urlError}
        </p>
      )}
    </form>
  );
}
