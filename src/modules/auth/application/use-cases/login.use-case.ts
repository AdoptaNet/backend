import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { EmailNotVerifiedException } from '../../domain/exceptions/email-not-verified.exception';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { LoginDto } from '../dtos/login.dto';
import { HashingService } from '../interfaces/hashing.service';
import { TokenService } from '../interfaces/token.service';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmail(
      dto.email.toLowerCase().trim(),
    );

    // US-03 Escenario 2: Denegación de acceso si cuenta no existe, inactiva o dada de baja
    if (!user || !user.passwordHash || !user.isActive || user.deletedAt) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await this.hashingService.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    // US-01 Escenario 4: Bloqueo de inicio de sesión si el correo no está verificado (403)
    if (!user.isEmailVerified) {
      throw new EmailNotVerifiedException(
        'Debe verificar su correo electrónico antes de ingresar',
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
        roleSelected: user.roleSelected,
        createdAt: user.createdAt,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
