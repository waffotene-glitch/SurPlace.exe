import { API_BASE_URL } from "../config/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  token?: string | null;
  body?: unknown;
  timeoutMs?: number;
};

export async function apiRequest<T>(
  path: string,
  { method = "GET", token, body, timeoutMs = 15000 }: RequestOptions = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (requestError) {
    clearTimeout(timeoutId);

    if (requestError instanceof Error && requestError.name === "AbortError") {
      throw new Error("Review submission timed out. Please try again.");
    }

    throw requestError;
  }

  clearTimeout(timeoutId);

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data as T;
}