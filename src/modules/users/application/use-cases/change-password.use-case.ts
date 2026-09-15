import { Injectable } from '@nestjs/common';
import { HashingService } from '../../../auth/application/interfaces/hashing.service';
import { InvalidCurrentPasswordException } from '../../domain/exceptions/invalid-current-password.exception';
import { PasswordNotSetException } from '../../domain/exceptions/password-not-set.exception';
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

    if (!user.passwordHash) {
      throw new PasswordNotSetException();
    }

    const isMatch = await this.hashingService.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isMatch) {
      throw new InvalidCurrentPasswordException();
    }

    user.passwordHash = await this.hashingService.hash(dto.newPassword);
    await this.userRepository.save(user);

    return { message: 'Contraseña actualizada exitosamente' };
  }
}
