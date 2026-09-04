import { apiRequest } from "@/api/client";
import { getAccessTokenJti, type AuthTokens } from "@/components/auth/store";

interface PlatformLoginInput {
  username: string;
  password: string;
}

interface LogoutResponse {
  status: string;
}

export async function loginPlatform(input: PlatformLoginInput) {
  const tokens = await apiRequest<AuthTokens>(
    "/auth/platform/password/login",
    {
      method: "POST",
      body: JSON.stringify({
        username: input.username.trim(),
        password: input.password,
        idempotency_key: crypto.randomUUID(),
      }),
    },
  );
  if (!tokens?.access_token || !tokens.refresh_token) {
    throw new Error("登录响应缺少令牌");
  }
  return tokens;
}

export function logoutPlatform() {
  const jti = getAccessTokenJti();
  if (!jti) return Promise.resolve<LogoutResponse>({ status: "local-only" });

  return apiRequest<LogoutResponse>("/auth/logout", {
    method: "POST",
    body: JSON.stringify({
      jti,
      idempotency_key: crypto.randomUUID(),
    }),
  });
}
