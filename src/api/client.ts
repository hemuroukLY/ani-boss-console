import {
  clearAuthSession,
  getAuthState,
  isDevelopmentAuthBypassActive,
  updateAccessToken,
} from "@/components/auth/store";

interface ApiErrorPayload {
  code?: string;
  message?: string;
  request_id?: string;
  details?: unknown;
}

interface RefreshAccessTokenResponse {
  access_token: string;
  expires_in?: number;
}

export const API_BASE = "/api/v1";

let refreshRequest:
  | { refreshToken: string; promise: Promise<RefreshAccessTokenResponse> }
  | undefined;

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly requestId?: string;
  readonly details?: unknown;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message || `请求失败（HTTP ${status}）`);
    this.name = "ApiError";
    this.status = status;
    this.code = payload.code;
    this.requestId = payload.request_id;
    this.details = payload.details;
  }
}

async function readResponseBody(response: Response) {
  if (response.status === 204) return undefined;

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || undefined;
}

function apiErrorFromBody(status: number, body: unknown) {
  const payload =
    body && typeof body === "object"
      ? (body as ApiErrorPayload)
      : { message: typeof body === "string" ? body : undefined };
  return new ApiError(status, payload);
}

function isPublicAuthPath(path: string) {
  return path === "/auth/platform/password/login" || path === "/auth/refresh";
}

async function requestAccessTokenRefresh(refreshToken: string) {
  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      refresh_token: refreshToken,
      idempotency_key: crypto.randomUUID(),
    }),
  });
  const body = await readResponseBody(response);
  if (!response.ok) throw apiErrorFromBody(response.status, body);

  const data = body as RefreshAccessTokenResponse;
  if (!data?.access_token) {
    throw new Error("刷新令牌响应缺少 access_token");
  }
  return data;
}

function refreshAccessToken(refreshToken: string) {
  if (refreshRequest?.refreshToken === refreshToken) {
    return refreshRequest.promise;
  }

  const promise = requestAccessTokenRefresh(refreshToken).finally(() => {
    if (refreshRequest?.promise === promise) refreshRequest = undefined;
  });
  refreshRequest = { refreshToken, promise };
  return promise;
}

export function redirectToLogin() {
  if (typeof window === "undefined" || window.location.pathname.startsWith("/login")) {
    return;
  }
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.assign(`/login?redirect=${encodeURIComponent(current)}`);
}

export function expireAuthSession() {
  clearAuthSession();
  redirectToLogin();
}

function createRequestHeaders(init: RequestInit, accessToken?: string) {
  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  return headers;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const isPublicRequest = isPublicAuthPath(path);
  const send = (accessToken?: string) =>
    fetch(`${API_BASE}${path}`, {
      ...init,
      headers: createRequestHeaders(init, isPublicRequest ? undefined : accessToken),
      credentials: "include",
    });

  let response = await send(getAuthState().tokens?.access_token);

  if (response.status === 401 && !isPublicRequest && !isDevelopmentAuthBypassActive()) {
    const refreshToken = getAuthState().tokens?.refresh_token;
    if (!refreshToken) {
      expireAuthSession();
    } else {
      try {
        const refreshed = await refreshAccessToken(refreshToken);
        updateAccessToken(refreshed.access_token, refreshed.expires_in);
        response = await send(refreshed.access_token);
        if (response.status === 401) expireAuthSession();
      } catch {
        expireAuthSession();
      }
    }
  }

  if (!response.ok) {
    const body = await readResponseBody(response);
    throw apiErrorFromBody(response.status, body);
  }

  return response;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await apiFetch(path, init);
  const body = await readResponseBody(response);
  return body as T;
}

export function getApiErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "请求失败，请稍后重试";
}
