export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export abstract class TokenService {
  abstract generateTokens(payload: TokenPayload): Promise<AuthTokens>;
  abstract verifyRefreshToken(token: string): Promise<TokenPayload>;
}
