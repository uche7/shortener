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
import { useDecodeUrl } from "../hooks/use-decode-url";
import { decodeFormSchema, type DecodeFormValues } from "../validation";

interface UrlDecoderFormProps {
  onSuccess: (result: ApiResult<UrlDto>) => void;
}

export function UrlDecoderForm({ onSuccess }: UrlDecoderFormProps) {
  const decode = useDecodeUrl();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DecodeFormValues>({
    resolver: zodResolver(decodeFormSchema),
    defaultValues: { shortUrl: "" },
  });

  const onSubmit = handleSubmit(({ shortUrl }) => {
    decode.mutate(shortUrl, {
      onSuccess: (result) => onSuccess(result),
      onError: (error) => toast.error(error.message),
    });
  });

  const shortUrlError = errors.shortUrl?.message;

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <Label htmlFor="short-url" className="sr-only">
        Short URL to decode
      </Label>
      <div className="flex w-full flex-col gap-2 sm:flex-row">
        <Input
          id="short-url"
          type="text"
          placeholder="http://localhost:4000/GeAi9K"
          autoComplete="off"
          aria-invalid={shortUrlError ? true : undefined}
          aria-describedby={shortUrlError ? "short-url-error" : undefined}
          disabled={decode.isPending}
          className="h-11 flex-1 font-mono text-base"
          {...register("shortUrl")}
        />
        <Button
          type="submit"
          size="lg"
          className="h-11"
          disabled={decode.isPending}
        >
          {decode.isPending && (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          )}
          {decode.isPending ? "Decoding…" : "Decode"}
        </Button>
      </div>
      {shortUrlError && (
        <p
          id="short-url-error"
          role="alert"
          className="mt-2 text-sm text-destructive"
        >
          {shortUrlError}
        </p>
      )}
    </form>
  );
}
