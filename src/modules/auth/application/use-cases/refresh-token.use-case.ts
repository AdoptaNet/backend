import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { HashingService } from '../interfaces/hashing.service';
import { TokenService } from '../interfaces/token.service';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    const payload = await this.tokenService.verifyRefreshToken(
      dto.refreshToken,
    );

    const user = await this.userRepository.findById(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Sesión no válida');
    }

    const isTokenMatching = await this.hashingService.compare(
      dto.refreshToken,
      user.refreshTokenHash,
    );
    if (!isTokenMatching) {
      user.refreshTokenHash = null;
      await this.userRepository.save(user);
      throw new UnauthorizedException(
        'Token de refresco revocado o reutilizado',
      );
    }

    const tokens = await this.tokenService.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    user.refreshTokenHash = await this.hashingService.hash(tokens.refreshToken);
    await this.userRepository.save(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
