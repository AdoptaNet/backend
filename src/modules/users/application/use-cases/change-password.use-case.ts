import { Injectable } from '@nestjs/common';
import { HashingService } from '../../../auth/application/interfaces/hashing.service';
import { InvalidCurrentPasswordException } from '../../domain/exceptions/invalid-current-password.exception';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { UserRepository } from '../../domain/repositories/user.repository';
import { ChangePasswordDto } from '../dtos/change-password.dto';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
  ) {}

  async execute(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // Si el usuario ya tiene contraseña configurada, se exige y valida la contraseña actual
    if (user.passwordHash !== null) {
      if (!dto.currentPassword) {
        throw new InvalidCurrentPasswordException(
          'Debes ingresar tu contraseña actual para cambiarla.',
        );
      }

      const isMatch = await this.hashingService.compare(
        dto.currentPassword,
        user.passwordHash,
      );
      if (!isMatch) {
        throw new InvalidCurrentPasswordException(
          'La contraseña actual ingresada es incorrecta.',
        );
      }
    }
    // US-04 Escenario 4: Si user.passwordHash === null (usuario Google), se permite asignar la contraseña directamente

    user.passwordHash = await this.hashingService.hash(dto.newPassword);
    // Revocar sesiones activas para forzar nuevo inicio de sesión seguro
    user.refreshTokenHash = null;

    await this.userRepository.save(user);

    return { message: 'Contraseña actualizada exitosamente' };
  }
}
