const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Auth uses httpOnly cookies - no client-side token storage.
 * credentials: 'include' sends cookies automatically.
 */
export function getAuthHeaders(): HeadersInit {
  return {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof data.message === "string"
        ? data.message
        : Array.isArray(data.message)
          ? data.message.join(", ")
          : "Request failed";
    throw new Error(message);
  }
  return data as T;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };
  const method = (options.method ?? "GET").toUpperCase();
  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
    cache: method === "GET" ? "no-store" : options.cache,
  });
  return handleResponse<T>(res);
}
