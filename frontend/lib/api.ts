export const AUTH_EXPIRED_EVENT = "app:auth-expired";
const REQUEST_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? 15000);
/** Large video uploads over slow links can exceed 2 minutes; override via env if needed. */
const FORM_REQUEST_TIMEOUT_MS = Number(
  process.env.NEXT_PUBLIC_API_FORM_TIMEOUT_MS ?? 1_800_000
);
const LOCAL_DEV_API_URL = "http://localhost:3001";

function resolveApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) {
    let parsed: URL;
    try {
      parsed = new URL(configured);
    } catch {
      throw new Error(
        "Invalid NEXT_PUBLIC_API_URL. Set a full URL like https://api.yourdomain.com and rebuild."
      );
    }

    if (
      process.env.NODE_ENV === "production" &&
      (parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1" ||
        parsed.hostname === "::1")
    ) {
      throw new Error(
        `Invalid NEXT_PUBLIC_API_URL for production: ${configured}. Do not use localhost in deployed frontend builds.`
      );
    }

    return configured.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Missing NEXT_PUBLIC_API_URL in production. Set it in your frontend deployment environment and rebuild."
    );
  }

  return LOCAL_DEV_API_URL;
}

export const getApiBaseUrl = () => resolveApiBaseUrl();

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

export type UploadProgress = {
  loaded: number;
  total: number | null;
  percent: number | null;
};

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof Error && error.name === "AbortError") {
    return new ApiError(
      "The request timed out or was aborted. For large uploads, increase NEXT_PUBLIC_API_FORM_TIMEOUT_MS; for other API calls, increase NEXT_PUBLIC_API_TIMEOUT_MS.",
      0,
      null,
      true
    );
  }
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

function getErrorMessage(payload: unknown, fallback: string, status?: number): string {
  if (status === 413) {
    return "Upload too large. Reduce file size or increase nginx client_max_body_size.";
  }

  const sanitizeMessage = (message: string): string => {
    const trimmed = message.trim();
    if (trimmed.startsWith("<") || /<html|<body|<head|<center/i.test(trimmed)) {
      return "Server is temporarily unavailable. Please try again in a moment.";
    }
    return message;
  };

  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof (payload as { message?: unknown }).message === "string"
  ) {
    return sanitizeMessage((payload as { message: string }).message);
  }
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    Array.isArray((payload as { message?: unknown }).message)
  ) {
    return sanitizeMessage((payload as { message: string[] }).message.join(", "));
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
      getErrorMessage(data, `Request failed with status ${res.status}`, res.status),
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
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers ?? {});
  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
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
  const timeout = setTimeout(() => controller.abort(), FORM_REQUEST_TIMEOUT_MS);
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

export function apiFormRequestWithProgress<T>(
  path: string,
  method: "POST" | "PATCH" | "PUT",
  formData: FormData,
  onProgress?: (progress: UploadProgress) => void
): Promise<T> {
  if (typeof XMLHttpRequest === "undefined") {
    return apiFormRequest<T>(path, method, formData);
  }

  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${getApiBaseUrl()}${path}`;

    xhr.open(method, url, true);
    xhr.withCredentials = true;
    xhr.timeout = FORM_REQUEST_TIMEOUT_MS;

    xhr.upload.onprogress = (event) => {
      if (!onProgress) return;
      const total = event.lengthComputable ? event.total : null;
      const percent =
        total && total > 0 ? Math.max(0, Math.min(100, Math.round((event.loaded * 100) / total))) : null;
      onProgress({ loaded: event.loaded, total, percent });
    };

    xhr.onload = () => {
      let payload: unknown = {};
      try {
        payload = xhr.responseText ? JSON.parse(xhr.responseText) : {};
      } catch {
        payload = { message: xhr.responseText || "" };
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(payload as T);
        return;
      }

      if (xhr.status === 401 || xhr.status === 403) {
        dispatchAuthExpired(path);
      }
      reject(
        new ApiError(
          getErrorMessage(payload, `Request failed with status ${xhr.status}`, xhr.status),
          xhr.status,
          payload,
          xhr.status === 0
        )
      );
    };

    xhr.onerror = () => reject(new ApiError("Network request failed", 0, null, true));
    xhr.onabort = () =>
      reject(
        new ApiError(
          "The request timed out or was aborted. For large uploads, increase NEXT_PUBLIC_API_FORM_TIMEOUT_MS; for other API calls, increase NEXT_PUBLIC_API_TIMEOUT_MS.",
          0,
          null,
          true
        )
      );
    xhr.ontimeout = xhr.onabort;

    xhr.send(formData);
  });
}
