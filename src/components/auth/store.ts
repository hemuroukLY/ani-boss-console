import { useSyncExternalStore } from "react";
import type { AuthTokens } from "@/api/auth/types";

interface AuthState {
  tokens: AuthTokens | null;
  username: string;
  developmentBypass: boolean;
}

const STORAGE_KEY = "ani-platform-console-auth";
const EMPTY_STATE: AuthState = {
  tokens: null,
  username: "",
  developmentBypass: false,
};

function readStoredState(): AuthState {
  if (typeof window === "undefined") return EMPTY_STATE;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const stored = JSON.parse(raw) as Partial<AuthState>;
    const tokens = stored.tokens;
    return {
      tokens:
        tokens?.access_token && tokens.refresh_token
          ? {
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              expires_in: tokens.expires_in,
              issued_at: tokens.issued_at,
            }
          : null,
      username: typeof stored.username === "string" ? stored.username : "",
      developmentBypass: import.meta.env.DEV && stored.developmentBypass === true,
    };
  } catch {
    return EMPTY_STATE;
  }
}

let state = readStoredState();
const listeners = new Set<() => void>();

function publish(nextState: AuthState) {
  state = nextState;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAuthState() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}

export function getAuthState() {
  return state;
}

export function setAuthSession(tokens: AuthTokens, username: string) {
  publish({
    tokens,
    username: username.trim(),
    developmentBypass: false,
  });
}

export function updateAccessToken(accessToken: string, expiresIn?: number) {
  if (!state.tokens) return;
  publish({
    ...state,
    tokens: {
      ...state.tokens,
      access_token: accessToken,
      expires_in: expiresIn,
    },
  });
}

export function setDevelopmentAuthBypass(enabled: boolean) {
  publish({
    ...state,
    developmentBypass: import.meta.env.DEV && enabled,
  });
}

export function clearAuthSession() {
  state = EMPTY_STATE;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  listeners.forEach((listener) => listener());
}

export function isDevelopmentAuthBypassActive() {
  return import.meta.env.DEV && state.developmentBypass;
}

export function isAuthenticated() {
  return Boolean(state.tokens?.access_token) || isDevelopmentAuthBypassActive();
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getAccessTokenJti() {
  const token = state.tokens?.access_token;
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  return typeof payload?.jti === "string" && payload.jti ? payload.jti : null;
}
