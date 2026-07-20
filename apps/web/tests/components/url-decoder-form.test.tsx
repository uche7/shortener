import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UrlDecoderForm } from "@/features/urls/components/url-decoder-form";
import type { ApiResult } from "@/lib/api-client";
import type { UrlDto } from "@/types/api";

vi.mock("@/features/urls/api", () => ({
  decodeUrl: vi.fn(),
}));

import { decodeUrl } from "@/features/urls/api";

const decodeUrlMock = vi.mocked(decodeUrl);

function decodedResult(): ApiResult<UrlDto> {
  return {
    status: 200,
    message: "Short URL decoded",
    data: {
      shortPath: "GeAi9K",
      shortUrl: "http://localhost:4000/GeAi9K",
      longUrl: "https://indicina.co",
      createdAt: "2026-07-20T09:00:00.000Z",
      visitCount: 3,
      firstVisitedAt: "2026-07-20T10:00:00.000Z",
      lastVisitedAt: "2026-07-20T11:00:00.000Z",
    },
  };
}

function renderForm(onSuccess = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  render(<UrlDecoderForm onSuccess={onSuccess} />, { wrapper });
  return { onSuccess };
}

describe("UrlDecoderForm", () => {
  beforeEach(() => {
    decodeUrlMock.mockReset();
  });

  it("shows an inline error and sends nothing when empty", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: /decode/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /paste a short url/i
    );
    expect(decodeUrlMock).not.toHaveBeenCalled();
  });

  it("decodes a short URL and reports the result", async () => {
    const user = userEvent.setup();
    decodeUrlMock.mockResolvedValue(decodedResult());
    const { onSuccess } = renderForm();

    await user.type(
      screen.getByLabelText(/short url to decode/i),
      "http://localhost:4000/GeAi9K"
    );
    await user.click(screen.getByRole("button", { name: /decode/i }));

    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ longUrl: "https://indicina.co" }),
        })
      )
    );
    expect(decodeUrlMock.mock.calls[0]?.[0]).toBe(
      "http://localhost:4000/GeAi9K"
    );
  });

  it("reports nothing on an unknown short URL", async () => {
    const user = userEvent.setup();
    decodeUrlMock.mockRejectedValue(new Error('No URL found for "unKn0w"'));
    const { onSuccess } = renderForm();

    await user.type(screen.getByLabelText(/short url to decode/i), "unKn0w");
    await user.click(screen.getByRole("button", { name: /decode/i }));

    await waitFor(() => expect(decodeUrlMock).toHaveBeenCalled());
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
