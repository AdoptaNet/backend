import { Injectable } from '@nestjs/common';
import { HashingService } from '../../../auth/application/interfaces/hashing.service';
import { MediaService } from '../../../media/application/interfaces/media.service';
import { PetRepository } from '../../../pets/domain/repositories/pet.repository';
import { PetStatus } from '../../../pets/domain/value-objects/pet-status.enum';
import { AccountDeletionBlockedException } from '../../domain/exceptions/account-deletion-blocked.exception';
import { InvalidCurrentPasswordException } from '../../domain/exceptions/invalid-current-password.exception';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserRole } from '../../domain/value-objects/user-role.enum';
import { DeleteAccountDto } from '../dtos/delete-account.dto';

@Injectable()
export class DeleteAccountUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly petRepository: PetRepository,
    private readonly mediaService: MediaService,
    private readonly hashingService: HashingService,
  ) {}

  async execute(
    userId: string,
    dto?: DeleteAccountDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // Validación de seguridad: confirmación de contraseña si la cuenta fue creada con password
    if (user.passwordHash !== null) {
      if (!dto?.password) {
        throw new InvalidCurrentPasswordException(
          'Debes ingresar tu contraseña para confirmar la eliminación definitiva de tu cuenta.',
        );
      }

      const isMatch = await this.hashingService.compare(
        dto.password,
        user.passwordHash,
      );
      if (!isMatch) {
        throw new InvalidCurrentPasswordException(
          'Contraseña incorrecta. No se pudo procesar la baja de la cuenta.',
        );
      }
    }

    // US-05 Escenario 2: Bloqueo de baja si el albergue tiene animales en estado available o in_process
    if (user.role === UserRole.SHELTER) {
      const [, availableCount] = await this.petRepository.findByShelter(
        userId,
        { status: PetStatus.AVAILABLE },
      );
      const [, inProcessCount] = await this.petRepository.findByShelter(
        userId,
        { status: PetStatus.IN_PROCESS },
      );

      if (availableCount > 0 || inProcessCount > 0) {
        throw new AccountDeletionBlockedException(
          'No puede darse de baja mientras existan animales publicados sin traspaso formal o en proceso de adopción.',
        );
      }
    }

    // Borrado físico de imagen de perfil en Cloudinary si existiera
    if (user.avatarKey) {
      try {
        await this.mediaService.deleteImage(user.avatarKey);
      } catch {
        // Se continúa con la anonimización aún si la imagen ya no existe en el storage
      }
    }

    // US-05 Escenario 1: Soft delete y anonimización irreversible (Ley N° 29733)
    user.isActive = false;
    user.deletedAt = new Date();
    user.email = `anon_${user.id}@deleted.adoptanet.pe`;
    user.fullName = 'Usuario Eliminado';
    user.avatarUrl = null;
    user.avatarKey = null;
    user.googleId = null;
    user.passwordHash = null;
    user.refreshTokenHash = null;

    await this.userRepository.save(user);

    return {
      message:
        'Cuenta dada de baja y datos personales anonimizados exitosamente conforme a la Ley N° 29733.',
    };
  }
}
