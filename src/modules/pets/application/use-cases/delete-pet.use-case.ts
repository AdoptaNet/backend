import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { PetAccessForbiddenException } from '../../domain/exceptions/pet-access-forbidden.exception';
import { PetNotFoundException } from '../../domain/exceptions/pet-not-found.exception';
import { PetRepository } from '../../domain/repositories/pet.repository';

@Injectable()
export class DeletePetUseCase {
  constructor(private readonly petRepository: PetRepository) {}

  async execute(id: string, user: User): Promise<void> {
    const pet = await this.petRepository.findById(id);
    if (!pet) {
      throw new PetNotFoundException(id);
    }

    if (pet.shelterId !== user.id && user.role !== UserRole.ADMIN) {
      throw new PetAccessForbiddenException(
        'No tienes permisos para eliminar esta mascota',
      );
    }

    await this.petRepository.softDelete(id);
  }
}
