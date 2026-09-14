import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import {
  AuthTokens,
  TokenPayload,
  TokenService,
} from '../../application/interfaces/token.service';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(payload: TokenPayload): Promise<AuthTokens> {
    const accessTokenSecret = this.configService.get<string>('JWT_SECRET');
    const refreshTokenSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET');

    if (!accessTokenSecret || !refreshTokenSecret) {
      throw new Error('JWT secrets are not properly configured in environment');
    }

    const accessTokenExpiresIn: JwtSignOptions['expiresIn'] =
      (this.configService.get<string>(
        'JWT_EXPIRES_IN',
      ) as JwtSignOptions['expiresIn']) ?? '15m';
    const refreshTokenExpiresIn: JwtSignOptions['expiresIn'] =
      (this.configService.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
      ) as JwtSignOptions['expiresIn']) ?? '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: payload.sub, email: payload.email, role: payload.role },
        {
          secret: accessTokenSecret,
          expiresIn: accessTokenExpiresIn,
        },
      ),
      this.jwtService.signAsync(
        { sub: payload.sub, email: payload.email, role: payload.role },
        {
          secret: refreshTokenSecret,
          expiresIn: refreshTokenExpiresIn,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    const refreshTokenSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshTokenSecret) {
      throw new Error('JWT_REFRESH_SECRET is not configured in environment');
    }

    try {
      const decoded = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: refreshTokenSecret,
      });
      return decoded;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
