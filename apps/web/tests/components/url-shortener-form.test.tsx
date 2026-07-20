import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UrlShortenerForm } from "@/features/urls/components/url-shortener-form";
import type { ApiResult } from "@/lib/api-client";
import type { UrlDto } from "@/types/api";

vi.mock("@/features/urls/api", () => ({
  encodeUrl: vi.fn(),
}));

import { encodeUrl } from "@/features/urls/api";

const encodeUrlMock = vi.mocked(encodeUrl);

function successResult(): ApiResult<UrlDto> {
  return {
    status: 201,
    message: "Short URL created",
    data: {
      shortPath: "GeAi9K",
      shortUrl: "http://localhost:4000/GeAi9K",
      longUrl: "https://indicina.co",
      createdAt: "2026-07-20T09:00:00.000Z",
      visitCount: 0,
      firstVisitedAt: null,
      lastVisitedAt: null,
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
  render(<UrlShortenerForm onSuccess={onSuccess} />, { wrapper });
  return { onSuccess };
}

describe("UrlShortenerForm", () => {
  beforeEach(() => {
    encodeUrlMock.mockReset();
  });

  it("shows an inline error and sends nothing for an invalid URL", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/url to shorten/i), "not-a-url");
    await user.click(screen.getByRole("button", { name: /shorten url/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /valid http\(s\) URL/i
    );
    expect(encodeUrlMock).not.toHaveBeenCalled();
  });

  it("submits a valid URL, reports the result and resets the field", async () => {
    const user = userEvent.setup();
    encodeUrlMock.mockResolvedValue(successResult());
    const { onSuccess } = renderForm();

    const input = screen.getByLabelText(/url to shorten/i);
    await user.type(input, "https://indicina.co");
    await user.click(screen.getByRole("button", { name: /shorten url/i }));

    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ status: 201 })
      )
    );
    expect(encodeUrlMock.mock.calls[0]?.[0]).toBe("https://indicina.co");
    expect(input).toHaveValue("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("keeps the entered URL when the API rejects it", async () => {
    const user = userEvent.setup();
    encodeUrlMock.mockRejectedValue(new Error("Invalid request body"));
    const { onSuccess } = renderForm();

    const input = screen.getByLabelText(/url to shorten/i);
    await user.type(input, "https://indicina.co");
    await user.click(screen.getByRole("button", { name: /shorten url/i }));

    await waitFor(() => expect(encodeUrlMock).toHaveBeenCalled());
    expect(onSuccess).not.toHaveBeenCalled();
    expect(input).toHaveValue("https://indicina.co");
  });
});
