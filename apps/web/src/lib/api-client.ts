import type { ApiEnvelope } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Envelope message and status are preserved so the UI can surface them. */
export interface ApiResult<T> {
  data: T;
  message: string;
  status: number;
}

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("Could not reach the API. Is the server running?", 0);
  }

  const envelope = (await response
    .json()
    .catch(() => null)) as ApiEnvelope<T> | null;

  if (envelope === null) {
    throw new ApiError("Unexpected response from the API", response.status);
  }
  if (!envelope.success) {
    throw new ApiError(envelope.message, response.status, envelope.error);
  }

  return {
    data: envelope.data,
    message: envelope.message,
    status: response.status,
  };
}

export const apiClient = {
  get<T>(path: string): Promise<ApiResult<T>> {
    return request<T>(path);
  },
  post<T>(path: string, body: unknown): Promise<ApiResult<T>> {
    return request<T>(path, { method: "POST", body: JSON.stringify(body) });
  },
};
