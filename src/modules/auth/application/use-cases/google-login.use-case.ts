import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AdopterProfileRepository } from '../../../users/domain/repositories/adopter-profile.repository';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
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
    private readonly adopterProfileRepository: AdopterProfileRepository,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly eventEmitter: EventEmitter2,
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
        user.googleId = profile.googleId;
        if (!user.avatarUrl && profile.avatarUrl) {
          user.avatarUrl = profile.avatarUrl;
        }
        if (!user.fullName && profile.fullName) {
          user.fullName = profile.fullName;
        }
      } else {
        isNewUser = true;
        user = this.userRepository.create({
          googleId: profile.googleId,
          email: profile.email.toLowerCase().trim(),
          fullName: profile.fullName ?? null,
          avatarUrl: profile.avatarUrl ?? null,
          role: UserRole.ADOPTER,
          roleSelected: false,
        });
      }
    }

    const savedUser = await this.userRepository.save(user);

    if (isNewUser) {
      const adopterProfile = this.adopterProfileRepository.create({
        userId: savedUser.id,
      });
      await this.adopterProfileRepository.save(adopterProfile);
    }

    const tokens = await this.tokenService.generateTokens({
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    });

    savedUser.refreshTokenHash = await this.hashingService.hash(
      tokens.refreshToken,
    );
    await this.userRepository.save(savedUser);

    if (isNewUser) {
      this.eventEmitter.emit(
        UserRegisteredEvent.EVENT_NAME,
        new UserRegisteredEvent(
          savedUser.id,
          savedUser.email,
          savedUser.fullName,
          savedUser.role,
        ),
      );
    }

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
