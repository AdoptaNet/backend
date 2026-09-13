import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { EmailAlreadyInUseException } from '../../domain/exceptions/email-already-in-use.exception';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { RegisterDto } from '../dtos/register.dto';
import { HashingService } from '../interfaces/hashing.service';
import { TokenService } from '../interfaces/token.service';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new EmailAlreadyInUseException(dto.email);
    }

    const passwordHash = await this.hashingService.hash(dto.password);

    const user = this.userRepository.create({
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      fullName: dto.fullName ?? null,
      role: UserRole.ADOPTER,
    });

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
        createdAt: savedUser.createdAt,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
