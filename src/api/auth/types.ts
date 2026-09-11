export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  issued_at?: string;
}

export interface PlatformLoginInput {
  username: string;
  password: string;
}

export interface LogoutResponse {
  status: string;
}
