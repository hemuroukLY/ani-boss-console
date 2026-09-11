export interface ParsedApiError {
  status?: number;
  code?: string;
  message?: string;
  requestId?: string;
  details?: Record<string, unknown>;
}

export function parseApiError(error: unknown): ParsedApiError {
  if (error && typeof error === "object") {
    const candidate = error as Record<string, unknown>;
    return {
      status: typeof candidate.status === "number" ? candidate.status : undefined,
      code: typeof candidate.code === "string" ? candidate.code : undefined,
      message: typeof candidate.message === "string" ? candidate.message : undefined,
      requestId:
        typeof candidate.requestId === "string"
          ? candidate.requestId
          : typeof candidate.request_id === "string"
            ? candidate.request_id
            : undefined,
      details:
        candidate.details && typeof candidate.details === "object"
          ? (candidate.details as Record<string, unknown>)
          : undefined,
    };
  }
  return error instanceof Error ? { message: error.message } : {};
}

export function getApiErrorMessage(error: unknown, fallback = "请求失败，请稍后重试"): string {
  return parseApiError(error).message || fallback;
}
