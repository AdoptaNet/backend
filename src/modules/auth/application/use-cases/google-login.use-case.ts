import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { HashingService } from '../interfaces/hashing.service';
import { TokenService } from '../interfaces/token.service';

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
}

@Injectable()
export class GoogleLoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(profile: GoogleUserProfile): Promise<AuthResponseDto> {
    let user: User | null = await this.userRepository.findByGoogleId(
      profile.googleId,
    );

    let isNewUser = false;

    if (!user) {
      user = await this.userRepository.findByEmail(
        profile.email.toLowerCase().trim(),
      );

      if (user) {
        // US-02 Escenario 4: Vinculación automática por email preexistente
        user.googleId = profile.googleId;
        user.isEmailVerified = true;
        if (!user.emailVerifiedAt) {
          user.emailVerifiedAt = new Date();
        }
        if (!user.avatarUrl && profile.avatarUrl) {
          user.avatarUrl = profile.avatarUrl;
        }
        if (!user.fullName && profile.fullName) {
          user.fullName = profile.fullName;
        }
      } else {
        // US-02 Escenario 1: Registro por primera vez con Google
        isNewUser = true;
        user = this.userRepository.create({
          googleId: profile.googleId,
          email: profile.email.toLowerCase().trim(),
          fullName: profile.fullName ?? null,
          avatarUrl: profile.avatarUrl ?? null,
          role: UserRole.ADOPTER,
          roleSelected: false,
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
          isActive: true,
        });
      }
    }

    const savedUser = await this.userRepository.save(user);

    const tokens = await this.tokenService.generateTokens({
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    });

    savedUser.refreshTokenHash = await this.hashingService.hash(
      tokens.refreshToken,
    );
    await this.userRepository.save(savedUser);

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        fullName: savedUser.fullName,
        avatarUrl: savedUser.avatarUrl,
        role: savedUser.role,
        roleSelected: savedUser.roleSelected,
        createdAt: savedUser.createdAt,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isNewUser,
    };
  }
}
