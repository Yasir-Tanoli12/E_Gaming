export const AUTH_EXPIRED_EVENT = "app:auth-expired";
const REQUEST_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? 15000);
const LOCAL_DEV_API_URL = "http://localhost:3001";

function resolveApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Missing NEXT_PUBLIC_API_URL in production. Set it in your frontend deployment environment and rebuild."
    );
  }

  return LOCAL_DEV_API_URL;
}

const API_BASE_URL = resolveApiBaseUrl();

export const getApiBaseUrl = () => API_BASE_URL;

/**
 * Auth uses httpOnly cookies - no client-side token storage.
 * credentials: 'include' sends cookies automatically.
 */
export function getAuthHeaders(): HeadersInit {
  return {};
}

export class ApiError extends Error {
  status: number;
  payload: unknown;
  isNetworkError: boolean;

  constructor(
    message: string,
    status = 0,
    payload: unknown = null,
    isNetworkError = false
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
    this.isNetworkError = isNetworkError;
  }
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  const message = error instanceof Error ? error.message : "Network request failed";
  return new ApiError(message, 0, null, true);
}

async function parsePayload(res: Response): Promise<unknown> {
  const text = await res.text().catch(() => "");
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof (payload as { message?: unknown }).message === "string"
  ) {
    return (payload as { message: string }).message;
  }
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    Array.isArray((payload as { message?: unknown }).message)
  ) {
    return (payload as { message: string[] }).message.join(", ");
  }
  return fallback;
}

function dispatchAuthExpired(path: string) {
  if (typeof window === "undefined") return;
  if (path.startsWith("/auth/login")) return;
  if (path.startsWith("/admin/verify-otp")) return;
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
}

async function handleResponse<T>(res: Response, path: string): Promise<T> {
  const data = await parsePayload(res);
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      dispatchAuthExpired(path);
    }
    throw new ApiError(
      getErrorMessage(data, `Request failed with status ${res.status}`),
      res.status,
      data
    );
  }
  return data as T;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };
  const method = (options.method ?? "GET").toUpperCase();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
      cache: method === "GET" ? "no-store" : options.cache,
      signal: options.signal ?? controller.signal,
    });
    return await handleResponse<T>(res, path);
  } catch (error) {
    throw toApiError(error);
  } finally {
    clearTimeout(timeout);
  }
}

export async function apiFormRequest<T>(
  path: string,
  method: "POST" | "PATCH" | "PUT",
  formData: FormData
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      credentials: "include",
      body: formData,
      signal: controller.signal,
    });
    return await handleResponse<T>(res, path);
  } catch (error) {
    throw toApiError(error);
  } finally {
    clearTimeout(timeout);
  }
}
